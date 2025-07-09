import * as z from "zod/v4/core";
import { ArgsBuilder } from "./args";
import { prettifyError } from "./error";
import type { Logger } from "./logger";

export type InferArgs<T extends Record<string, ArgsBuilder<any>>> = {
  [K in keyof T]: T[K] extends ArgsBuilder<infer Z>
    ? Z extends z.$ZodType
      ? z.output<Z>
      : never
    : never;
};

export class CommandBuilder<
  TArgs extends Record<string, ArgsBuilder<any>> = {}
> {
  constructor(private logger: Logger) {
    this.arg = new ArgsBuilder(this.logger);
  }

  public arg;
  private argsMap!: TArgs;
  private handler?: (ctx: { input: InferArgs<TArgs> }) => void;

  args<NewArgs extends Record<string, ArgsBuilder<any>>>(
    argDefs: NewArgs
  ): CommandBuilder<NewArgs> {
    const next = new CommandBuilder<NewArgs>(this.logger);
    next.argsMap = argDefs;
    return next;
  }

  run(handler: (ctx: { input: InferArgs<TArgs> }) => void): this {
    this.handler = handler;
    return this;
  }

  executeCmd(rawInput: InferArgs<TArgs>): void {
    if (!this.handler) throw new Error("No handler defined with .run()");

    const parsed = Object.entries(this.argsMap).reduce(
      (
        acc: InferArgs<TArgs>,
        [key, builder]: [string, ArgsBuilder<z.$ZodType | undefined>]
      ) => {
        if (!builder.inputSchema)
          throw new Error(`No input schema for argument "${key}"`);

        const result = z.safeParse(builder.inputSchema, rawInput[key]);

        if (!result.success) {
          this.logger.log(prettifyError(result.error, key));
        }

        return { ...acc, [key]: result.data };
      },
      {} as any
    );

    this.handler({ input: parsed });
  }
}
