// Mirror of the backend register (clinidoc-api/src/common/sub-processors.ts).
// Keep in sync, or fetch from the API's read-only endpoint if/when exposed.
export const SUB_PROCESSORS = [
  { name: "Anthropic", purpose: "AI document field extraction", location: "United States" },
  { name: "AWS", purpose: "Hosting, database, object storage, backups", location: "Australia (Sydney)" },
  { name: "Telnyx", purpose: "Incoming/outbound fax", location: "United States" },
  { name: "SendGrid", purpose: "Transactional email", location: "United States" },
];
