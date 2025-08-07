import type { $def, $type } from "../constants";
import type { StandardSchemaV1 } from "../vendor/standar-schema-v1/spec";
import type { CommandBuilder, CommandShape } from "./command";

export type Positional = PositionalDescriptor<any>;
export type PositionalInput = [StandardSchemaV1, ...StandardSchemaV1[]]

export type PositionalDescriptor<T extends [any, ...any[]]> = {
	raw: PositionalInput;
	[$def]?: T;
	[$type]: "positional";
};

export type ExtractPositionalsType<T> = T extends PositionalDescriptor<infer U>
	? U
	: undefined;

export type PositionalFn<S extends CommandShape> = {
	positionals: <P extends PositionalInput>(
		def: P,
	) => CommandBuilder<{
		flags: S["flags"];
		positionals: PositionalDescriptor<{
			[K in keyof P]: StandardSchemaV1.InferOutput<P[K]>;
		}>;
		subcommands: S["subcommands"];
	}>;
};
