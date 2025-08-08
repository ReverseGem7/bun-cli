import { $type, ERROR } from "./constants";
import { parseArgs, parsePositionals } from "./parseArgs";
import type { Caller } from "./types/caller";
import type { CommandNode } from "./types/command";
import type { Flag, FlagMap } from "./types/flags";
import type { Positional } from "./types/positionals";
import type { RunableCommand } from "./types/run";
import type { ErrorFormatterFn } from "./types/util";
import { standardValidate } from "./vendor/standar-schema-v1/parse";
import type { StandardSchemaV1 } from "./vendor/standar-schema-v1/spec";

/**
 * Parses and validates raw flag values according to the provided flag schemas.
 * @param {FlagMap<Flag>} flags - The flag definitions and schemas.
 * @param {Record<string, unknown>} rawFlags - The raw flag values from CLI input.
 * @param {ErrorFormatterFn} [errorFormatter] - Optional error formatter callback.
 * @returns {Promise<Record<string, unknown>>} The parsed and validated flag values.
 */
async function parseRawFlags(
	flags: FlagMap<Flag>,
	rawFlags: Record<string, unknown>,
	errorFormatter?: ErrorFormatterFn,
): Promise<Record<string, unknown>> {
	const entries = await Promise.all(
		Object.entries(flags.raw).map(async ([key, schema]) => {
			const value = rawFlags[key];

			if (flags.multiple?.[key]) {
				const values = Array.isArray(value) ? value : [value];
				const parsedValues = await Promise.all(
					values.map((v) =>
						standardValidate(
							schema,
							v,
							{
								kind: "flag",
								keyOrIndex: key,
								description: flags.meta[key],
							},
							errorFormatter,
						),
					),
				);
				return [key, parsedValues];
			} else {
				const parsedValue = await standardValidate(
					schema,
					value,
					{
						kind: "flag",
						keyOrIndex: key,
						description: flags.meta[key],
					},
					errorFormatter,
				);
				return [key, parsedValue];
			}
		}),
	);

	return Object.fromEntries(entries);
}

/**
 * Parses and validates positional arguments according to the provided schemas.
 * @param {[StandardSchemaV1, ...StandardSchemaV1[]]} schemas - The positional argument schemas.
 * @param {unknown[]} values - The values to validate.
 * @param {ErrorFormatterFn} [errorFormatter] - Optional error formatter callback.
 * @returns {Promise<unknown[]>} The validated positional values.
 */
export async function parseRawPositionals(
	schemas: [StandardSchemaV1, ...StandardSchemaV1[]],
	values: unknown[],
	errorFormatter?: ErrorFormatterFn,
): Promise<unknown[]> {
	if (values.length !== schemas.length) {
		const error = new Error(ERROR.INVALID_POSITIONAL_COUNT);
		if (errorFormatter) {
			errorFormatter({
				kind: "positional",
				keyOrIndex: values.length,
				description: `Expected ${schemas.length} positional arguments, but got ${values.length}`,
			});
		}
		throw error;
	}

	return await Promise.all(
		schemas.map((schema, i) =>
			standardValidate(
				schema,
				values[i],
				{
					kind: "positional",
					keyOrIndex: i,
					description: `Positional argument ${i + 1}`,
				},
				errorFormatter,
			),
		),
	);
}

/**
 * Parses CLI command input into validated flags and positionals for a given command.
 * @template F, P
 * @param {{ flags: any; positionals: any }} raw - The raw input from CLI.
 * @param {RunableCommand<{ flags: F; positionals: P }>} cmd - The command definition.
 * @param {ErrorFormatterFn} [errorFormatter] - Optional error formatter callback.
 * @returns {Promise<{ flags: any; positionals: any }>} The parsed and validated input.
 */
export async function parseCommandInput<
	F extends FlagMap<Flag> | undefined,
	P extends Positional | undefined,
>(
	raw: {
		flags: any;
		positionals: any;
	},
	cmd: RunableCommand<{
		flags: F;
		positionals: P;
		output: void | Promise<void>;
	}>,
	errorFormatter?: ErrorFormatterFn,
) {
	const rawFlags = raw.flags ?? {};

	const parsedFlags =
		cmd.flags && "raw" in cmd.flags
			? await parseRawFlags(cmd.flags, rawFlags, errorFormatter)
			: {};

	const parsedPositionals =
		cmd.positionals && "raw" in cmd.positionals
			? await parseRawPositionals(
					cmd.positionals.raw,
					raw.positionals ?? [],
					errorFormatter,
				)
			: [];

	if (!cmd.runFn) throw new Error(ERROR.NO_RUN_FUNCTION);

	return cmd.runFn({
		flags: parsedFlags as any,
		positionals: parsedPositionals as any,
	});
}

