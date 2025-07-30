import type z from "zod/v4/core";
import * as z4 from "zod/v4";
import { $type } from "./constants";
import type { Options, FlagDescriptor } from "./types/flags";

export function createFlag() {
  function makeFlagDescriptor<
    T extends { type: z.output<R>; options?: Options },
    R extends z.$ZodType = z.$ZodType,
  >(raw: R, config?: T["options"]): FlagDescriptor<T> {
    return {
      config,
      raw,
      [$type]: "flag",
      options<O extends Options>(opt: Required<O>) {
        return makeFlagDescriptor<{
          type: O["multiple"] extends true ? T["type"][] : T["type"];
          options: O;
        }>(raw, opt);
      },
    };
  }

  return {
    input<T extends z.$ZodType>(schema: T) {
      return makeFlagDescriptor<{ type: z.output<T>; options: undefined }>(
        schema
      );
    },
  };
}

export function getZodSchemaFromFlag(flags: FlagDescriptor): z.$ZodType {
  const isMultiple = flags.config?.multiple === true;
  return isMultiple ? z4.array(flags.raw) : flags.raw;
}

export function createPositional() {
  return {
    input<T extends z.$ZodType>(schema: T) {
      return schema;
    },
  };
}
