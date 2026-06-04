import "server-only";

export function getContactInboxEmail(): string {
  return (
    process.env.CONTACT_EMAIL?.trim() ||
    process.env.SUPPORT_EMAIL?.trim() ||
    "support@ichingoracle.de"
  );
}
