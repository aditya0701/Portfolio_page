// Cloudflare Worker: receives a visit beacon from the portfolio and forwards
// a short message to a private Telegram chat. The bot token lives here as a
// secret so it never ships in the public site bundle.

const ALLOWED_ORIGINS = new Set([
  "https://adityarawat.de",
  "https://www.adityarawat.de",
]);

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|monitor|curl|wget|python-requests/i;

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("ok");

    // Only accept beacons that come from the real site.
    if (!ALLOWED_ORIGINS.has(request.headers.get("Origin"))) {
      return new Response("forbidden", { status: 403 });
    }

    const ua = request.headers.get("User-Agent") ?? "";
    if (BOT_UA.test(ua)) return new Response("ignored");

    // Country only. No IP, city, network, browser or page is forwarded.
    const code = request.cf?.country;
    let country = "unknown country";
    try {
      if (code) country = new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
    } catch {
      country = code;
    }
    const text = `👀 Someone opened the portfolio
🌍 ${country}`;

    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
    });
    return new Response(res.ok ? "sent" : "telegram error", { status: res.ok ? 200 : 502 });
  },
};
