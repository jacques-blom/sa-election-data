/** The displayed election can differ from the page originally opened. */
export function resultsUrl() {
  const url = new URL(location.href);
  const displayed = document.querySelector<HTMLElement>('#main')?.dataset.resultsUrl;
  if (displayed) url.pathname = new URL(displayed, url).pathname;
  return url;
}
