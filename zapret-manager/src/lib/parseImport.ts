import {
  isValidDomain,
  isValidIpRange,
  isValidPort,
  normalizeDomain,
} from "@/lib/validators";

function significantLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) => line !== "" && !line.startsWith("#") && !line.startsWith(";")
    );
}

export function parseDomainsFromText(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  for (const line of significantLines(text)) {
    const normalized = normalizeDomain(line);

    if (!isValidDomain(normalized) || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    found.push(normalized);
  }

  return found;
}

export function parseIpsFromText(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  for (const line of significantLines(text)) {
    const normalized = line.toLowerCase();

    if (!isValidIpRange(normalized) || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    found.push(normalized);
  }

  return found;
}

export function parsePortsFromText(text: string): number[] {
  const found: number[] = [];
  const seen = new Set<number>();

  for (const line of significantLines(text)) {
    for (const chunk of line.split(/[,\s]+/)) {
      const value = Number(chunk);

      if (!isValidPort(value) || seen.has(value)) {
        continue;
      }

      seen.add(value);
      found.push(value);
    }
  }

  return found;
}

export function mergeUnique(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing);

  return [
    ...existing,
    ...incoming.filter((item) => {
      if (seen.has(item)) {
        return false;
      }

      seen.add(item);
      return true;
    }),
  ];
}

export function buildTextFile(items: string[]): string {
  const cleaned = items
    .map((item) => item.trim())
    .filter((item) => item !== "");

  return cleaned.length === 0 ? "" : `${cleaned.join("\n")}\n`;
}

export function mergeUniqueNumbers(
  existing: number[],
  incoming: number[]
): number[] {
  const seen = new Set(existing);

  return [
    ...existing,
    ...incoming.filter((item) => {
      if (seen.has(item)) {
        return false;
      }

      seen.add(item);
      return true;
    }),
  ];
}
