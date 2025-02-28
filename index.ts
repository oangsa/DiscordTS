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
