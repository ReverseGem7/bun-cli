import { $type } from "./constants";
import type { Options, FlagDescriptor } from "./types/flags";
import type { StandardSchemaV1 } from "./vendor/standar-schema-v1/spec";

export function createFlag() {
  function makeFlagDescriptor<
    T extends { type: StandardSchemaV1.InferOutput<R>; options?: Options },
    R extends StandardSchemaV1 = StandardSchemaV1
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
      return makeFlagDescriptor<{
        type: StandardSchemaV1.InferOutput<T>;
        options: undefined;
      }>(schema);
    },
  };
}

export function createPositional() {
  return {
    input<T extends StandardSchemaV1>(schema: T) {
      return schema;
    },
  };
}
