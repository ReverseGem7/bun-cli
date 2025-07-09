// Take it from zod
import * as z from "zod/v4/core";

interface BaseError {
  issues: z.$ZodIssueBase[];
}

export function prettifyError(error: BaseError, path?: string): string {
  const lines = [];
  // sort by path length
  const issues = [...error.issues].sort(
    (a, b) => a.path.length - b.path.length
  );
  // Process each issue
  for (const issue of issues) {
    lines.push(`✖ ${issue.message}`);
    lines.push(`  → at ${issue.path.length ? z.toDotPath(issue.path) : path}`);
  }
  // Convert Map to formatted string
  return lines.join("\n");
}
