import { join } from "node:path";
import {
	cancel,
	confirm,
	group,
	intro,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import { initCLI } from "clivex";
import { z } from "zod/v4-mini";
import { createDir } from "./create-dir";
import { getPkgManager } from "./get-pkg-manager";
import { install } from "./install";

const { flag, command, runCLI } = initCLI.create();

const cli = command
	.flags({
		name: flag.input(z.optional(z.string())).options({
			short: "n",
			description: "Project name",
		}),
		template: flag
			.input(z.optional(z.enum(["greetings", "calculator"])))
			.options({
				short: "t",
				description: "Template for the project",
			}),
	})
	.run(async ({ flags }) => {
		intro("Wellcome to Clivex");

		const { name, template } = await group(
			{
				name: () =>
					flags.name
						? Promise.resolve(flags.name)
						: text({
								message: "Project name:",
								placeholder: "my-app",
								defaultValue: "my-app",
							}),
				template: () =>
					flags.template
						? Promise.resolve(flags.template)
						: select({
								message: "Choose a template:",
								options: [
									{ value: "greetings", label: "Greetings" },
									{ value: "calculator", label: "Calculator" },
								],
							}),
			},
			{
				onCancel: () => {
					cancel("Operation cancelled.");
					process.exit(0);
				},
			},
		);

		const targetDir = join(process.cwd(), name);
		await createDir(targetDir, name, template);

		const shouldInstall = await confirm({
			message: "Do you want to install the packages?",
		});

		const pkgManager = getPkgManager();

		if (shouldInstall) {
			const s = spinner();
			s.start(`Installing via ${pkgManager}...`);
			try {
				await install(pkgManager, targetDir);
				s.stop(`Installed via ${pkgManager}`);
			} catch (err) {
				s.stop("Installation failed");
				console.error(err);
				process.exit(1);
			}
		}

		outro("Thanks for using Clivex");
	});

runCLI(cli);
