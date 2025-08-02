import type {
  CommandBuilder,
  CommandShape,
  CommandTree,
} from "./types/command";
import { $type } from "./constants";
import type { Flag } from "./types/flags";
import type { DeepPartial } from "./types/util";
import type { StandardSchemaV1 } from "./vendor/standar-schema-v1/spec";

export function createCommand(cfg: CommandShape = {}): CommandBuilder {
  const builder: DeepPartial<CommandBuilder> = {
    run(fn: (...args: any[]) => any) {
      return {
        ...cfg,
        runFn: fn,
        [$type]: "runable",
      };
    },

    [$type]: "CommandBuilder",
  };

  if (!cfg.subcommands) {
    builder.subcommands = (subcommands: CommandTree) =>
      createCommand({ ...cfg, subcommands });
  }

  if (!cfg.flags) {
    builder.flags = (f: Flag) =>
      createCommand({
        ...cfg,
        flags: {
          [$type]: "flags",
          raw: Object.fromEntries(
            Object.entries(f).map(([k, v]) => [k, v.raw])
          ),
          meta: Object.fromEntries(
            Object.entries(f)
              .filter(([, v]) => v.config?.description)
              .map(([k, v]) => [k, v.config!.description!])
          ),
          shortToLong: Object.fromEntries(
            Object.entries(f)
              .filter(([, v]) => v.config?.short)
              .map(([k, v]) => [v.config!.short!, k])
          ),
          multiple: Object.fromEntries(
            Object.entries(f)
              .filter(([, v]) => v.config?.multiple)
              .map(([k, v]) => [k, v.config!.multiple!])
          ),
        },
      });
  }

  if (!cfg.positionals) {
    builder.positionals = (p: [StandardSchemaV1, ...StandardSchemaV1[]]) =>
      createCommand({
        ...cfg,
        positionals: {
          [$type]: "positional",
          raw: p,
        },
      });
  }

  return builder as CommandBuilder;
}
