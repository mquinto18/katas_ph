import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache configured — the app is fully dynamic (no ISR/SSG).
// If ISR is added later, wire up the R2 incremental cache here.
export default defineCloudflareConfig();
