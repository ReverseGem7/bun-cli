import type { $type } from "../constants";
import type { Flag, FlagFn, FlagMap } from "./flags";
import type { Positional, PositionalFn } from "./positionals";
import type { RunableCommand, RunFn } from "./run";
import type { SubCommandsFn } from "./subcommand";

export type CommandShape = {
	flags?: FlagMap<Flag>;
	positionals?: Positional;
	subcommands?: CommandNode;
	ctx?: object;
};

export type BuiltInCommand = RunableCommand<{
	output: void | Promise<void>;
	flags: undefined;
	positionals: undefined;
	subcommands: undefined;
}>;

export type CommandNode = {
	[key: string]: CommandNode | RunableCommand<any>;
};

export type CommandTree = CommandNode & {
	help?: BuiltInCommand;
	version?: BuiltInCommand;
};

export type CommandBuilder<
	S extends CommandShape = {
		flags: undefined;
		positionals: undefined;
		subcommands: undefined;
		middleware: false;
		ctx: object;
	},
> = (S["flags"] extends undefined ? FlagFn<S> : {}) &
	(S["positionals"] extends undefined ? PositionalFn<S> : {}) &
	(S["subcommands"] extends undefined ? SubCommandsFn<S> : {}) &
	RunFn<S> & { [$type]: "CommandBuilder" };
