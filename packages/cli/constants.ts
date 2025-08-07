export const $type: unique symbol = Symbol("type");
export const $def: unique symbol = Symbol("def");

export const ERROR = {
	INVALID_SCHEMA:
		"Invalid schema, only standar schema specification is supported",
	INVALID_POSITIONAL_COUNT: "Invalid number of positional arguments provided",
	NO_RUN_FUNCTION: "No run function defined for this command",
	NO_COMMAND_FOUND: "No command found",
	INVALID_FLAG: "Invalid flag provided",
	INVALID_POSITIONAL: "Invalid positional argument provided",
	MISSING_REQUIRED_FLAG: "Missing required flag",
	MISSING_REQUIRED_POSITIONAL: "Missing required positional argument",
	UNKNOWN_COMMAND: "Unknown command",
	INVALID_COMMAND_PATH: "Invalid command path",
};
