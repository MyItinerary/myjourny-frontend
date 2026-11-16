/**
 * Previewing a listing that isn't live. Helm and the host dashboard get a
 * short-lived token from itin and open /experiences/{id}/preview#t=<token>.
 * While that page is open, the token goes in a header on the requests that
 * read that one experience, so itin shows it whatever its status.
 */

export const PREVIEW_HEADER = "X-Preview-Token";

let active: { id: string; token: string } | null = null;

export function setActivePreview(preview: { id: string; token: string } | null) {
  active = preview;
}

/** The preview token to send with a request, if it reads the experience being previewed. */
export function previewTokenFor(url: string | undefined): string | null {
  if (!active || !url) return null;
  const path = url.split("?")[0];
  const reads = path === `/experiences/${active.id}` || path.startsWith(`/experiences/${active.id}/`);
  return reads || path === "/bookings/quote" ? active.token : null;
}

export const previewPath = (id: string, token: string) =>
  `/experiences/${id}/preview#t=${encodeURIComponent(token)}`;

const storageKey = (id: string) => `myjourny:preview:${id}`;

const hashToken = () => new URLSearchParams(window.location.hash.slice(1)).get("t");

/** The token from the link's #t=…, kept for this tab so a reload still
 * works. Null when there isn't one. */
export function takePreviewToken(id: string): string | null {
  const fromHash = hashToken();
  try {
    if (fromHash) sessionStorage.setItem(storageKey(id), fromHash);
    else return sessionStorage.getItem(storageKey(id));
  } catch {
    // Storage can be off (private mode); the hash still works for this load.
  }
  return fromHash;
}

/** Takes the token off the address bar, so it isn't copied along with the link. */
export function stripPreviewHash() {
  if (hashToken()) window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

/**
 * Opens the preview in a new tab. The tab is opened straight away, before the
 * token arrives, so the browser treats it as the click's own popup.
 */
export async function openExperiencePreview(id: string, getToken: (id: string) => Promise<string>) {
  const tab = window.open("", "_blank");
  if (tab) tab.opener = null;
  try {
    const token = await getToken(id);
    const url = previewPath(id, token);
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener");
  } catch (error) {
    tab?.close();
    throw error;
  }
}
