import "dotenv/config";
import { spawnSync } from "node:child_process";
const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  url === process.env.DATABASE_URL ||
  !new URL(url).pathname.endsWith("_test")
) {
  throw new Error(
    "TEST_DATABASE_URL must identify a separate database with a name ending in _test.",
  );
}
const result = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  },
);
process.exitCode = result.status ?? 1;
