/** Anmeldelinks aus dem lokalen Mail-Fänger (Mailpit von `supabase start`). */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324';

export async function latestLink(to: string, after: number): Promise<string> {
  for (let i = 0; i < 40; i++) {
    const list = (await (
      await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`)
    ).json()) as {
      messages: { ID: string; Created: string }[];
    };
    const fresh = list.messages.filter((m) => Date.parse(m.Created) >= after);
    if (fresh.length) {
      const msg = (await (await fetch(`${MAILPIT}/api/v1/message/${fresh[0]!.ID}`)).json()) as {
        HTML: string;
      };
      const href = /href="([^"]*\/auth\/confirm[^"]*)"/.exec(msg.HTML)?.[1];
      if (href) return href.replace(/&amp;/g, '&');
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Keine E-Mail mit Anmeldelink an ${to}`);
}
