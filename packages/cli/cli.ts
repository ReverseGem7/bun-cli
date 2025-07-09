import { ArgsBuilder } from "./args";
import { CommandBuilder, type InferArgs } from "./commands";
import { Logger } from "./logger";

type CommandInputMap<T extends Record<string, CommandBuilder<any>>> = {
  [K in keyof T]: T[K] extends CommandBuilder<infer TArgs>
    ? InferArgs<TArgs>
    : never;
};

export class CLI<TCommands extends Record<string, CommandBuilder<any>> = {}> {
  public t: Logger;
  public command: CommandBuilder;
  public arg: ArgsBuilder;
  #commandsMap!: TCommands;

  constructor(_logger?: Logger) {
    this.t = _logger ?? new Logger();
    this.command = new CommandBuilder(this.t);
    this.arg = new ArgsBuilder(this.t);
  }

  commands<C extends Record<string, CommandBuilder<any>>>(cmds: C): CLI<C> {
    const next = new CLI<C>(this.t);
    next.#commandsMap = cmds;
    return next;
  }

  execute(inputMap: CommandInputMap<TCommands>) {
    for (const key in this.#commandsMap) {
      const cmd = this.#commandsMap[key];
      const input = inputMap[key];
      if (input) {
        cmd?.executeCmd(input);
      }
    }
  }
}
