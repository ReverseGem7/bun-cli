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
