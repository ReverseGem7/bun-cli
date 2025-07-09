import * as z from "zod/v4/core";
import type { ParseArgsOptionDescriptor } from "util";
import type { Logger } from "./logger";

export type ArgsOptions = Omit<ParseArgsOptionDescriptor, "default" | "type">;

export class ArgsBuilder<
  TSchema extends z.$ZodType | undefined = undefined,
  TEffective extends z.$ZodType | undefined = TSchema
> {
  public inputSchema?: TEffective;
  public options_def: Partial<ParseArgsOptionDescriptor> = {};

  constructor(private logger: Logger) {}

  input<T extends z.$ZodType>(schema: T): ArgsBuilder<T> {
    const next = new ArgsBuilder<T>(this.logger);
    next.inputSchema = schema;
    next.options_def = {
      ...this.options_def,
      type: schema._zod.def.type === "boolean" ? "boolean" : "string",
    };
    return next;
  }

  options(
    opts: ArgsOptions & { multiple: true }
  ): ArgsBuilder<
    TSchema,
    TSchema extends z.$ZodType ? z.$ZodArray<TSchema> : never
  >;

  options(opts?: ArgsOptions): ArgsBuilder<TSchema, TEffective>;

  options(opts?: ArgsOptions): any {
    if (opts?.multiple && this.inputSchema) {
      const item = this.inputSchema;
      this.inputSchema = z._union(z.$ZodUnion, [
        // @ts-expect-error
        item,
        // @ts-expect-error
        z._array(z.$ZodArray, item),
      ]) as unknown as any;
    }

    this.options_def = {
      ...this.options_def,
      ...opts,
    };

    return this;
  }
}
