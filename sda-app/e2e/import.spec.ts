import { expect, test } from '@playwright/test';
import { loadLegacy } from '../scripts/legacy-runtime';

test('Daten aus der alten Version übernehmen: prüfen, dann importieren', async ({ page }, info) => {
  const name = `Import ${info.project.name}`;
  // Export genau so, wie ihn die alte Version erzeugt
  const exportText = loadLegacy().run<string>(`(function(){
    putRec("students",{id:"x1",name:${JSON.stringify(name)},level:"B1",start:"2026-01-05",module:"2",skills:{gr:3},strengths:"",weaknesses:"",goals:""});
    putRec("docs",{id:"y1",date:"2026-01-06",teacher:"Lehrkraft 2",level:"B1",lessonId:"B1.2.Mo",present:["x1"],absent:[],covered:"Thema",canNow:"",errors:"",homework:"",next:"",material:"",problems:""});
    putRec("errors",{id:"z1",student:"x1",date:"2026-01-06",error:"Fehlertext Import",correction:"Korrektur",category:"Satzbau",status:"wiederholen"});
    return JSON.stringify(DATA);
  })()`);
  await page.goto('/einstellungen');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Export aus der alten Version').fill(exportText);
  await expect(page.getByRole('button', { name: 'Importieren' })).toBeDisabled();
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Wird übernommen' })).toContainText(
    '1 Schüler, 1 Dokumentationen, 1 Fehler',
  );
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Importieren' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Übernommen:' })).toBeVisible();

  await page.goto('/fortschritt');
  const card = page.locator('li.card').filter({ hasText: name });
  await expect(card).toContainText('Übernommen B1');
  await expect(card).toContainText('100 % (1 von 1)');
  await page.goto('/fehler?status=wiederholen');
  await expect(page.locator('li').filter({ hasText: name })).toContainText('Fehlertext Import');
});
