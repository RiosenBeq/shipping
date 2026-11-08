import { redirect } from "next/navigation";
import { KeystaticApp } from "../KeystaticApp";
import { SetupNotice } from "../SetupNotice";
import {
  GITHUB_BRANCH,
  keystaticStorageMode,
  missingGithubEnv,
  needsGithubSetup,
} from "@/lib/content/storage";

// Read the storage mode and the GitHub App variables per request, not at build.
export const dynamic = "force-dynamic";

export default function KeystaticPage({ params }: { params?: { params?: string[] } }) {
  if (needsGithubSetup()) return <SetupNotice missing={missingGithubEnv()} />;
  const mode = keystaticStorageMode();
  // GitHub mode: open the production branch, not the repository's default
  // branch (edits commit to the branch that is open).
  if (mode === "github" && !params?.params?.length && missingGithubEnv().length === 0) {
    redirect(`/keystatic/branch/${GITHUB_BRANCH}`);
  }
  return <KeystaticApp mode={mode} />;
}
