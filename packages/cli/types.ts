export const unset = Symbol("unset");
export type UnsetMarker = typeof unset;

export const $type = Symbol("type");

export type MaybeUnset<T> = T | UnsetMarker;
export type UndefineIfUnset<T> = T extends UnsetMarker ? undefined : T;
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type ConditionalIfUnset<T, I, E = {}> = T extends UnsetMarker ? I : E;
export type AllMethodsAny<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (...args: any[]) => any
    : T[K];
};
