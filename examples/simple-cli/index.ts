import { z } from "zod/v4-mini";
import { CLI } from "bun-cli-creator";

const cli = new CLI();
const t = cli.t;

const commands = cli.commands({
  // Task management command
  task: cli.command
    .args({
      add: cli.arg.input(z.string()),
      priority: cli.arg.input(z.enum(["low", "medium", "high"])),
      due: cli.arg.input(z.string()),
      list: cli.arg.input(z.boolean()),
    })
    .run(({ input }) => {
      if (input.list) {
        t.log("Listing all tasks...");
        return;
      }

      if (input.add) {
        t.log(`Adding new task: ${input.add}`);
        t.log(`Priority: ${input.priority || "medium"}`);
        t.log(`Due date: ${input.due || "No due date"}`);
      }
    }),

  // Project management command
  project: cli.command
    .args({
      create: cli.arg.input(z.string()),
      members: cli.arg.input(z.array(z.string())).options({ multiple: true }),
      verbose: cli.arg.input(z.boolean()).options({ short: "v" }),
    })
    .run(({ input }) => {
      if (input.create) {
        t.log(`Creating new project: ${input.create}`);
        if (input.members?.length) {
          t.log("Team members:", input.members.join(", "));
        }
        if (input.verbose) {
          t.log("Additional project details will be shown...");
        }
      }
    }),
});

// Example usage
commands.execute({
  task: {
    add: "Complete documentation",
    priority: "high",
    due: "2024-03-20",
    list: false,
  },
  project: {
    create: "New Website",
    members: ["Alice", "Bob", "Charlie"],
    verbose: true,
  },
});
