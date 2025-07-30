import type z from "zod/v4/core";
import * as z4 from "zod/v4";

import type { CommandBuilder, CommandTree } from "./types/command";
import { unset, $type } from "./constants";
import { getZodSchemaFromFlag } from "./args";
import type { FlagMap, Flag } from "./types/flags";
import type { Positional, PositionalDescriptor } from "./types/positionals";
import type { MaybeUnset, DeepPartial } from "./types/util";

export function createCommand(): CommandBuilder {
  return createCommandBuilderWith({
    flags: unset,
    positionals: unset,
    subcommands: unset,
  });
}

function createCommandBuilderWith<
  TFlags extends MaybeUnset<FlagMap<Flag>>,
  TPositionals extends MaybeUnset<Positional>,
  TSubcommands extends MaybeUnset<CommandTree>
>(cfg: {
  flags: TFlags;
  positionals: TPositionals;
  subcommands: TSubcommands;
}): CommandBuilder<{
  flags: TFlags;
  positionals: TPositionals;
  subcommands: TSubcommands;
}> {
  const builder: DeepPartial<CommandBuilder> = {};

  if (cfg.flags === unset) {
    builder.flags = <T extends Flag>(f: T) => {
      const shortToLong = Object.fromEntries(
        Object.entries(f)
          .filter(([, v]) => "config" in v && v.config?.short)
          .map(([long, v]) => [v.config?.short, long])
      );

      const shape = Object.fromEntries(
        Object.entries(f).map(([k, v]) => [k, getZodSchemaFromFlag(v)])
      );

      const schema = z4.object(shape);

      const flagMap: FlagMap<T> = {
        [$type]: "flags",
        raw: schema,
        shortToLong,
      };

      return createCommandBuilderWith<FlagMap<T>, TPositionals, TSubcommands>({
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
        [$type]: "positional",
        raw: tuple,
      };
      return createCommandBuilderWith<TFlags, typeof descriptor, TSubcommands>({
        ...cfg,
        positionals: descriptor,
      });
    };
  }

  builder.subcommands = (subcommands: TSubcommands) => {
    return createCommandBuilderWith<TFlags, TPositionals, typeof subcommands>({
      ...cfg,
      subcommands: subcommands,
    });
  };

  builder.run = (fn: (ctx: any) => any) => {
    return {
      [$type]: "runable",
      flags: cfg.flags === unset ? undefined : cfg.flags,
      positionals: cfg.positionals === unset ? undefined : cfg.positionals,
      subcommands: cfg.subcommands === unset ? undefined : cfg.subcommands,
      runFn: fn,
    };
  };

  builder[$type] = "CommandBuilder";

  return builder as CommandBuilder<{
    flags: TFlags;
    positionals: TPositionals;
    subcommands: TSubcommands;
  }>;
}
