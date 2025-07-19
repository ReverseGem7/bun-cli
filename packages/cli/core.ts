import {
  type ExtractFlags,
  type ExtractFlagsType,
  type ExtractPositionalsType,
  type FlagMap,
  type RunableCommand,
  createCommand,
} from "./command";
import { createFlag } from "./flag";
import { parseArgs } from "./parseArgs";
import { type PositionalDescriptor, createPositional } from "./positional";

type CommandTree = {
  [key: string]: CommandTree | RunableCommand<any>;
};

const t = {
  log: (...args: any[]) => console.log("[log]", ...args),
};

function caller<T extends CommandTree>(tree: T) {
  function createProxy(current: CommandTree): any {
    return new Proxy(() => {}, {
      get(_, prop) {
        const next = current[prop as string];
        if (!next) throw new Error(`Comando no encontrado: ${String(prop)}`);
        return typeof next === "object" &&
          "_type" in next &&
          next._type === "runable"
          ? createCallable(next as RunableCommand<any>)
          : createProxy(next as CommandTree);
      },
    });
  }

  function createCallable<C extends RunableCommand<any>>(cmd: C) {
    return async (args: {
      flags?: C["flags"] extends FlagMap<infer U>
        ? Partial<ExtractFlags<U>>
        : never;
      positionals?: C["positionals"] extends PositionalDescriptor<infer U>
        ? U
        : never;
    }) => {
      // Validación con Zod
      const parsedFlags =
        cmd.flags && "raw" in cmd.flags
          ? cmd.flags.raw.parse(args.flags ?? {})
          : {};
      const parsedPositionals =
        cmd.positionals && "raw" in cmd.positionals
          ? cmd.positionals.raw.parse(args.positionals ?? [])
          : [];

      const runFn = (cmd as any).runFn;
      if (!runFn) throw new Error("No se definió función run");

      return await runFn({
        flags: parsedFlags,
        positionals: parsedPositionals,
      });
    };
  }

  return createProxy(tree);
}

type Caller<T> = {
  [K in keyof T]: T[K] extends RunableCommand<infer Def>
    ? (params: {
        flags: ExtractFlagsType<Def["flags"]>;
        positionals: ExtractPositionalsType<Def["positionals"]>;
      }) => Def["output"]
    : T[K] extends CommandTree
    ? Caller<T[K]>
    : never;
};

export class CLI {
  flag = createFlag();
  positional = createPositional();
  command = createCommand();
  t = t;

  commands<T extends CommandTree>(tree: T): T {
    return tree;
  }

  caller<T extends CommandTree>(tree: T): Caller<T> {
    return caller(tree);
  }

  create<T extends CommandTree>(tree: T) {
    const { flags, positionals } = parseArgs();

    // Encuentra el comando más profundo posible
    let current = tree;
    let i = 0;

    for (; i < positionals.length; i++) {
      if (typeof current !== "object" || current === null) break;
      const next = (current as CommandTree)[positionals[i]!];
      if (!next) break;
      current = next as typeof current;
    }

    // Execute the command if we found a runable command
    if (typeof current === "object" && current._type) {
      const cmd = current as unknown as RunableCommand<any>;
      const remainingPositionals = positionals.slice(i);

      // Parse flags and positionals using Zod schemas
      const parsedFlags =
        cmd.flags && "raw" in cmd.flags ? cmd.flags.raw.parse(flags) : {};
      const parsedPositionals =
        cmd.positionals && "raw" in cmd.positionals
          ? cmd.positionals.raw.parse(remainingPositionals)
          : [];

      // Execute the command's run function
      const runFn = (cmd as any).runFn;
      if (!runFn) throw new Error("No run function defined");

      return runFn({
        flags: parsedFlags,
        positionals: parsedPositionals,
      });
    }

    throw new Error(`Command not found: ${positionals.join(" ")}`);
  }
}
