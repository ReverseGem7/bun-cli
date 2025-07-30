import type { Caller } from "./types/caller";
import { createCommand } from "./command";
import type { CommandTree } from "./types/command";
import { createPositional, createFlag } from "./args";
import { caller, create } from "./caller";

export class CLI {
  flag = createFlag();
  positional = createPositional();
  command = createCommand();

  commands<T extends CommandTree>(tree: T): T {
    return tree;
  }

  caller<T extends CommandTree>(tree: T): Caller<T> {
    return caller(tree);
  }

  create<T extends CommandTree>(tree: T): Promise<void> {
    return create(tree);
  }
}
