import { $type, ERROR } from "./constants";
import type { FlagDescriptor, FlagOptions } from "./types/flags";
import type { StandardSchemaV1 } from "./vendor/standar-schema-v1/spec";

/**
 * Creates a flag builder for defining CLI flags with schema validation and options.
 */
export function createFlag() {
	function makeFlagDescriptor<
		R extends StandardSchemaV1,
		T = StandardSchemaV1.InferOutput<R>,
	>(raw: R): FlagDescriptor<{ type: T; options?: FlagOptions }> {
		const base = {
			raw,
			[$type]: "flag",
		};
		return {
			...base,
			options<O extends FlagOptions>(opt: O) {
				return {
					config: opt,
					...base,
				};
			},
		} as any;
	}

	return {
		input<T extends StandardSchemaV1>(schema: T) {
			if (!schema || !("~standard" in schema)) {
				throw new Error(ERROR.INVALID_SCHEMA);
			}
			return makeFlagDescriptor(schema);
		},
	};
}

/**
 * Creates a positional argument builder for defining CLI positionals with schema validation.
 * @returns {Object} An object with an input method for positional schema definition.
 */
export function createPositional() {
	return {
		input<T extends StandardSchemaV1>(schema: T) {
			if (!schema || !("~standard" in schema))
				throw new Error(ERROR.INVALID_SCHEMA);
			return schema;
		},
	};
}
