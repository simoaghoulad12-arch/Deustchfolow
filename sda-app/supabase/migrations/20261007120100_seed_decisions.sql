-- Generiert von scripts/gen-decisions-sql.ts aus content/decisions.json – nicht von Hand ändern.
-- Startinhalt: die offenen Entscheidungen aus legacy/index.html (alle Status = offen).
insert into public.decisions (id, title, title_ar, sort_order) values
  ('dec#0', 'Name der Lehrkraft 2 festlegen', 'حدد اسم الأستاذ الثاني', 0),
  ('dec#1', 'Namen der Muttersprachler/innen festlegen; Vergütung oder ehrenamtlich klären', 'حدد أسماء الناطقين، وواش بمقابل ولا تطوع', 1),
  ('dec#2', 'Tage und Uhrzeiten festlegen (Marokko und Deutschland)', 'حدد الأيام والساعات (المغرب وألمانيا)', 2),
  ('dec#3', 'Zahlungsweg und monatlichen Zahlungstag festlegen', 'حدد طريقة الأداء ويوم الأداء الشهري', 3),
  ('dec#4', 'Maximale Gruppengröße festlegen (Vorschlag: 6–10)', 'حدد العدد الأقصى فالمجموعة (اقتراح: 6–10)', 4),
  ('dec#5', 'Zoom: Im kostenlosen Plan enden Gruppenmeetings ab 3 Personen nach 40 Minuten. Für 60- und 120-Minuten-Stunden Zoom Pro für den Host oder eine Alternative wählen und aktuelle Limits prüfen.', 'Zoom: فالنسخة المجانية الاجتماعات الجماعية كتوقف بعد 40 دقيقة. للحصص ديال 60 و120 دقيقة خاص Zoom Pro للمضيف ولا بديل، وشوفو الحدود الحالية.', 5),
  ('dec#6', 'Entscheiden: Ist die Probestunde kostenlos?', 'قرر: واش الحصة التجريبية مجانية؟', 6),
  ('dec#7', 'Regeln bei Absage, Kündigung und Erstattung festlegen', 'حدد قواعد الإلغاء والاسترجاع', 7),
  ('dec#8', 'Datenschutz: Einwilligung für Aufnahmen und Fotos, kurzer Text für Teilnehmer', 'حماية المعطيات: موافقة على التسجيل والصور ونص قصير للطلبة', 8),
  ('dec#9', 'Festlegen, wann die Bewerbungsbegleitung mit Alfred Schmitt beginnt', 'حدد متى كتبدا مرافقة ملف الخدمة مع Alfred Schmitt', 9),
  ('dec#10', 'Mission und Ziel der Akademie als Text festlegen', 'حددو نص المهمة والهدف ديال الأكاديمية', 10),
  ('dec#11', 'Kursdauer pro Level bestätigen (Vorschlag: A1 8, A2 8, B1 10, B2 10 Wochen)', 'أكدو مدة كل مستوى (اقتراح: 8، 8، 10، 10 أسابيع)', 11),
  ('dec#12', 'Tage der Sprechstunden bestätigen (Vorschlag: Freitag und Samstag)', 'أكدو أيام حصص التحدث (اقتراح: الجمعة والسبت)', 12),
  ('dec#13', 'Rollenwechsel bestätigen (Vorschlag: Lehrkraft 1 Mo + Mi, Lehrkraft 2 Di + Do)', 'أكدو تبادل الأدوار (اقتراح: الأول الإثنين والأربعاء، الثاني الثلاثاء والخميس)', 13),
  ('dec#14', 'Qualitätskontrolle: Häufigkeit von Tests, Monatsgesprächen und Reviews festlegen', 'حددو وتيرة الاختبارات والمقابلات والمراجعات', 14),
  ('dec#15', 'Warnschwellen festlegen: Anwesenheit, Hausaufgaben, fehlende Dokumentation', 'حددو حدود التنبيه: الحضور، الواجبات، غياب التوثيق', 15),
  ('dec#16', 'Festlegen, wer Schülerdaten im System sehen und ändern darf', 'حددو شكون يقدر يشوف ويبدل معطيات الطلبة', 16),
  ('dec#17', 'Inhalte für Ausbildung und Studium in Deutschland festlegen', 'حددو محتوى التكوين والدراسة فألمانيا', 17),
  ('dec#18', 'Internen Kommunikationskanal des Teams festlegen', 'حددو قناة التواصل الداخلي للفريق', 18),
  ('dec#19', 'Lehrwerk festlegen, mit dem die Akademie arbeitet', 'حددو الكتاب اللي غادي تخدم بيه الأكاديمية', 19),
  ('dec#20', 'Kontakte und Zahlungen: weiter in Google Sheets oder in diesem System?', 'جهات الاتصال والأداءات: فـ Google Sheets ولا فهاد النظام؟', 20)
on conflict (id) do nothing;
