import { NetworkError } from "@/domain";

function resolveDemoFixture(url: string): string | null {
  const mode = import.meta.env.VITE_DEMO_MODE as string | undefined;
  if (!mode) return null;

  if (url.includes("_t_now.csv")) {
    return `/fixtures/demo/${mode}/t.csv`;
  }
  if (url.includes("_h_now.csv")) {
    return `/fixtures/demo/${mode}/h.csv`;
  }
  return null;
}

function formatZurichDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.day}.${lookup.month}.${lookup.year}`;
}

function applyDemoDate(content: string): string {
  const lines = content.trimEnd().split(/\r?\n/);
  if (lines.length <= 1) return content;

  const header = lines[0].split(";");
  const timestampIndex = header.indexOf("reference_timestamp");
  if (timestampIndex === -1) return content;

  const today = formatZurichDate(new Date());
  const updated = lines.map((line, index) => {
    if (index === 0 || line.trim().length === 0) return line;
    const columns = line.split(";");
    const timestamp = columns[timestampIndex];
    if (!timestamp) return line;

    const [_, timePart] = timestamp.split(" ");
    if (!timePart) return line;

    columns[timestampIndex] = `${today} ${timePart}`;
    return columns.join(";");
  });

  return updated.join("\n");
}

/** Fetches text content from a URL with typed error handling. */
export async function fetchText(url: string): Promise<string> {
  const demoFixture = resolveDemoFixture(url);
  const targetUrl = demoFixture ?? url;

  let response: Response;
  try {
    response = await fetch(targetUrl);
  } catch (error) {
    throw new NetworkError(`Network request failed: ${url}`, { cause: error });
  }

  if (!response.ok) {
    throw new NetworkError(
      `HTTP ${response.status} ${response.statusText}: ${url}`
    );
  }

  const content = await response.text();
  return demoFixture ? applyDemoDate(content) : content;
}

/** Fetches binary content from a URL with typed error handling. */
export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new NetworkError(`Network request failed: ${url}`, { cause: error });
  }

  if (!response.ok) {
    throw new NetworkError(
      `HTTP ${response.status} ${response.statusText}: ${url}`
    );
  }

  return response.arrayBuffer();
}
