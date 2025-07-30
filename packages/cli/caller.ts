import * as z from "zod/v4/core";
import type { CommandShape, CommandTree } from "./types/command";
import { $type } from "./constants";
import type { FlagMap, Flag } from "./types/flags";
import type { Positional } from "./types/positionals";
import type { RunableCommand } from "./types/run";
import { parsePositionals, parseArgs } from "./parseArgs";
import type { Caller } from "./types/caller";

export function parseCommandInput<
  F extends FlagMap<Flag> | undefined,
  P extends Positional | undefined,
>(
  raw: Omit<CommandShape<Record<string, any>, Array<unknown>>, "subcommands">,
  cmd: RunableCommand<{
    flags: F;
    positionals: P;
    output: void | Promise<void>;
  }>
) {
  let rawFlags = raw.flags ?? {};

  const parsedFlags =
    cmd.flags && "raw" in cmd.flags ? z.parse(cmd.flags.raw, rawFlags) : {};

  const parsedPositionals =
    cmd.positionals && "raw" in cmd.positionals
      ? z.parse(cmd.positionals.raw, raw.positionals ?? [])
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
        const fn = (input?: any) => {
          const { flags, positionals } = input ?? {};

          if (!cmd.subcommands) {
            return parseCommandInput({ flags, positionals }, cmd);
          }

          const sub = walk(cmd.subcommands);

          const runResult = parseCommandInput({ flags, positionals }, cmd);
          if (runResult instanceof Promise) {
            return (async () => {
              await runResult;
              return sub;
            })();
          } else {
            return sub;
          }
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

  const fn = parseCommandInput(
    parseArgs(
      args.filter((_, i) => !cmd.commandPath.includes(i)),
      cmd.cmd
    ),
    cmd.cmd
  );

  if (fn instanceof Promise) {
    try {
      await fn;
    } catch {}
  } else {
    fn;
  }
}
