import type { $def, $type } from "../constants";
import type { StandardSchemaV1 } from "../vendor/standar-schema-v1/spec";
import type { CommandBuilder, CommandShape } from "./command";
import type { Alpha, Mutable, Prettify } from "./util";

type ShortFlag = Alpha | Lowercase<Alpha>;

export type Options = {
	short?: ShortFlag;
	multiple?: boolean;
	description?: string;
};
export type Flag = Record<string, FlagDescriptor>;

export type FlagDescriptor<
	T extends { type: any; options?: Options } = { type: any; options?: Options },
> = {
	raw: StandardSchemaV1;
	config?: T["options"];
	[$type]: "flag";
	[$def]?: T["type"];
	options<const O extends Options>(
		opt: O,
	): FlagDescriptor<{
		type: O["multiple"] extends true ? T["type"][] : T["type"];
		options: Prettify<Mutable<O>>;
	}>;
};

export type FlagMap<
	T extends Record<string, FlagDescriptor> = Record<string, FlagDescriptor>,
> = {
	raw: Record<string, StandardSchemaV1>;
	shortToLong: Record<string, string>;
	multiple: Record<string, boolean | undefined>;
	meta: Record<string, string>;
	[$def]?: T;
	[$type]: "flags";
};

type ExtractFlags<T extends Record<string, FlagDescriptor>> = {
	[K in keyof T]: T[K] extends FlagDescriptor<infer U> ? U["type"] : undefined;
};

export type ExtractFlagsType<T> = T extends FlagMap<infer U>
	? Prettify<ExtractFlags<U>>
	: undefined;

export type FlagFn<S extends CommandShape> = {
	/**
	 * Defines the flags for a command.
	 *
	 * @template F - The type of the flag definitions.
	 * @param def - An object mapping flag names to their descriptors.
	 * @returns A new CommandBuilder with the provided flags.
	 */
	flags: <F extends Record<string, FlagDescriptor>>(
		def: F,
	) => CommandBuilder<{
		flags: FlagMap<F>;
		positionals: S["positionals"];
		subcommands: S["subcommands"];
	}>;
};
