import { $type } from "./constants";
import type {
	CommandBuilder,
	CommandNode,
	CommandShape,
} from "./types/command";
import type { Flag } from "./types/flags";
import type { Positional } from "./types/positionals";
import type { DeepPartial } from "./types/util";

/**
 * Creates a command builder for defining CLI commands, flags, and positionals.
 * @returns {CommandBuilder} The command builder instance.
 */
export function createCommand<Context extends object>(
	cfg: CommandShape = {},
): CommandBuilder<{
	flags: undefined;
	positionals: undefined;
	subcommands: undefined;
	output: undefined;
	middleware: false;
	ctx: Context;
}> {
	const builder: DeepPartial<CommandBuilder> = {
		run(fn: (...args: any[]) => any) {
			return {
				...cfg,
				runFn: fn,
				[$type]: "runable",
			};
		},

		[$type]: "CommandBuilder",
	};

	if (!cfg.subcommands) {
		builder.subcommands = (subcommands: CommandNode) =>
			createCommand({ ...cfg, subcommands });
	}

	if (!cfg.flags) {
		builder.flags = (f: Flag) =>
			createCommand({
				...cfg,
				flags: {
					[$type]: "flags",
					raw: Object.fromEntries(
						Object.entries(f).map(([k, v]) => [k, v.raw]),
					),
					meta: Object.fromEntries(
						Object.entries(f)
							.filter(([, v]) => v.config?.description)
							.map(([k, v]) => [k, v.config!.description!]),
					),
					shortToLong: Object.fromEntries(
						Object.entries(f)
							.filter(([, v]) => v.config?.short)
							.map(([k, v]) => [v.config!.short!, k]),
					),
					multiple: Object.fromEntries(
						Object.entries(f)
							.filter(([, v]) => v.config?.multiple)
							.map(([k, v]) => [k, v.config!.multiple!]),
					),
				},
			});
	}

	if (!cfg.positionals) {
		builder.positionals = (p: Positional) =>
			createCommand({
				...cfg,
				positionals: {
					[$type]: "positionals",
					raw: p.map((v) => v.raw),
					meta: Object.fromEntries(
						Object.entries(p)
							.filter(([, v]) => v.config?.description)
							.map(([k, v]) => [k, v.config!.description!]),
					),
				},
			});
	}

	return builder as CommandBuilder<{
		flags: undefined;
		positionals: undefined;
		subcommands: undefined;
		output: undefined;
		middleware: false;
		ctx: Context;
	}>;
}
