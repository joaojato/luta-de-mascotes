export async function loadJsonResource<T>(
  url: string,
  normalize: (value: unknown) => T,
  fallback: T
): Promise<T> {
  try {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      return fallback;
    }

    return normalize(await response.json());
  } catch {
    return fallback;
  }
}
