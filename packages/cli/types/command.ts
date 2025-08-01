import type { $type, UnsetMarker } from "../constants";
import type { Flag, FlagMap, FlagsFn } from "./flags";
import type { Positional, Positionals } from "./positionals";
import type { RunFn, RunableCommand } from "./run";
import type { SubCommand } from "./subcommand";
import type { ConditionalIfUnset, MaybeUnset } from "./util";

export type CommandShape<
  F = MaybeUnset<FlagMap<Flag>>,
  P = MaybeUnset<Positional>,
  S = MaybeUnset<CommandTree>
> = {
  flags: F;
  positionals: P;
  subcommands: S;
};

export type CommandBuilder<
  C extends CommandShape = {
    flags: UnsetMarker;
    positionals: UnsetMarker;
    subcommands: UnsetMarker;
  }
> = ConditionalIfUnset<C["flags"], FlagsFn<C>> &
  ConditionalIfUnset<C["positionals"], Positionals<C>> &
  ConditionalIfUnset<C["subcommands"], SubCommand<C>> &
  RunFn<C> & {
    [$type]: "CommandBuilder";
  };

export type CommandTree = {
  [key: string]: CommandTree | RunableCommand<any>;
};
