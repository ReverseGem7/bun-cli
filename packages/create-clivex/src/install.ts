import { exec } from "node:child_process";
import { log } from "@clack/prompts";
import type { PackageManager } from "./get-pkg-manager";

/**
 * Installs dependencies using the selected package manager.
 */
export async function install(
	packageManager: PackageManager,
	target: string,
): Promise<void> {
	return new Promise<void>((resolve) => {
		const child = exec(`${packageManager} install`, {
			cwd: target,
			env: {
				...process.env,
				ADBLOCK: "1",
				NODE_ENV: "development",
				DISABLE_OPENCOLLECTIVE: "1",
			},
		});

		child.on("error", (err) => {
			log.error(
				`Failed to start process for "${packageManager}".\nReason: ${err.message}`,
			);
		});

		child.on("close", (code) => {
			if (code !== 0) {
				log.error(
					`Installation failed.\nCommand: ${packageManager} install\nExit code: ${code}`,
				);
				return;
			}
			resolve();
		});
	});
}
