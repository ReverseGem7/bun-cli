import * as z from "zod/v4";
import { CLI } from "../../packages/cli";

const { flag, positional, command, commands, caller, create } = new CLI();

const cli = commands({
  project: {
    new: {
      folder: command
        .flags({
          file: flag.input(z.literal("Hello")).options({
            short: "f",
          }),
          pdf: flag.input(z.boolean()).options({
            short: "c",
          }),
          pdf2: flag.input(z.boolean()).options({
            short: "g",
          }),
        })
        .positionals([
          positional.input(z.string()),
          positional.input(z.number()),
        ])
        .subcommands({
          hello: {
            world: command
              .subcommands({
                hello: {
                  world: command.run(() => {
                    console.timeEnd("v2");
                    console.log("Hello World! 2");
                  }),
                },
              })
              .run(() => {
                console.log("Hello World! 1");
              }),
          },
        })
        .run(async ({ flags, positionals }) => {
          await new Promise((resolve) => setTimeout(resolve, 10000));
          console.log(flags, positionals);
        }),
    },
  },
});

create(cli);
