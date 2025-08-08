import { createFlag, createPositional } from "./args";
import { caller, create } from "./caller";
import { createCommand } from "./command";
import type { Caller } from "./types/caller";
import type { CommandTree } from "./types/command";
import type { ErrorFormatterFn } from "./types/util";

/**
 * CLIBuilder provides a fluent interface for initializing and configuring the CLI system.
 */
class CLIBuilder {
	/**
	 * Creates CLI utilities for building commands, flags, and positionals.
	 * @param {Object} [options]
	 * @param {ErrorFormatterFn} [options.errorFormater] - Optional error formatter callback.
	 * @returns {Object} CLI utilities for command, flag, positional, and caller creation.
	 */
	create({ errorFormater }: { errorFormater?: ErrorFormatterFn } = {}) {
		return {
			/**
			 * Provides utilities for defining CLI flags.
			 */
			flag: createFlag(),

			/**
			 * Provides utilities for defining CLI positional arguments.
			 */
			positional: createPositional(),

			/**
			 * For defining CLI commands, flags, and positionals.
			 * @returns {CommandBuilder} The command builder instance.
			 */
			command: createCommand(),

			/**
			 * Creates a caller function for executing commands with validation.
			 * @template T
			 * @param {T} tree - The command tree to use.
			 * @returns {Caller<T>} The caller function for the provided command tree.
			 */
			caller: <T extends CommandTree>(tree: T): Caller<T> =>
				caller(tree, errorFormater),

			/**
			 * Creates a CLI instance with the provided command tree and error formatter.
			 * @param {CommandTree} tree - The command tree to use.
			 * @returns {Promise<void>}
			 */
			create: (tree: CommandTree): Promise<void> => create(tree, errorFormater),

			/**
			 * Returns the provided command tree as-is, for type inference and chaining.
			 * @template T
			 * @param {T} tree - The command tree.
			 * @returns {T} The same command tree.
			 */
			commands: <T extends CommandTree>(tree: T): T => tree,
		};
	}
}

/**
 * Singleton instance of CLIBuilder for initializing the CLI.
 * @type {CLIBuilder}
 */
const initCLI: CLIBuilder = new CLIBuilder();
export { initCLI };
