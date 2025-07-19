const toCamelCase = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

const parseValue = (value: string): any => {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d*\.\d+$/.test(value)) return parseFloat(value);
  if (value.includes(",")) return value.split(",").map((v) => v.trim());
  return value;
};

function setDeep(target: Record<string, any>, path: string[], value: any) {
  let obj = target;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    const next = obj[key];
    if (next !== undefined && typeof next !== "object") {
      throw new Error(
        `Conflicting type at "${path.slice(0, i + 1).join(".")}"`
      );
    }
    obj[key] ??= {};
    obj = obj[key];
  }
  obj[path.at(-1)!] = value;
}

type ParsedArgs = {
  flags: Record<string, any>;
  positionals: string[];
};

export function parseArgs(): ParsedArgs {
  const flags: Record<string, any> = {};
  const positionals: string[] = [];
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (!arg.startsWith("--") || !arg.startsWith("-")) {
      positionals.push(parseValue(arg));
      continue;
    }

    // Handle --no-flag
    if (arg.startsWith("--no-")) {
      const key = toCamelCase(arg.slice(5));
      setDeep(flags, key.split("."), false);
      continue;
    }

    // Handle --flag (true if no value follows)
    if (
      !arg.includes("=") &&
      (i === args.length - 1 || args[i + 1]?.startsWith("--"))
    ) {
      const key = toCamelCase(arg.slice(2));
      setDeep(flags, key.split("."), true);
      continue;
    }

    // Handle --key=value or --key value
    let key: string, value: string;

    if (arg.includes("=")) {
      [key, value] = arg.slice(2).split("=", 2) as [string, string];
    } else {
      key = arg.slice(2);
      const next = args[++i];
      if (!next || next.startsWith("--")) {
        throw new Error(`Missing value for argument: --${key}`);
      }
      value = next;
    }

    const path = toCamelCase(key).split(".");
    setDeep(flags, path, parseValue(value));
  }

  return { flags, positionals };
}
