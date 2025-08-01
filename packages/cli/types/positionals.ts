import type { $def, $type } from "../constants";
import type { CommandShape, CommandBuilder } from "./command";
import type { StandardSchemaV1 } from "../vendor/standar-schema-v1/spec";

export type Positional = PositionalDescriptor<any>;

export type PositionalDescriptor<T extends [any, ...any[]]> = {
  raw: [StandardSchemaV1, ...StandardSchemaV1[]];
  [$def]?: T;
  [$type]: "positional";
};

export type ExtractPositionalsType<T> =
  T extends PositionalDescriptor<infer U> ? U : undefined;

export type PositionalFn<S extends CommandShape> = {
  positionals: <P extends [StandardSchemaV1, ...StandardSchemaV1[]]>(
    def: P
  ) => CommandBuilder<{
    flags: S["flags"];
    positionals: PositionalDescriptor<{
      [K in keyof P]: StandardSchemaV1.InferOutput<P[K]>;
    }>;
    subcommands: S["subcommands"];
  }>;
};
