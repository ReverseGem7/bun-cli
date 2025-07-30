import type { CommandTree, CommandShape } from "./command";
import type { $type, $def } from "../constants";
import type { FlagMap, Flag, ExtractFlagsType } from "./flags";
import type { Positional, ExtractPositionalsType } from "./positionals";
import type { UndefineIfUnset } from "./util";

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
  }
> = {
  [$type]: "runable";
  [$def]?: T;
  flags: UndefineIfUnset<T["flags"]>;
  positionals: UndefineIfUnset<T["positionals"]>;
  subcommands: UndefineIfUnset<T["subcommands"]>;
  runFn: (ctx: {
    flags: ExtractFlagsType<T["flags"]>;
    positionals: ExtractPositionalsType<T["positionals"]>;
  }) => T["output"];
};

export type RunFn<C extends CommandShape> = {
  run<TOutput extends void | Promise<void>>(
    fn: (
      ctx: ParamsOrUndefined<
        ExtractFlagsType<C["flags"]>,
        ExtractPositionalsType<C["positionals"]>
      >
    ) => TOutput
  ): RunableCommand<{
    flags: UndefineIfUnset<C["flags"]>;
    positionals: UndefineIfUnset<C["positionals"]>;
    output: TOutput;
    subcommands: UndefineIfUnset<C["subcommands"]>;
  }>;
};
