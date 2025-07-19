import * as z4 from "zod/v4";
import * as z from "zod/v4/core";
import {
  $type,
  type AllMethodsAny,
  type ConditionalIfUnset,
  type MaybeUnset,
  type Prettify,
  type UndefineIfUnset,
  type UnsetMarker,
  unset,
} from "./types";
import { type FlagDescriptor, getZodSchemaFromFlag } from "./flag";
import type { PositionalDescriptor } from "./positional";

export type FlagMap<
  T extends Record<string, FlagDescriptor> = Record<string, FlagDescriptor>
> = {
  _type: "flags";
  raw: z.$ZodObject;
  def: T;
};

export type RunableCommand<T extends { flags: any; positionals: any; output: any }> = {
  _type: "runable";
  def: T;
  flags: UndefineIfUnset<T["flags"]>;
  positionals: UndefineIfUnset<T["positionals"]>;
};

type Command = {
  flags: MaybeUnset<FlagMap<Flag>>;
  positionals: MaybeUnset<Positional>;
};

type Flags<C extends Command> = ConditionalIfUnset<
  C["flags"],
  {
    flags: <F extends Record<string, FlagDescriptor<any>>>(
      f: F
    ) => CommandBuilder<{
      flags: FlagMap<F>;
      positionals: C["positionals"];
    }>;
  }
>;

type Positionals<C extends Command> = ConditionalIfUnset<
  C["positionals"],
  {
    positionals: <P extends [z.$ZodType, ...z.$ZodType[]]>(
      p: P
    ) => CommandBuilder<{
      flags: C["flags"];
      positionals: PositionalDescriptor<{
        [K in keyof P]: z.output<P[K]>;
      }>;
    }>;
  }
>;

export type ExtractFlags<T extends Record<string, FlagDescriptor>> = {
  [K in keyof T]: T[K] extends FlagDescriptor<infer U> ? U["type"] : never;
};

export type ExtractFlagsType<T> = T extends FlagMap<infer U>
  ? Prettify<ExtractFlags<U>>
  : never;

export type ExtractPositionalsType<T> = T extends PositionalDescriptor<infer U>
  ? U
  : never;

type Run<C extends Command> = {
  run<TOutput>(
    fn: (ctx: {
      flags: ExtractFlagsType<C["flags"]>;
      positionals: ExtractPositionalsType<C["positionals"]>;
    }) => TOutput
  ): RunableCommand<{
    flags: C["flags"];
    positionals: C["positionals"];
    output: TOutput;
  }>;
};

type CommandBuilder<
  C extends Command = {
    flags: UnsetMarker;
    positionals: UnsetMarker;
  }
> = Flags<C> &
  Positionals<C> &
  Run<C> & {
    [$type]: "CommandBuilder";
  };

export function createCommand(): CommandBuilder {
  return createCommandBuilderWith({ flags: unset, positionals: unset });
}

type Flag = Record<string, FlagDescriptor>;
type Positional = PositionalDescriptor<any>;

function createCommandBuilderWith<
  TFlags extends MaybeUnset<FlagMap<Flag>>,
  TPositionals extends MaybeUnset<Positional>
>(cfg: {
  flags: TFlags;
  positionals: TPositionals;
}): CommandBuilder<{ flags: TFlags; positionals: TPositionals }> {
  const builder: Partial<AllMethodsAny<CommandBuilder>> = {};

  if (cfg.flags === unset) {
    builder.flags = <T extends Flag>(f: T) => {
      const shape = Object.fromEntries(
        Object.entries(f).map(([k, v]) => [k, getZodSchemaFromFlag(v)])
      );
      const schema = z4.object(shape);
      const flagMap: FlagMap<T> = {
        _type: "flags",
        raw: schema,
        def: f,
      };
      return createCommandBuilderWith<FlagMap<T>, TPositionals>({
        ...cfg,
        flags: flagMap,
      });
    };
  }

  if (cfg.positionals === unset) {
    builder.positionals = <P extends [z.$ZodType, ...z.$ZodType[]]>(p: P) => {
      const tuple = z4.tuple(p);
      const descriptor: PositionalDescriptor<{
        [K in keyof P]: z.output<P[K]>;
      }> = {
        _type: "positional",
        raw: tuple,
        def: null as any,
      };
      return createCommandBuilderWith<TFlags, typeof descriptor>({
        ...cfg,
        positionals: descriptor,
      });
    };
  }

  builder.run = <TOutput>(
    fn: (ctx: {
      flags: TFlags extends FlagMap<infer U> ? ExtractFlags<U> : {};
      positionals: TPositionals extends PositionalDescriptor<infer U> ? U : [];
    }) => TOutput
  ) => {
    return {
      _type: "runable",
      flags: cfg.flags === unset ? undefined : cfg.flags,
      positionals: cfg.positionals === unset ? undefined : cfg.positionals,
      runFn: fn,
    };
  };

  builder[$type] = "CommandBuilder";

  return builder as CommandBuilder<{
    flags: TFlags;
    positionals: TPositionals;
  }>;
}
