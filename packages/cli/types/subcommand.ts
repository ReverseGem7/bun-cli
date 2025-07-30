import type { CommandShape, CommandTree, CommandBuilder } from "./command";

export type SubCommand<C extends CommandShape> = {
  subcommands<S extends CommandTree>(
    subcommands: S
  ): CommandBuilder<{
    flags: C["flags"];
    positionals: C["positionals"];
    subcommands: S;
  }>;
};
