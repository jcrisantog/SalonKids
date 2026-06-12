const GUIDELINES_KEY = "guidelines_notices";
const MAX_GUIDELINES_HTML_LENGTH = 30000;
const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "h2",
  "h3",
  "h4",
  "i",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "u",
  "ul",
]);
const VOID_TAGS = new Set(["br"]);
const BLOCKED_BLOCKS = /<(script|style|iframe|object|embed|svg|math|form|input|button|select|textarea|meta|link|base)[\s\S]*?<\/\1>/gi;
const BLOCKED_SELF_CLOSING = /<(script|style|iframe|object|embed|svg|math|form|input|button|select|textarea|meta|link|base)\b[^>]*\/?>/gi;
const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
const HREF_PATTERN = /\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

export type GuidelinesNoticesPayload = {
  html: string;
  hasContent: boolean;
};

export { GUIDELINES_KEY, MAX_GUIDELINES_HTML_LENGTH };

export function sanitizeGuidelinesHtml(input: unknown) {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .slice(0, MAX_GUIDELINES_HTML_LENGTH)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(BLOCKED_BLOCKS, "")
    .replace(BLOCKED_SELF_CLOSING, "")
    .replace(TAG_PATTERN, (fullTag, rawTagName: string, rawAttributes: string) => {
      const tagName = rawTagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tagName)) {
        return "";
      }

      if (fullTag.startsWith("</")) {
        return VOID_TAGS.has(tagName) ? "" : `</${tagName}>`;
      }

      if (tagName === "a") {
        const href = getSafeHref(rawAttributes);

        return href
          ? `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">`
          : "<a>";
      }

      if (VOID_TAGS.has(tagName)) {
        return `<${tagName}>`;
      }

      return `<${tagName}>`;
    })
    .replace(/\sdata:[^<\s]+/gi, " ");
}

export function hasGuidelinesContent(html: string) {
  const visibleText = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return visibleText.length > 0;
}

export function normalizeGuidelinesHtml(input: unknown): GuidelinesNoticesPayload {
  const html = sanitizeGuidelinesHtml(input);

  return {
    html: hasGuidelinesContent(html) ? html : "",
    hasContent: hasGuidelinesContent(html),
  };
}

function getSafeHref(attributes: string) {
  const match = attributes.match(HREF_PATTERN);
  const href = (match?.[2] ?? match?.[3] ?? match?.[4] ?? "").trim();

  if (!href) {
    return "";
  }

  const normalized = href.replace(/[\u0000-\u001F\u007F\s]+/g, "");

  if (
    normalized.startsWith("/") ||
    normalized.startsWith("#") ||
    /^https?:\/\//i.test(normalized) ||
    /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(normalized) ||
    /^tel:[+0-9().-]+$/i.test(normalized)
  ) {
    return normalized;
  }

  return "";
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
