import type z from "zod/v4/core";

import type { $type, $def } from "../constants";
import type { CommandShape, CommandBuilder } from "./command";
import type { Prettify } from "./util";

type ShortFlag = Alpha | Lowercase<Alpha>;

type Alpha =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type Options = { short?: ShortFlag; multiple?: boolean };
export type Flag = Record<string, FlagDescriptor>;

export type FlagDescriptor<
  T extends { type: any; options?: Options } = { type: any; options?: Options }
> = {
  raw: z.$ZodType;
  config?: T["options"];
  [$type]: "flag";
  [$def]?: T["type"];
  options<O extends Options>(
    opt: Readonly<O>
  ): FlagDescriptor<{
    type: O["multiple"] extends true ? T["type"][] : T["type"];
    options: O;
  }>;
};

export type FlagMap<
  T extends Record<string, FlagDescriptor> = Record<string, FlagDescriptor>
> = {
  raw: z.$ZodObject;
  shortToLong: Record<string, string>;
  [$def]?: T;
  [$type]: "flags";
};

type ExtractFlags<T extends Record<string, FlagDescriptor>> = {
  [K in keyof T]: T[K] extends FlagDescriptor<infer U> ? U["type"] : undefined;
};

export type ExtractFlagsType<T> = T extends FlagMap<infer U>
  ? Prettify<ExtractFlags<U>>
  : undefined;

export type FlagsFn<C extends CommandShape> = {
  flags: <F extends Record<string, FlagDescriptor>>(
    f: F
  ) => CommandBuilder<{
    flags: FlagMap<F>;
    positionals: C["positionals"];
    subcommands: C["subcommands"];
  }>;
};
