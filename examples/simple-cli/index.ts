import { z } from "zod/v4";
import { CLI } from "../../packages/cli";

const { t, flag, positional, command, commands, caller } = new CLI();

const cli = commands({
  project: {
    new: {
      folder: command
        .flags({
          file: flag.input(z.literal("Hello")).options({
            short: "f",
          }),
          pdf: flag.input(z.string().array()),
        })
        .positionals([positional.input(z.string())])

        .run(async ({ flags, positionals }) => {
          t.log(flags, positionals);
        }),
    },
  },
});

const app = caller(cli);
app.project.new.folder({
  flags: { file: "Hello", pdf: ["Hi"] },
  positionals: ["Hi"],
});
