import { ERROR } from "./constants";
import type { RunableCommand } from "./types/run";

const toCamelCase = (str: string): string => {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

const tryParseJson = (value: string): any => {
	try {
		return JSON.parse(value);
	} catch { }
	return undefined;
};

const parseValue = (value: string): any => {
	const jsonParsed = tryParseJson(value);
	if (jsonParsed !== undefined) return jsonParsed;

	if (value.includes(",")) {
		const items = value.split(",").map((v) => parseValue(v.trim()));
		return items;
	}
	return value;
};

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

export type ParsedFlag = {
	name: string;
	value: any;
	isLong: boolean;
};

type ParsedArgs = {
	flags: Record<string, unknown>;
	positionals: any[];
};

function stripPrefix(arg: string, isLong: boolean) {
	if (isLong) {
		return arg.slice(2);
	}
	return arg.slice(1);
}

function getDeep(obj: any, path: string[]): any {
	return path.reduce((acc, key) => {
		if (acc && typeof acc === "object") {
			return acc[key];
		}
		return undefined;
	}, obj);
}

function addFlag(key: string, value: unknown, flags: Record<string, unknown>) {
	const path = key.split(".");

	const current = getDeep(flags, path);

	const newValue = current !== undefined ? [current, value] : value;

	setDeep(flags, path, newValue);
}

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

export function parseArgs(args: string[], cmd: RunableCommand): ParsedArgs {
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
