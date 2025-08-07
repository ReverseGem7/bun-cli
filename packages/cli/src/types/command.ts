import type { $type } from "../constants";
import type { Flag, FlagFn, FlagMap } from "./flags";
import type { Positional, PositionalFn } from "./positionals";
import type { RunableCommand, RunFn } from "./run";
import type { SubCommandsFn } from "./subcommand";

export type CommandShape = {
	flags?: FlagMap<Flag>;
	positionals?: Positional;
	subcommands?: CommandNode;
};

// export type HelpCommand = RunableCommand<any>;

// export type VersionCommand = RunableCommand<any>;

export type CommandNode = {
	[key: string]: CommandNode | RunableCommand<any>;
};

export type CommandTree = CommandNode
// TODO add help and version commands
// & {
// 	help?: HelpCommand;
// 	version?: VersionCommand;
// };

export type CommandBuilder<
	S extends CommandShape = {
		type: "command";
		flags: undefined;
		positionals: undefined;
		subcommands: undefined;
		middleware: false;
	},
> = (S["flags"] extends undefined ? FlagFn<S> : {}) &
	(S["positionals"] extends undefined ? PositionalFn<S> : {}) &
	(S["subcommands"] extends undefined ? SubCommandsFn<S> : {}) &
	RunFn<S> & { [$type]: "CommandBuilder" };
