import { ValidationError } from "./error";
import type { StandardSchemaV1 } from "./spec";

export async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
  meta: {
    kind: "flag" | "positional";
    keyOrIndex: string | number;
    description?: string;
  }
): Promise<StandardSchemaV1.InferOutput<T>> {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) result = await result;

  if (result.issues) {
    console.error(new ValidationError([...result.issues], meta).message);
  }

  return (result as StandardSchemaV1.SuccessResult<unknown>).value;
}
