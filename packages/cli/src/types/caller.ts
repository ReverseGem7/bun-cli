import type { CommandTree } from "./command";
import type { ExtractFlagsType } from "./flags";
import type { ExtractPositionalsType } from "./positionals";
import type { ParamsOrUndefined, RunableCommand } from "./run";

type ToFn<F, P, O> = ParamsOrUndefined<
	ExtractFlagsType<F>,
	ExtractPositionalsType<P>
> extends undefined
	? () => O
	: (
		params: ParamsOrUndefined<ExtractFlagsType<F>, ExtractPositionalsType<P>>,
	) => O;

type RunableWithSubcommands<F, P, S, O> = Caller<S> & ToFn<F, P, O>;

export type Caller<T> = {
	[K in keyof T]: T[K] extends RunableCommand<infer Def>
	? Def["subcommands"] extends undefined
	? ToFn<Def["flags"], Def["positionals"], Def["output"]>
	: RunableWithSubcommands<
		Def["flags"],
		Def["positionals"],
		Def["subcommands"],
		Def["output"]
	>
	: T[K] extends CommandTree
	? Caller<T[K]>
	: never;
};
