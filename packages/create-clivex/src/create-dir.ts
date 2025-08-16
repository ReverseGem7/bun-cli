import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { cancel, confirm, log } from "@clack/prompts";

export async function createDir(
	targetDir: string,
	name: string,
	template: string,
) {
	if (existsSync(targetDir)) {
		log.warn(`The directory "${name}" already exists`);
		const overwrite = await confirm({
			message: "Do you want to overwrite it?",
		});
		if (!overwrite) {
			cancel("Operation cancelled.");
			process.exit(0);
		}
	} else {
		mkdirSync(targetDir);
	}

	try {
		const templateDir = join(import.meta.dirname, "../templates", template);

		cpSync(templateDir, targetDir, {
			filter: (source, destination) => {
				if (source.endsWith("package.json")) {
					const pkg = JSON.parse(readFileSync(source, "utf-8"));
					pkg.name = name;
					writeFileSync(destination, JSON.stringify(pkg, null, 2));
					return false;
				}
				return true;
			},
			recursive: true,
		});
	} catch (err) {
		log.error("There was an error while creating the template");
		console.error(err);
		process.exit(1);
	}
}
