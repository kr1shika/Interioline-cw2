import DOMPurify from "dompurify";

export function sanitizeUserInput(input) {
  if (typeof input !== "string") return input;

  const clean = DOMPurify.sanitize(input);
  const blacklist = /('|--|;|\/\*|\*\/|select|insert|delete|update|drop|union)/i;

  if (blacklist.test(clean)) {
    throw new Error("Suspicious input blocked for security.");
  }

  return clean.trim();
}
