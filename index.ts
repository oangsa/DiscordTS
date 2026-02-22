import CustomClient from "./classes/CustomClient";
import { parseArgs } from "util";

const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      dev: {
        type: "boolean",
      },
    },
    strict: true,
    allowPositionals: true,
});

const client = new CustomClient(values.dev);
client.Start();


const port = process.env.PORT || 3001;
Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }
    return new Response("Not Found", { status: 404 });
  },
});
console.log(`Health check server running on port ${port}`);
