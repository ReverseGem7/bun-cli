import type { $def, $type } from "../constants";
import type { StandardSchemaV1 } from "../vendor/standar-schema-v1/spec";
import type { CommandBuilder, CommandShape } from "./command";
import type { Mutable, Prettify, ValidateShape } from "./util";

export type Positional = [PositionalDescriptor, ...PositionalDescriptor[]];
export type PositionalInput = StandardSchemaV1[];

export type PositionalOptions = {
	description?: string;
};

export type Positionals<T extends Positional = Positional> = {
	raw: PositionalInput;
	meta: Record<number, string>;
	[$def]?: T;
	[$type]: "positionals";
};

type PositionalShape = {
	type: any;
	options?: PositionalOptions;
};

type PositionalOptionFn<T extends PositionalShape> = {
	options<const O extends PositionalOptions>(
		opt: ValidateShape<O, PositionalOptions>,
	): PositionalDescriptor<{
		type: T["type"];
		options: Prettify<Mutable<O>>;
	}>;
};

export type PositionalDescriptor<
	T extends PositionalShape = { type: any; options?: PositionalOptions },
> = {
	raw: StandardSchemaV1;
	config?: T["options"];
	[$def]?: T["type"];
} & (T["type"] extends undefined
	? {}
	: undefined extends T["options"]
		? PositionalOptionFn<T>
		: {}) & { [$type]: "positional" };

type ExtractPositionals<T extends Positional> = {
	[K in keyof T]: T[K] extends PositionalDescriptor<infer U>
		? U["type"]
		: never;
};

export type ExtractPositionalsType<T> = T extends Positionals<infer U>
	? ExtractPositionals<U>
	: undefined;

export type PositionalFn<S extends CommandShape> = {
	/**
	 * Defines the positionals for a command.
	 *
	 * @template P - The type of the positional definitions.
	 * @param def - An array of positional descriptors.
	 * @returns A new CommandBuilder with the provided positionals.
	 */
	positionals<P extends Positional>(
		def: P,
	): CommandBuilder<{
		flags: S["flags"];
		positionals: Positionals<P>;
		subcommands: S["subcommands"];
		output: undefined;
		ctx: S["ctx"];
	}>;
};
