/** Persist the chosen UI language in a cookie and reload so the server
 *  (getRequestConfig) re-renders the tree in the new locale. */
export function setLocaleCookie(code: string) {
  document.cookie = `locale=${code};path=/;max-age=31536000`;
  window.location.reload();
}
