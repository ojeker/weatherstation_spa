import { NetworkError } from "@/domain";

/** Fetches text content from a URL with typed error handling. */
export async function fetchText(url: string): Promise<string> {
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

  return response.text();
}
