import DOMPurify from "dompurify";

export function sanitizeUserInput(input) {
  if (typeof input !== "string") return input;

  let clean = DOMPurify.sanitize(input);

  clean = clean.trim();

  const nosqlPattern = /\$ne|\$gt|\$gte|\$lt|\$lte|\$or|\$and|\$not|\$where|\$regex|sleep|eval|function|new\s+Function/gi;
  if (nosqlPattern.test(clean)) {
    throw new Error("Blocked dangerous NoSQL input");
  }

  // const sqlPattern = /\b(select|insert|delete|update|drop|union|--|;)\b/i;
  // if (sqlPattern.test(clean)) {
  //   throw new Error("Suspicious SQL keyword detected");
  // }

  return clean;
}
