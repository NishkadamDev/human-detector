import { ReplitConnectors } from "@replit/connectors-sdk";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const connectors = new ReplitConnectors();
const OWNER = "NishkadamDev";
const REPO = "human-detector";
const BRANCH = "main";
const ROOT = join(import.meta.dirname, "../..");

async function githubApi(path: string, options: RequestInit = {}, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await connectors.proxy("github", path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> | undefined),
      },
    });
    if (res.ok) return res.json();
    const body = await res.text();
    if (attempt < retries && (res.status === 500 || res.status === 502 || res.status === 503 || res.status === 429)) {
      console.log(`\n  Retry ${attempt}/${retries} for ${path} (${res.status})`);
      await new Promise(r => setTimeout(r, 1000 * attempt));
      continue;
    }
    throw new Error(`GitHub API ${path} → ${res.status}: ${body.substring(0, 300)}`);
  }
}

function getAllFiles(dir: string, exclude: string[]): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const rel = relative(ROOT, fullPath);
    if (exclude.some((p) => rel === p || rel.startsWith(p + "/"))) continue;
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, exclude));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

async function run() {
  const EXCLUDE = [
    "node_modules", ".git", "dist", ".cache", ".local", "tmp",
    "pnpm-lock.yaml", ".vite",
  ];

  console.log("Gathering files...");
  const files = getAllFiles(ROOT, EXCLUDE).filter((f) => {
    const rel = relative(ROOT, f);
    return (
      !f.endsWith(".tsbuildinfo") &&
      !rel.includes("node_modules") &&
      !rel.includes("/.vite/") &&
      !rel.match(/^lib\/[^/]+\/dist\//) &&
      !rel.match(/^artifacts\/[^/]+\/dist\//)
    );
  });
  console.log(`Found ${files.length} files to push`);

  // Get current HEAD
  console.log("Getting current branch HEAD...");
  const refData = await githubApi(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const baseSha = refData.object.sha;
  console.log(`Base commit SHA: ${baseSha}`);

  // Get base tree
  const commitData = await githubApi(`/repos/${OWNER}/${REPO}/git/commits/${baseSha}`);
  const baseTreeSha = commitData.tree.sha;
  console.log(`Base tree SHA: ${baseTreeSha}`);

  // Create blobs for all files
  console.log("Creating blobs...");
  const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const relPath = relative(ROOT, filePath);
    process.stdout.write(`  [${i + 1}/${files.length}] ${relPath}\r`);

    let content: string;
    let encoding: "base64" | "utf-8";
    try {
      const buf = readFileSync(filePath);
      // Try to detect binary
      const isBinary = buf.some((b) => b === 0);
      if (isBinary) {
        content = buf.toString("base64");
        encoding = "base64";
      } else {
        content = buf.toString("utf-8");
        encoding = "utf-8";
      }
    } catch {
      console.log(`\n  Skipping unreadable file: ${relPath}`);
      continue;
    }

    const blob = await githubApi(`/repos/${OWNER}/${REPO}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content, encoding }),
    });

    treeItems.push({
      path: relPath,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  console.log(`\nCreated ${treeItems.length} blobs`);

  // Create tree
  console.log("Creating tree...");
  const tree = await githubApi(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
  });
  console.log(`Tree SHA: ${tree.sha}`);

  // Create commit
  console.log("Creating commit...");
  const commit = await githubApi(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: "Push PRO-BUILDER Command Center dashboard from Replit",
      tree: tree.sha,
      parents: [baseSha],
    }),
  });
  console.log(`Commit SHA: ${commit.sha}`);

  // Update branch ref
  console.log(`Updating ${BRANCH} branch...`);
  await githubApi(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  console.log(`\n✓ Successfully pushed to github.com/${OWNER}/${REPO} (${BRANCH})`);
}

run().catch((err) => {
  console.error("\nPush failed:", err.message);
  process.exit(1);
});
