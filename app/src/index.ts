import express from "express";
import path from "node:path";

const app = express();
const distDir = path.join(import.meta.dir, "../dist");

app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Express on Bun" });
});

app.use(express.static(distDir));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
