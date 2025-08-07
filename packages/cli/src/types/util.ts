export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type DeepPartial<TObject> = TObject extends object
	? {
		[P in keyof TObject]?: DeepPartial<TObject[P]>;
	}
	: TObject;

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P];
};

const _errorSymbol = Symbol();
export type ErrorSymbol = typeof _errorSymbol;
export type TypeError<TMessage extends string> = TMessage & {
	_: typeof _errorSymbol;
};

export type ErrorFormatterArgs = {
	kind: "flag" | "positional";
	keyOrIndex: string | number;
	description?: string;
};

export type ErrorFormatterFn = (args: ErrorFormatterArgs) => void;

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
