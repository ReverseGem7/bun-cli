import type { CommandBuilder, CommandNode, CommandShape } from "./command";

export type SubCommandsFn<S extends CommandShape> = {
	subcommands: <SC extends CommandNode>(
		def: SC,
	) => CommandBuilder<{
		flags: S["flags"];
		positionals: S["positionals"];
		subcommands: SC;
	}>;
};
