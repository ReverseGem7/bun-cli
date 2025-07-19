import * as z from "zod/v4/core";

export interface PositionalDescriptor<T extends [any, ...any[]]> {
  _type: "positional";
  raw: z.$ZodType;
  def: T;
}

export function createPositional() {
  return {
    input<T extends z.$ZodType>(schema: T) {
      return schema;
    },
  };
}
