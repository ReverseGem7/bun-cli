import { initCLI } from "clivex";
import * as z from "zod/v4";

const { flag, positional, command, commands, runCLI } = initCLI.create();

const cli = commands({
	calculator: command
		.flags({
			operation: flag
				.input(z.enum(["add", "subtract", "multiply", "divide"]))
				.options({
					short: "o",
				}),
			verbose: flag.input(z.optional(z.boolean())).options({
				short: "v",
			}),
		})
		.positionals([positional.input(z.number()), positional.input(z.number())])
		.run(({ flags, positionals }) => {
			const [a, b] = positionals;
			let result: number;

			switch (flags.operation) {
				case "add":
					result = a + b;
					break;
				case "subtract":
					result = a - b;
					break;
				case "multiply":
					result = a * b;
					break;
				case "divide":
					if (b === 0) throw new Error("Division by zero!");
					result = a / b;
					break;
			}

			if (flags.verbose) {
				console.log(`${a} ${flags.operation} ${b} = ${result}`);
			} else {
				console.log(result);
			}
		}),
});

runCLI(cli);
