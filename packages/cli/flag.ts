import * as z from "zod/v4/core";
import * as z4 from "zod/v4";

export type Options = { short?: string; multiple?: boolean };

export type FlagDescriptor<
  T extends { type: any; options?: Options } = { type: any; options?: Options }
> = {
  _type: "flag";
  def: T["type"];
  raw: z.$ZodType;
  options<O extends Options>(
    opt: Readonly<O>
  ): FlagDescriptor<{
    type: O["multiple"] extends true ? T["type"][] : T["type"];
    options: O;
  }>;
};

export function createFlag() {
  function makeFlagDescriptor<T extends { type: any; options?: Options }>(
    def: T,
    raw: z.$ZodType
  ): FlagDescriptor<T> {
    return {
      _type: "flag",
      def,
      raw,
      options<O extends Options>(opt: O) {
        return makeFlagDescriptor(
          {
            type: def.type,
            options: opt,
          },
          raw
        );
      },
    };
  }

  return {
    input<T extends z.$ZodType>(schema: T) {
      return makeFlagDescriptor(
        { type: null as unknown as z.output<T> },
        schema
      );
    },
  };
}

export function getZodSchemaFromFlag(flags: FlagDescriptor): z.$ZodType {
    const isMultiple = flags.def.options?.multiple === true;
    return isMultiple ? z4.array(flags.raw) : flags.raw;
  }
