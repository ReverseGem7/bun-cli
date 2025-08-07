import { createFlag, createPositional } from "./args";
import { caller, create } from "./caller";
import { createCommand } from "./command";
import type { CommandTree } from "./types/command";
import type { ErrorFormatterFn } from "./types/util";

class CLIBuilder {
	create({
		errorFormater
	}: {
		errorFormater?: ErrorFormatterFn
	} = {}) {
		return {
			flag: createFlag(),
			positional: createPositional(),
			command: createCommand(),
			caller: (tree: any) => caller(tree, errorFormater),
			create: (tree: any) => create(tree, errorFormater),
			commands: <T extends CommandTree>(tree: T): T => tree
		}
	}
}

const initCLI = new CLIBuilder
export { initCLI }
