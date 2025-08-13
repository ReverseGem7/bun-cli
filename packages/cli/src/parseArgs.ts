import { ERROR } from "./constants";
import type { RunableCommand } from "./types/run";

/**
 * Converts a kebab-case string to camelCase.
 * @param {string} str - The string to convert.
 * @returns {string} The camelCase version of the string.
 */
const toCamelCase = (str: string): string => {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Attempts to parse a string as JSON. Returns undefined if parsing fails.
 * @param {string} value - The string to parse.
 * @returns {any} The parsed value or undefined.
 */
const tryParseJson = (value: string): any => {
	try {
		return JSON.parse(value);
	} catch {}
	return undefined;
};

/**
 * Parses a value, attempting JSON parsing and handling comma-separated lists.
 * @param {string} value - The value to parse.
 * @returns {any} The parsed value.
 */
const parseValue = (value: string): any => {
	const jsonParsed = tryParseJson(value);
	if (jsonParsed !== undefined) return jsonParsed;

	if (value.includes(",")) {
		const items = value.split(",").map((v) => parseValue(v.trim()));
		return items;
	}
	return value;
};

/**
 * Sets a deeply nested property on an object, creating intermediate objects as needed.
 * @param {Record<string, any>} target - The target object.
 * @param {string[]} path - The path to set.
 * @param {any} value - The value to set.
 */
export function setDeep(
	target: Record<string, any>,
	path: string[],
	value: any,
) {
	let obj = target;
	for (let i = 0; i < path.length - 1; i++) {
		const key = path[i]!;
		if (typeof obj[key] !== "object" || obj[key] === null) {
			obj[key] = {};
		}
		obj = obj[key];
	}
	obj[path.at(-1)!] = value;
}

/**
 * Represents a parsed flag from the CLI arguments.
 */
export type ParsedFlag = {
	name: string;
	value: any;
	isLong: boolean;
};

type ParsedArgs = {
	flags: Record<string, unknown>;
	positionals: any[];
};

/**
 * Strips the prefix from a flag argument.
 * @param {string} arg - The argument string.
 * @param {boolean} isLong - Whether the flag is long (--flag) or short (-f).
 * @returns {string} The argument without the prefix.
 */
function stripPrefix(arg: string, isLong: boolean) {
	if (isLong) {
		return arg.slice(2);
	}
	return arg.slice(1);
}

/**
 * Retrieves a deeply nested property from an object.
 * @param {any} obj - The object to query.
 * @param {string[]} path - The path to the property.
 * @returns {any} The value at the path, or undefined.
 */
function getDeep(obj: any, path: string[]): any {
	return path.reduce((acc, key) => {
		if (acc && typeof acc === "object") {
			return acc[key];
		}
		return undefined;
	}, obj);
}

/**
 * Adds a flag value to the flags object, supporting dot notation for nested keys.
 * @param {string} key - The flag key (dot notation supported).
 * @param {unknown} value - The value to set.
 * @param {Record<string, unknown>} flags - The flags object to update.
 */
function addFlag(key: string, value: unknown, flags: Record<string, unknown>) {
	const path = key.split(".");

	const current = getDeep(flags, path);

	const newValue = current !== undefined ? [current, value] : value;

	setDeep(flags, path, newValue);
}

/**
 * Parses positional arguments from the CLI args array.
 * @param {string[]} args - The CLI arguments.
 * @returns {{ positionals: string[], positionalIndexesInArgs: number[] }} The parsed positionals and their indexes.
 */
export function parsePositionals(args: string[]) {
	const positionals: string[] = [];
	const positionalIndexesInArgs: number[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (!arg!.startsWith("-")) {
			positionals.push(arg!);
			positionalIndexesInArgs.push(i);
		}
	}

	return { positionals, positionalIndexesInArgs };
}

/**
 * Parses CLI arguments into flags and positionals according to the command definition.
 * @param {string[]} args - The CLI arguments.
 * @param {RunableCommand} cmd - The command definition.
 * @returns {ParsedArgs} The parsed flags and positionals.
 */
export function parseArgs(
	args: string[],
	cmd: RunableCommand<any>,
): ParsedArgs {
	const flags: Record<string, ParsedFlag> = {};
	const positionals: any[] = [];
	const shortToLong = cmd.flags.shortToLong;
	const invalidFlags: string[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]!;
		const isLong = arg.startsWith("--");

		if (!arg.startsWith("-")) {
			positionals.push(parseValue(arg));
			continue;
		}

		// Handle --no-flag
		if (arg.startsWith("--no-")) {
			const key = arg.slice(5);
			addFlag(key, false, flags);
			continue;
		}

		// Handle --key=value or --key value
		let name: string, rawValue: string;

		if (arg.includes("=")) {
			const rawArg = stripPrefix(arg, isLong);
			const parts = rawArg.split("=", 2) as [string, string | undefined];

			name = parts[0];

			if (parts[1] === undefined) {
				//Handle short flags agrupation, -f or --flag without value (true by default)
				if (!isLong) {
					if (name.length > 1) {
						for (const char of name) {
							const key = shortToLong[char];
							if (!key) {
								invalidFlags.push(`-${char}`);
								continue;
							}
							addFlag(key, true, flags);
						}
						continue;
					}

					const key = shortToLong[name];
					if (!key) {
						invalidFlags.push(`-${name}`);
						continue;
					}
					addFlag(key, true, flags);
					continue;
				}

				const key = toCamelCase(name);
				addFlag(key, true, flags);
				continue;
			}

			rawValue = parts[1];
		} else {
			name = stripPrefix(arg, isLong);
			const next = args[i + 1];

			if (!next || next.startsWith("-")) {
				//Handle short flags agrupation, -f or --flag without value (true by default)
				if (!isLong) {
					if (name.length > 1) {
						for (const char of name) {
							const key = shortToLong[char];
							if (!key) {
								invalidFlags.push(`-${char}`);
								continue;
							}
							addFlag(key, true, flags);
						}
						continue;
					}

					const key = shortToLong[name];
					if (!key) {
						invalidFlags.push(`-${name}`);
						continue;
					}
					addFlag(key, true, flags);
					continue;
				}

				const key = toCamelCase(name);
				addFlag(key, true, flags);
				continue;
			}
			rawValue = next;
			i++;
		}

		const value = parseValue(rawValue);
		if (!isLong) {
			if (name.length > 1) {
				for (const char of name) {
					const key = shortToLong[char];
					if (!key) {
						invalidFlags.push(`-${char}`);
						continue;
					}
					addFlag(key, value, flags);
				}
				continue;
			}

			const key = shortToLong[name];
			if (!key) {
				invalidFlags.push(`-${name}`);
				continue;
			}
			addFlag(key, value, flags);
			continue;
		}

		const key = toCamelCase(name);
		addFlag(key, value, flags);
	}

	if (invalidFlags.length > 0) {
		throw new Error(`${ERROR.INVALID_FLAG}: ${invalidFlags.join(", ")}`);
	}

	return { flags, positionals };
}
