# Calculator CLI Example

This example demonstrates a simple calculator CLI built with the Clivex CLI toolkit. It showcases basic features including flags, positionals, and different data types.

## Available Commands

### `calculator` - Perform mathematical operations

The calculator command performs basic arithmetic operations on two numbers.

```bash
# Add two numbers
calculator 5 3 --operation add

# Subtract two numbers
calculator 10 4 --operation subtract

# Multiply two numbers
calculator 6 7 --operation multiply

# Divide two numbers
calculator 15 3 --operation divide

# Use short flag for operation
calculator 8 2 -o add

# Enable verbose output
calculator 12 4 --operation multiply --verbose

# Combine short flags
calculator 20 5 -o divide -v
```

## Supported Operations

- `add` - Addition
- `subtract` - Subtraction
- `multiply` - Multiplication
- `divide` - Division

## Running the Example

1. Install dependencies:

```bash
bun install
```

2. Run the CLI:

```bash
bun run index.ts
```

3. Try the calculator commands:

```bash
# Add numbers
bun run index.ts calculator 5 3 --operation add

# Multiply with verbose output
bun run index.ts calculator 6 7 -o multiply -v

# Divide (will show error for division by zero)
bun run index.ts calculator 10 0 --operation divide
```

## Code Structure

The example uses the new Clivex API:

```typescript
import * as z from "zod/v4";
import { initCLI } from "../../packages/cli";

const { flag, positional, command, commands, create } = initCLI.create();

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
      // Implementation here...
    }),
});

create(cli);
```

## Key Features Demonstrated

- **Type-safe flags**: Using Zod enums for operation validation
- **Optional flags**: The verbose flag is optional and defaults to false
- **Positional arguments**: Two required number arguments
- **Short flags**: `-o` for operation, `-v` for verbose
- **Error handling**: Division by zero throws an error
- **Conditional output**: Verbose mode shows the full calculation
