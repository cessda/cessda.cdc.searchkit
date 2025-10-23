/** Matches all characters in a regex that should be escaped */
const regexEscape = /[/\-\\^$*+?.()|[\]{}]/g;

export function escapeRegex(string: string) {
  return string.replace(regexEscape, "\\$&");
}
