import { $type, ERROR } from "./constants";
import type { FlagDescriptor, Options } from "./types/flags";
import type { StandardSchemaV1 } from "./vendor/standar-schema-v1/spec";

/**
 * Creates a flag builder for defining CLI flags with schema validation and options.
 * @returns {Object} An object with an input method for flag schema definition.
 */
export function createFlag() {
	function makeFlagDescriptor<
		T extends { type: StandardSchemaV1.InferOutput<R>; options?: Options },
		R extends StandardSchemaV1 = StandardSchemaV1,
	>(raw: R, config?: T["options"]): FlagDescriptor<T> {
		return {
			config,
			raw,
			[$type]: "flag",
			options<const O extends Options>(opt: O) {
				return makeFlagDescriptor<{
					type: O["multiple"] extends true ? T["type"][] : T["type"];
					options: { [K in keyof O]: O[K] };
				}>(raw, opt);
			},
		};
	}

	return {
		input<T extends StandardSchemaV1>(schema: T) {
			if (!schema || !("~standard" in schema))
				throw new Error(ERROR.INVALID_SCHEMA);

			return makeFlagDescriptor<{
				type: StandardSchemaV1.InferOutput<T>;
			}>(schema);
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
