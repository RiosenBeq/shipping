import { GITHUB_REPO } from "@/lib/content/storage";

/**
 * Shown at /keystatic in production until the GitHub App is connected, instead
 * of Keystatic's error. Lists the missing variable names, never their values.
 */
export function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "64px 20px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#0A1F33",
        lineHeight: 1.55,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#8A6420",
        }}
      >
        LEVANTER · Content admin
      </p>
      <h1 style={{ fontSize: 28, lineHeight: 1.2, margin: "8px 0 16px" }}>
        Editing is not connected yet
      </h1>
      <p>
        On the live site the admin saves every change as a commit to{" "}
        <code>
          {GITHUB_REPO.owner}/{GITHUB_REPO.name}
        </code>{" "}
        through a GitHub App. This deployment is missing the app&apos;s settings:
      </p>
      <ul style={{ paddingLeft: 20 }}>
        {missing.map((name) => (
          <li key={name}>
            <code>{name}</code>
          </li>
        ))}
      </ul>
      <p>
        Create the GitHub App once on a computer (<code>KEYSTATIC_STORAGE=github npm run dev</code>,
        then open <code>/keystatic</code>), add the four values to the Vercel project&apos;s
        environment variables and redeploy. Step-by-step instructions are in{" "}
        <code>docs/CMS.md</code>.
      </p>
      <p lang="tr" style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #E3DED3" }}>
        Yönetim paneli canlı sitede henüz GitHub&apos;a bağlı değil. GitHub App&apos;i bir kez
        oluşturun, yukarıdaki dört değişkeni Vercel&apos;e ekleyip yeniden yayınlayın. Ayrıntılar:{" "}
        <code>docs/CMS.md</code>.
      </p>
      <p style={{ marginTop: 24, fontSize: 14 }}>
        Editing content on your own computer works without any of this: run <code>npm run dev</code>{" "}
        and open <code>http://localhost:3000/keystatic</code>.
      </p>
    </main>
  );
}
