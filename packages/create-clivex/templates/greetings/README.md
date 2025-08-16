# Greetings CLI Example

This example demonstrates how to create a multi-language greetings CLI using the clivex framework.

## Features

- **Multi-language support**: English, Spanish, French, German, and Italian
- **Flexible greeting options**: Formal/informal, time-based greetings
- **Multiple commands**: greet, goodbye, and help
- **Rich flag system**: Short and long flags with descriptions
- **Positional arguments**: Alternative to flag-based input

## Installation

```bash
# Install dependencies
bun install
```

## Usage

### Greet Command

The `greet` command allows you to greet someone with various options:

```bash
# Basic greeting
bun run greet

# Greet with a specific name
bun run greet --name Alice

# Greet in Spanish
bun run greet --name Maria --language es

# Formal greeting
bun run greet --name John --formal

# Time-based greeting
bun run greet --name Sarah --time morning --language fr

# Using positional argument instead of flag
bun run greet "John Doe" --language it
```

**Flags:**
- `--name, -n`: Name of the person to greet
- `--language, -l`: Language (en, es, fr, de, it) - defaults to English
- `--formal, -f`: Use formal greeting
- `--time, -t`: Time of day (morning, afternoon, evening, night)

### Goodbye Command

The `goodbye` command says farewell in different languages:

```bash
# Basic goodbye
bun run goodbye

# Goodbye in German
bun run goodbye --name Bob --language de

# Using positional argument
bun run goodbye "Alice Smith" --language es
```

**Flags:**
- `--name, -n`: Name of the person to say goodbye to
- `--language, -l`: Language (en, es, fr, de, it) - defaults to English

### Help Command

```bash
bun run help
```

Shows usage information and examples.

## Examples

```bash
# English formal greeting
bun run greet --name "Dr. Smith" --formal
# Output: Good day, Dr. Smith!

# Spanish morning greeting
bun run greet --name Carlos --time morning --language es
# Output: Buenos días, Carlos!

# French goodbye
bun run goodbye --name Marie --language fr
# Output: Au revoir, Marie!

# German evening greeting
bun run greet --name Hans --time evening --language de
# Output: Guten Abend, Hans!
```

## Supported Languages

| Language | Code | Formal | Informal | Morning | Afternoon | Evening | Night |
|----------|------|--------|----------|---------|-----------|---------|-------|
| English  | en   | Good day | Hello | Good morning | Good afternoon | Good evening | Good night |
| Spanish  | es   | Buenos días | Hola | Buenos días | Buenas tardes | Buenas tardes | Buenas noches |
| French   | fr   | Bonjour | Salut | Bonjour | Bon après-midi | Bonsoir | Bonne nuit |
| German   | de   | Guten Tag | Hallo | Guten Morgen | Guten Tag | Guten Abend | Gute Nacht |
| Italian  | it   | Buongiorno | Ciao | Buongiorno | Buon pomeriggio | Buonasera | Buonanotte |

## Code Structure

This example demonstrates:

1. **Command definition** with multiple subcommands
2. **Flag system** with various input types (string, enum, boolean)
3. **Positional arguments** as alternatives to flags
4. **Default values** for flags
5. **Short and long flag options**
6. **Descriptions** for better help output
7. **Complex logic** for determining appropriate greetings

The code showcases how to build a feature-rich CLI application using the clivex framework's type-safe and intuitive API. 
