import type { CommandTree, CommandShape } from "./command";
import type { $type, $def } from "../constants";
import type { FlagMap, Flag, ExtractFlagsType } from "./flags";
import type { Positional, ExtractPositionalsType } from "./positionals";

export type ParamsOrUndefined<F, P> = F extends undefined
  ? P extends undefined
    ? undefined
    : { positionals: P }
  : P extends undefined
    ? { flags: F }
    : { flags: F; positionals: P };

export type RunableCommand<
  T extends {
    flags?: FlagMap<Flag>;
    positionals?: Positional;
    output: void | Promise<void>;
    subcommands?: CommandTree;
  } = {
    flags: FlagMap<Flag>;
    positionals: Positional;
    output: void | Promise<void>;
    subcommands: CommandTree;
  },
> = {
  [$type]: "runable";
  [$def]?: T;
  flags: T["flags"];
  positionals: T["positionals"];
  subcommands: T["subcommands"];
  runFn: (ctx: {
    flags: ExtractFlagsType<T["flags"]>;
    positionals: ExtractPositionalsType<T["positionals"]>;
  }) => T["output"];
};

export type RunFn<S extends CommandShape> = {
  run<TOutput extends void | Promise<void>>(
    fn: (
      ctx: ParamsOrUndefined<
        ExtractFlagsType<S["flags"]>,
        ExtractPositionalsType<S["positionals"]>
      >
    ) => TOutput
  ): RunableCommand<{
    flags: S["flags"];
    positionals: S["positionals"];
    output: TOutput;
    subcommands: S["subcommands"];
  }>;
};
