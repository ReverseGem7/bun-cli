import type { $type } from "../constants";
import type { Flag, FlagMap, FlagFn } from "./flags";
import type { Positional, PositionalFn } from "./positionals";
import type { RunFn, RunableCommand } from "./run";
import type { SubCommandsFn } from "./subcommand";

export type CommandShape = {
  flags?: FlagMap<Flag>;
  positionals?: Positional;
  subcommands?: CommandTree;
};

export type CommandTree = {
  [key: string]: CommandTree | RunableCommand<any>;
};

export type CommandBuilder<
  S extends CommandShape = {
    flags: undefined;
    positionals: undefined;
    subcommands: undefined;
  },
> = (S["flags"] extends undefined ? FlagFn<S> : {}) &
  (S["positionals"] extends undefined ? PositionalFn<S> : {}) &
  (S["subcommands"] extends undefined ? SubCommandsFn<S> : {}) &
  RunFn<S> & { [$type]: "CommandBuilder" };
