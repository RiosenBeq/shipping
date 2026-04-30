import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Serves /.well-known/security.txt per RFC 9116.
 * Provides a contact + policy URL for security researchers.
 *
 * The Expires field is required and must be in the future. We re-issue
 * it 1 year out on every build, which is what RFC 9116 §2.5.5 recommends
 * for mostly-static deployments.
 */
export function GET() {
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  expires.setUTCHours(0, 0, 0, 0);

  const body = `# LEVANTER security disclosure
# Per RFC 9116 — https://www.rfc-editor.org/rfc/rfc9116

Contact: mailto:security@${siteConfig.url.replace(/^https?:\/\//, "")}
Contact: ${siteConfig.url}/contact
Expires: ${expires.toISOString()}
Preferred-Languages: en, tr
Canonical: ${siteConfig.url}/.well-known/security.txt
Policy: ${siteConfig.url}/security-policy
Acknowledgments: ${siteConfig.url}/security-acknowledgments

# How to report
# - Please do not test against production data, charter inquiries, or live
#   broker desk traffic.
# - Coordinated disclosure preferred: 90-day window from initial contact.
# - Report should include reproduction steps, affected URL(s), and any
#   suggested remediation.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
