import type { UnsetMarker } from "../constants";

export type MaybeUnset<T> = T | UnsetMarker;
export type UndefineIfUnset<T> = T extends UnsetMarker ? undefined : T;
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type ConditionalIfUnset<T, I, E = {}> = T extends UnsetMarker ? I : E;
export type AllMethodsAny<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (...args: any[]) => any
    : T[K];
};

export type DeepPartial<TObject> = TObject extends object
  ? {
      [P in keyof TObject]?: DeepPartial<TObject[P]>;
    }
  : TObject;
