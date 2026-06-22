// User-facing labels for the ChannelType enum (kept in sync with the API's
// prisma `ChannelType`). The enum value stays the wire format; this is display-only.
export const CHANNEL_TYPE_LABELS: Record<string, string> = {
  email: "Email",
  efax: "eFax",
  sftp: "SFTP",
  fhir: "FHIR",
  hl7: "HL7",
  secure_msg: "Secure messaging",
};

export function channelTypeLabel(type: string): string {
  return CHANNEL_TYPE_LABELS[type] ?? type;
}
