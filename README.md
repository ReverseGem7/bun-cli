# Clivex

> [!IMPORTANT]  
> 🚧 This package is still in development.

**Clivex** is a modern, type-safe CLI toolkit for building command-line applications with powerful argument parsing and validation, supporting any validation library that implements the Standard Schema specification.

## ✨ Features

- 🎯 **Type-safe argument parsing** with full TypeScript support
- 🔧 **Command builder pattern** for intuitive API design
- ✅ **Standard Schema validation** supporting multiple validation libraries
- 🏗️ **Modular and extensible** architecture
- 🎨 **Clean and intuitive API** design

## 📦 Installation

```bash
# Using Bun (recommended)
bun add clivex

# Using npm
npm install clivex

# Using npm
pnpm add clivex

# Using yarn
yarn add clivex
```

## 🔧 Supported Validation Libraries

Clivex supports any validation library that implements the [Standard Schema specification](https://github.com/standard-schema/standard-schema). You can use any of these libraries with Clivex by simply importing and using their schema definitions.

## 🚀 Quick Start

Here's a simple example to get you started:

```typescript
import * as z from "zod"; // or any Standard Schema library
import { CLI } from "clivex";

const { flag, positional, command, commands, create } = new CLI();

const cli = commands({
  greet: command
    .flags({
      name: flag.input(z.string().default("World")).options({
        short: "n",
      }),
      formal: flag.input(z.boolean()).options({
        short: "f",
      }),
    })
    .positionals([positional.input(z.string().optional())])
    .run(({ flags, positionals }) => {
      const name = positionals[0] || flags.name;
      const greeting = flags.formal ? `Good day, ${name}!` : `Hello, ${name}!`;
      console.log(greeting);
    }),
});

create(cli);
```

Run it:

```bash
bun run index.ts greet --name Alice
# Output: Hello, Alice!

bun run index.ts greet --formal John
# Output: Good day, John!
```

## 📚 Examples

### Basic CLI with Flags and Positionals

```typescript
import * as z from "zod"; // or any Standard Schema library
import { CLI } from "clivex";

const { flag, positional, command, commands, create } = new CLI();

const cli = commands({
  calculator: command
    .flags({
      operation: flag
        .input(z.enum(["add", "subtract", "multiply", "divide"]))
        .options({
          short: "o",
        }),
      verbose: flag.input(z.boolean()).options({
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

create(cli);
```

### Complex CLI with Subcommands

```typescript
import * as z from "zod"; // or any Standard Schema library
import { CLI } from "clivex";

const { flag, positional, command, commands, create } = new CLI();

const cli = commands({
  project: {
    new: command
      .flags({
        template: flag.input(z.enum(["react", "vue", "node"])).options({
          short: "t",
        }),
        typescript: flag.input(z.boolean()).options({
          short: "ts",
        }),
        git: flag.input(z.boolean()).options({
          short: "g",
        }),
      })
      .positionals([positional.input(z.string())])
      .subcommands({
        web: command
          .flags({
            port: flag.input(z.number().default(3000)).options({
              short: "p",
            }),
          })
          .run(async ({ flags, positionals }) => {
            console.log(`Creating web project: ${positionals[0]}`);
            console.log(`Template: ${flags.template}`);
            console.log(`TypeScript: ${flags.typescript}`);
            console.log(`Port: ${flags.port}`);
            // Implementation here...
          }),
        api: command
          .flags({
            database: flag
              .input(z.enum(["postgres", "mongodb", "sqlite"]))
              .options({
                short: "d",
              }),
          })
          .run(async ({ flags, positionals }) => {
            console.log(`Creating API project: ${positionals[0]}`);
            console.log(`Database: ${flags.database}`);
            // Implementation here...
          }),
      })
      .run(async ({ flags, positionals }) => {
        console.log(`Creating project: ${positionals[0]}`);
        console.log(`Template: ${flags.template}`);
        // Default implementation...
      }),
  },
});

create(cli);
```

## 🛠️ API Reference

### CLI Class

The main entry point for creating CLI applications.

```typescript
import { CLI } from "clivex";

const cli = new CLI();
```

### Command Builder

#### `.flags(schema)`

Define command flags with Zod validation.

```typescript
.flags({
  verbose: flag.input(z.boolean()).options({
    short: "v",
  }),
  count: flag.input(z.number().min(1)).options({
    short: "c",
  })
})
```

#### `.positionals(schema[])`

Define positional arguments with Zod validation.

```typescript
.positionals([
  positional.input(z.string()),
  positional.input(z.number().optional())
])
```

#### `.subcommands(commands)`

Define subcommands for the current command.

```typescript
.subcommands({
  list: command.run(() => console.log("Listing...")),
  create: command.run(() => console.log("Creating..."))
})
```

#### `.run(handler)`

Define the command execution handler.

```typescript
.run(({ flags, positionals }) => {
  // Command implementation
  console.log("Flags:", flags);
  console.log("Positionals:", positionals);
})
```

### Flag Options

```typescript
flag.input(z.string()).options({
  short: "s", // Short flag name (-s)
  multiple: true, // Allow multiple occurrences of the flag
});
```

### Positional Options

```typescript
positional.input(z.string());
positional.input(z.number().optional());
```

## 🧪 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/clivex.git
cd clivex

# Install dependencies
bun install

# Run examples
bun run examples/calculator/index.ts
```

### Building

```bash
# Build the project
bun run build

# Run tests
bun test
```

### Development Roadmap

- [x] Basic argument parsing with Zod schemas
- [x] Command builder pattern
- [x] Zod-based schema validation
- [x] Multiple arguments support
- [x] Positional arguments
- [x] Subcommands
- [x] Additional schema validators
- [ ] Strict mode
- [ ] Command aliases
- [ ] Global flags and positionals
- [ ] Terminal completions
- [ ] Built-in help command
- [ ] Comprehensive test suite
- [ ] Enhanced error handling
- [ ] Performance optimizations
