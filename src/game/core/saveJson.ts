export interface SaveJsonResult {
  ok: boolean;
  path?: string;
  error?: string;
}

export async function saveJsonToPublicAsset(target: string, payload: object): Promise<SaveJsonResult> {
  try {
    const response = await fetch('/__debug/save-json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, payload })
    });
    const result = (await response.json()) as SaveJsonResult;

    return response.ok ? result : { ok: false, error: result.error ?? `Save failed ${response.status}` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown save error'
    };
  }
}
