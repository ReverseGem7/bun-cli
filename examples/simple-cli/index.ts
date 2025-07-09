import * as zm from "zod/v4-mini";
import { CLI } from "../../packages/cli/cli";

const cli = new CLI();
const t = cli.t;

const commands = cli.commands({
  hello: cli.command
    .args({
      verbose: cli.arg
        .input(zm.boolean())
        .options({ short: "v", multiple: true }),
      name: cli.arg.input(zm.object({ name: zm.string() })),
      hi: cli.arg.input(zm.string()).options({ multiple: true }),
    })
    .run(({ input }) => {
      t.log("verbose:", input.verbose);
      t.log("name:", input.name?.name);
    }),
  goodbye: cli.command
    .args({
      verbose: cli.arg.input(zm.optional(zm.boolean())).options({ short: "v" }),
      name: cli.arg.input(zm.object({ name: zm.string() })),
      a: cli.arg.input(zm.optional(zm.string())),
    })
    .run(({ input }) => {
      t.log("hi:", input.a);
      t.log("verbose:", input.verbose);
      t.log("name:", input.name?.name);
    }),
});

commands.execute({
  hello: {
    verbose: [true, false],
    name: { name: "ReverseGem" },
    hi: "hi",
  },
  goodbye: { name: { name: "Hi" }, a: "hi", verbose: true },
});
