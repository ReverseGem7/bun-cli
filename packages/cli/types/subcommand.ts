import type { CommandShape, CommandTree, CommandBuilder } from "./command";

export type SubCommandsFn<S extends CommandShape> = {
  subcommands: <SC extends CommandTree>(
    def: SC
  ) => CommandBuilder<{
    flags: S["flags"];
    positionals: S["positionals"];
    subcommands: SC;
  }>;
};
