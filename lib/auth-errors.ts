type Translate = (key: string) => string;

export function friendlyAuthError(error: unknown, t: Translate): string {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const lower = message.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("fetch failed") ||
    lower.includes("load failed") ||
    lower.includes("networkerror")
  ) {
    return t("serverUnavailable");
  }
  if (lower.includes("invalid login credentials")) return t("invalidCredentials");
  if (lower.includes("email not confirmed")) return t("emailNotConfirmed");
  if (lower.includes("already registered")) return t("alreadyRegistered");
  return message || t("genericError");
}
