import type { $def, $type } from "../constants";
import type { CommandShape } from "./command";
import type { ExtractFlagsType } from "./flags";
import type { ExtractPositionalsType } from "./positionals";

export type ParamsOrUndefined<F, P> = F extends undefined
	? P extends undefined
		? undefined
		: { positionals: P }
	: P extends undefined
		? { flags: F }
		: { flags: F; positionals: P };

export type RunableCommand<T extends CommandShape> = {
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
			args: ParamsOrUndefined<
				ExtractFlagsType<S["flags"]>,
				ExtractPositionalsType<S["positionals"]>
			> & { ctx: S["ctx"] },
		) => TOutput,
	): RunableCommand<{
		flags: S["flags"];
		positionals: S["positionals"];
		output: TOutput;
		subcommands: S["subcommands"];
	}>;
};
