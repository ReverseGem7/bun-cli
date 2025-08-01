import type { UnsetMarker } from "../constants";
import type { StandardSchemaV1 } from "../vendor/standar-schema-v1/spec";

export type MaybeUnset<T> = T | UnsetMarker;
export type UndefineIfUnset<T> = T extends UnsetMarker ? undefined : T;
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type ConditionalIfUnset<T, I, E = {}> = T extends UnsetMarker ? I : E;
export type DeepPartial<TObject> = TObject extends object
  ? {
      [P in keyof TObject]?: DeepPartial<TObject[P]>;
    }
  : TObject;
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Alpha =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>
): Promise<StandardSchemaV1.InferOutput<T>> {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) result = await result;

  // if the `issues` field exists, the validation failed
  if (result.issues) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  return result.value;
}
