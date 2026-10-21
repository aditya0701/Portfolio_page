// Sends an empty ping to the private visit-notifier Worker on page load.
// Nothing is read from or written to the visitor's device, and no data is
// sent. Does nothing unless VITE_NOTIFY_URL is set at build time, so local
// dev and forks of the repo stay silent.

const ENDPOINT = import.meta.env.VITE_NOTIFY_URL as string | undefined;
const OWNER_KEY = "ar-owner";

export function notifyVisit(): void {
  if (!ENDPOINT) return;
  try {
    // Visit the site once with ?me to mute your own browser; ?me=off undoes it.
    // This only ever touches the owner's own browser storage.
    const me = new URLSearchParams(location.search).get("me");
    if (me === "off") localStorage.removeItem(OWNER_KEY);
    else if (me !== null) localStorage.setItem(OWNER_KEY, "1");
    if (localStorage.getItem(OWNER_KEY)) return;
  } catch {
    // Storage blocked: carry on and ping anyway.
  }
  fetch(ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true }).catch(() => {});
}
