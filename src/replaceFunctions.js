import { substitute, BS_REGEX } from "./constants";

/**
 * A nice replace of dictionary to be Pareto-friendly.
 * see https://stackoverflow.com/a/44475397:
 */
export function replaceChars(domain) {
  return domain
    .replace(/[_123456789kbjyhnqxzfv]/g, (c) => substitute[c])
    .replace(/[^\.\-0-9a-z]/g, "?");
}

/**
 * A nice replace of numbers and BS - this is what you want :)
 */
export function replaceNice(domain) {
  return domain
    .replace(/[_123456789]/g, (c) => substitute[c])
    .replace(/[^\.\-0-9a-z]/g, "?");
}

/**
 * A nice replace of bullshits - doesn't apply substitutions!
 * see https://stackoverflow.com/a/44475397:
 */
export function replaceBS(domain) {
  return domain.replace(BS_REGEX, "?");
}

/**
 * escapes html tags in a string
 *
 * @param {string} str to be parsed using regex
 * @returns {string} returns string with escaped html tags
 */

// https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
export function escapeHTML(str) {
  // Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
  // Most often this is not the case though.
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}