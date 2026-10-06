export function safeReturnPath(value: unknown) {
  if (typeof value !== "string") return "/account";
  // A small allowlist also avoids protocol-relative and encoded redirect tricks.
  return ["/checkout", "/account", "/admin"].includes(value)
    ? value
    : "/account";
}
