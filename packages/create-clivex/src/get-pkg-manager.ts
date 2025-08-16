export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export function getPkgManager(): PackageManager {
	const ua = process.env.npm_config_user_agent || "";
	const execPath = process.env.npm_execpath || "";

	if (ua.startsWith("bun")) return "bun";
	if (ua.startsWith("yarn")) return "yarn";
	if (ua.startsWith("pnpm")) return "pnpm";

	if (execPath.includes("bun")) return "bun";
	if (execPath.includes("yarn.js")) return "yarn";
	if (execPath.includes("pnpm")) return "pnpm";

	return "npm";
}