/**
 * Checks if a command node is a runnable command.
 * @param {CommandNode | RunableCommand} cmd - The command node to check.
 * @returns {boolean} True if the node is a runnable command.
 */
function isRunable(cmd: CommandNode | RunableCommand): cmd is RunableCommand {
	return $type in cmd && (cmd as any)[$type] === "runable";
}

/**
 * Recursively collects commands from a command tree.
 * @param {CommandNode | RunableCommand} tree - The command tree.
 * @param {string[]} positionals - The positional arguments.
 * @param {number[]} positionalIndexesInArgs - The indexes of positionals in the args array.
 * @returns {any[]} The collected commands.
 */
function getCommands(
	tree: CommandNode | RunableCommand,
	positionals: string[],
	positionalIndexesInArgs: number[],
) {
	const steps = positionals.map((key, i) => ({ key, i }));
	let current: CommandNode | RunableCommand = tree;
	let path: number[] = [];
	const used = new Set<number>();
	const history: { cmd: RunableCommand; path: number[]; used: Set<number> }[] =
		[];

	for (const { key, i } of steps) {
		used.add(i);

		if (!(key in current)) break;

		current = (current as CommandNode)[key]!;
		path = [...path, positionalIndexesInArgs[i]!];

		if (isRunable(current)) {
			history.push({ cmd: current, path, used: new Set(used) });
		}
	}

	const last = history.at(-1);
	if (!last) return null;

	const usedPositionals = positionals.filter((_, i) => last.used.has(i));

	return {
		cmd: last.cmd,
		commandPath: last.path,
		usedPositionals,
	};
}

/**
 * Creates a CLI caller for a command tree, enabling command execution and input parsing.
 * @template T
 * @param {T} tree - The command tree.
 * @param {ErrorFormatterFn} [errorFormatter] - Optional error formatter callback.
 * @returns {Caller<T>} The CLI caller instance.
 */
export function caller<T extends CommandNode>(
	tree: T,
	errorFormatter?: ErrorFormatterFn,
): Caller<T> {
	const walk = (node: any): any => {
		const out: any = {};

		for (const key in node) {
			const cmd = node[key];

			if (isRunable(cmd)) {
				const fn = async (input?: any) => {
					const { flags, positionals } = input ?? {};

					if (!cmd.subcommands) {
						return await parseCommandInput(
							{ flags, positionals },
							cmd,
							errorFormatter,
						);
					}

					const sub = walk(cmd.subcommands);

					await parseCommandInput({ flags, positionals }, cmd, errorFormatter);
					return sub;
				};

				if (cmd.subcommands) {
					Object.assign(fn, walk(cmd.subcommands));
				}

				out[key] = fn;
			} else if (typeof cmd === "object") {
				out[key] = walk(cmd);
			}
		}

		return out;
	};

	return walk(tree) as Caller<T>;
}

/**
 * Creates and runs a CLI command tree.
 * @template T
 * @param {T} tree - The command tree.
 * @param {ErrorFormatterFn} [errorFormatter] - Optional error formatter callback.
 * @returns {Promise<void>} Resolves when the command is executed.
 */
export async function create<T extends CommandNode>(
	tree: T,
	errorFormatter?: ErrorFormatterFn,
): Promise<void> {
	const args = process.argv.slice(2);
	const { positionals, positionalIndexesInArgs } = parsePositionals(args);

	let cmd = getCommands(tree, positionals, positionalIndexesInArgs);

	if (cmd === null) throw new Error(ERROR.NO_COMMAND_FOUND);

	while (
		isRunable(cmd.cmd) &&
		positionals.length > cmd.usedPositionals.length &&
		cmd.cmd.subcommands
	) {
		const next = getCommands(
			cmd.cmd.subcommands,
			cmd.usedPositionals,
			positionalIndexesInArgs,
		);

		if (next === null) break;

		cmd = {
			cmd: next.cmd,
			commandPath: [...cmd.commandPath, ...next.commandPath],
			usedPositionals: next.usedPositionals,
		};
	}

	await parseCommandInput(
		parseArgs(
			args.filter((_, i) => !cmd.commandPath.includes(i)),
			cmd.cmd,
		),
		cmd.cmd,
		errorFormatter,
	);
}
