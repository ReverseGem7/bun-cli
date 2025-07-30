import type z from "zod/v4/core";
import type { $def, $type } from "../constants";
import type { CommandShape, CommandBuilder } from "./command";

export type Positional = PositionalDescriptor<any>;

export type PositionalDescriptor<T extends [any, ...any[]]> = {
  raw: z.$ZodType;
  [$def]?: T;
  [$type]: "positional";
};

export type ExtractPositionalsType<T> =
  T extends PositionalDescriptor<infer U> ? U : undefined;

export type Positionals<C extends CommandShape> = {
  positionals: <P extends [z.$ZodType, ...z.$ZodType[]]>(
    p: P
  ) => CommandBuilder<{
    flags: C["flags"];
    positionals: PositionalDescriptor<{
      [K in keyof P]: z.output<P[K]>;
    }>;
    subcommands: C["subcommands"];
  }>;
};
