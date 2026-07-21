import { watch } from "node:fs";
import path from "node:path";
import tailwind from "bun-plugin-tailwind";

const production = process.env.NODE_ENV === "production";
const frontendDir = path.join(import.meta.dir, "src/frontend");

async function buildFrontend() {
  const result = await Bun.build({
    entrypoints: [path.join(frontendDir, "index.html")],
    outdir: path.join(import.meta.dir, "dist"),
    publicPath: "/",
    plugins: [tailwind],
    minify: production,
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        production ? "production" : "development"
      ),
    },
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log.message);
    throw new Error("Frontend build failed");
  }
  console.log(`Built ${result.outputs.length} files to dist/`);
}

await buildFrontend();

if (process.argv.includes("--watch")) {
  let timer: ReturnType<typeof setTimeout>;
  watch(frontendDir, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => buildFrontend().catch(console.error), 50);
  });
  console.log("Watching src/frontend for changes");
}
