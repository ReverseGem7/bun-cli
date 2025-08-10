import { describe, expect, test } from "bun:test";
import { spawnSync } from "bun";

const runCLI = (args: string[]) => {
	return spawnSync({
		cmd: ["bun", "run", "index.ts", ...args],
		cwd: import.meta.dir,
		stdout: "pipe",
		stderr: "pipe",
	});
};

describe("calculator CLI", () => {
	test("adds two numbers", () => {
		const { stdout, stderr, exitCode } = runCLI([
			"calculator",
			"2",
			"3",
			"--operation",
			"add",
		]);
		expect(exitCode).toBe(0);
		expect(stdout.toString().trim()).toBe("5");
		expect(stderr.toString()).toBe("");
	});

	test("subtracts two numbers", () => {
		const { stdout, stderr, exitCode } = runCLI([
			"calculator",
			"7",
			"4",
			"--operation",
			"subtract",
		]);
		expect(exitCode).toBe(0);
		expect(stdout.toString().trim()).toBe("3");
		expect(stderr.toString()).toBe("");
	});

	test("multiplies two numbers", () => {
		const { stdout, stderr, exitCode } = runCLI([
			"calculator",
			"6",
			"7",
			"--operation",
			"multiply",
		]);
		expect(exitCode).toBe(0);
		expect(stdout.toString().trim()).toBe("42");
		expect(stderr.toString()).toBe("");
	});

	test("divides two numbers", () => {
		const { stdout, stderr, exitCode } = runCLI([
			"calculator",
			"15",
			"3",
			"--operation",
			"divide",
		]);
		expect(exitCode).toBe(0);
		expect(stdout.toString().trim()).toBe("5");
		expect(stderr.toString()).toBe("");
	});

	test("division by zero throws error", () => {
		const { stderr, exitCode } = runCLI([
			"calculator",
			"10",
			"0",
			"--operation",
			"divide",
		]);
		expect(exitCode).not.toBe(0);
		expect(stderr.toString()).toMatch(/Division by zero/);
	});

	test("verbose flag outputs full expression", () => {
		const { stdout, stderr, exitCode } = runCLI([
			"calculator",
			"2",
			"3",
			"--operation",
			"add",
			"--verbose",
		]);
		expect(exitCode).toBe(0);
		expect(stdout.toString().trim()).toBe("2 add 3 = 5");
		expect(stderr.toString()).toBe("");
	});
});
