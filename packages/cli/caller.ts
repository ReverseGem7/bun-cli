import type { CommandTree } from "./types/command";
import { $type } from "./constants";
import type { FlagMap, Flag } from "./types/flags";
import type { Positional } from "./types/positionals";
import type { RunableCommand } from "./types/run";
import { parsePositionals, parseArgs } from "./parseArgs";
import type { Caller } from "./types/caller";
import type { StandardSchemaV1 } from "./vendor/standar-schema-v1/spec";
import { standardValidate } from "./vendor/standar-schema-v1/parse";

async function parseRawFlags(
  flags: FlagMap<Flag>,
  rawFlags: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    Object.entries(flags.raw).map(async ([key, schema]) => {
      const value = rawFlags[key];

      if (flags.multiple?.[key]) {
        const values = Array.isArray(value) ? value : [value];
        const parsedValues = await Promise.all(
          values.map((v) =>
            standardValidate(schema, v, {
              kind: "flag",
              keyOrIndex: key,
              description: flags.meta[key],
            })
          )
        );
        return [key, parsedValues];
      } else {
        const parsedValue = await standardValidate(schema, value, {
          kind: "flag",
          keyOrIndex: key,
          description: flags.meta[key],
        });
        return [key, parsedValue];
      }
    })
  );

  return Object.fromEntries(entries);
}

export async function parseRawPositionals(
  schemas: [StandardSchemaV1, ...StandardSchemaV1[]],
  values: unknown[]
): Promise<unknown[]> {
  if (values.length !== schemas.length) {
    // TODO: Add error
  }

  return await Promise.all(
    schemas.map((schema, i) =>
      standardValidate(schema, values[i], {
        kind: "positional",
        keyOrIndex: i,
        // add description
      })
    )
  );
}

export async function parseCommandInput<
  F extends FlagMap<Flag> | undefined,
  P extends Positional | undefined,
>(
  raw: {
    flags: any;
    positionals: any;
  },
  cmd: RunableCommand<{
    flags: F;
    positionals: P;
    output: void | Promise<void>;
  }>
) {
  let rawFlags = raw.flags ?? {};

  const parsedFlags =
    cmd.flags && "raw" in cmd.flags
      ? await parseRawFlags(cmd.flags, rawFlags)
      : {};

  const parsedPositionals =
    cmd.positionals && "raw" in cmd.positionals
      ? await parseRawPositionals(cmd.positionals.raw, raw.positionals ?? [])
      : [];

  if (!cmd.runFn) throw new Error("No se definió función run");

  return cmd.runFn({
    flags: parsedFlags as any,
    positionals: parsedPositionals as any,
  });
}

function isRunable(cmd: CommandTree | RunableCommand): cmd is RunableCommand {
  return $type in cmd && (cmd as any)[$type] === "runable";
}

function getCommands(
  tree: CommandTree | RunableCommand,
  positionals: string[],
  positionalIndexesInArgs: number[]
) {
  const steps = positionals.map((key, i) => ({ key, i }));
  let current: CommandTree | RunableCommand = tree;
  let path: number[] = [];
  let used = new Set<number>();
  let history: { cmd: RunableCommand; path: number[]; used: Set<number> }[] =
    [];

  for (const { key, i } of steps) {
    used.add(i);

    if (!(key in current)) break;

    current = (current as CommandTree)[key]!;
    path = [...path, positionalIndexesInArgs[i]!]; // cambia aquí

    if (isRunable(current)) {
      history.push({ cmd: current, path, used: new Set(used) });
    }
  }

  const last = history.at(-1);
  if (!last) return null;

  const usedPositionals = positionals.filter((_, i) => last.used.has(i));

  return {
    cmd: last.cmd,
    commandPath: last.path,
    usedPositionals,
  };
}

export function caller<T extends CommandTree>(tree: T): Caller<T> {
  const walk = (node: any): any => {
    const out: any = {};

    for (const key in node) {
      const cmd = node[key];

      if (isRunable(cmd)) {
        const fn = async (input?: any) => {
          const { flags, positionals } = input ?? {};

          if (!cmd.subcommands) {
            return await parseCommandInput({ flags, positionals }, cmd);
          }

          const sub = walk(cmd.subcommands);

          await parseCommandInput({ flags, positionals }, cmd);
          return sub;
        };

        if (cmd.subcommands) {
          Object.assign(fn, walk(cmd.subcommands));
        }

        out[key] = fn;
      } else if (typeof cmd === "object") {
        out[key] = walk(cmd);
      }
    }

    return out;
  };

  return walk(tree) as Caller<T>;
}

export async function create<T extends CommandTree>(tree: T): Promise<void> {
  const args = process.argv.slice(2);
  const { positionals, positionalIndexesInArgs } = parsePositionals(args);

  let cmd = getCommands(tree, positionals, positionalIndexesInArgs);

  if (cmd === null) throw Error("No command found");

  while (
    isRunable(cmd.cmd) &&
    positionals.length > cmd.usedPositionals.length &&
    cmd.cmd.subcommands
  ) {
    const next = getCommands(
      cmd.cmd.subcommands,
      cmd.usedPositionals,
      positionalIndexesInArgs
    );

    if (next === null) break;

    cmd = {
      cmd: next.cmd,
      commandPath: [...cmd.commandPath, ...next.commandPath],
      usedPositionals: next.usedPositionals,
    };
  }

  await parseCommandInput(
    parseArgs(
      args.filter((_, i) => !cmd.commandPath.includes(i)),
      cmd.cmd
    ),
    cmd.cmd
  );
}
