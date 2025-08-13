import type { StandardSchemaV1 } from "./spec";

export class ValidationError extends Error {
	constructor(
		public issues: StandardSchemaV1.Issue[],
		public meta: {
			kind: "flag" | "positional";
			keyOrIndex: string | number;
			description?: string;
		},
	) {
		super(ValidationError.format(issues, meta));
		this.name = "ValidationError";
	}

	static format(
		issues: StandardSchemaV1.Issue[],
		meta: {
			kind: "flag" | "positional";
			keyOrIndex: string | number;
			description?: string;
		},
	): string {
		const label =
			meta.kind === "flag"
				? `The flag --${meta.keyOrIndex}${meta.description ? ` (${meta.description})` : ""} is not valid:`
				: `The positional ${+meta.keyOrIndex + 1}${meta.description ? ` (${meta.description})` : ""} is not valid:`;

		const messages = issues.map((issue) => {
			const path =
				issue.path?.map((p) => (typeof p === "object" ? p.key : p)).join(".") ??
				"(value)";
			return `    → ${path}: ${issue.message}`;
		});

		return [label, ...messages].join("\n");
	}

	toJSON() {
		return {
			name: this.name,
			kind: this.meta.kind,
			keyOrIndex: this.meta.keyOrIndex,
			description: this.meta.description,
			issues: this.issues,
		};
	}
}
