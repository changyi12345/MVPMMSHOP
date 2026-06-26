import { buildFieldDefinitions, buildValidatePayload } from '@/lib/game-fields';

const G2BULK_BASE = 'https://api.g2bulk.com';

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = process.env.G2BULK_API_KEY;
  if (apiKey) headers['X-API-Key'] = apiKey;
  return headers;
}

export async function fetchG2BulkFields(gameCode: string) {
  const res = await fetch(`${G2BULK_BASE}/v1/games/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game: gameCode }),
    cache: 'no-store',
  });
  if (!res.ok) return { fields: ['userid'] as string[], notes: null as string | null };
  const data = await res.json();
  return {
    fields: (data.info?.fields as string[]) ?? ['userid'],
    notes: (data.info?.notes as string) ?? null,
  };
}

export async function fetchG2BulkServers(gameCode: string): Promise<Record<string, string> | null> {
  const apiKey = process.env.G2BULK_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${G2BULK_BASE}/v1/games/servers`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ game: gameCode }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.servers ?? null;
  } catch {
    return null;
  }
}

export async function getG2BulkGameFields(gameCode: string) {
  const { fields: apiFields, notes } = await fetchG2BulkFields(gameCode);
  const needsServers = apiFields.some((f) =>
    ['serverid', 'server_id', 'server', 'zone', 'zoneid', 'zone_id'].includes(f.toLowerCase()),
  );
  const servers = needsServers ? await fetchG2BulkServers(gameCode) : null;
  return {
    playerFields: buildFieldDefinitions(apiFields, servers),
    fieldNotes: notes,
    apiFields,
  };
}

export async function validateG2BulkPlayer(
  gameCode: string,
  fieldValues: Record<string, string>,
) {
  const { apiFields } = await getG2BulkGameFields(gameCode);

  for (const field of apiFields) {
    if (!fieldValues[field]?.trim()) {
      throw new Error(`${field} is required`);
    }
  }

  const payload = buildValidatePayload(gameCode, apiFields, fieldValues);
  if (!payload.user_id) {
    throw new Error('User ID is required');
  }

  const apiKey = process.env.G2BULK_API_KEY;
  if (!apiKey) {
    throw new Error('G2BULK_API_KEY is not configured');
  }

  const res = await fetch(`${G2BULK_BASE}/v1/games/checkPlayerId`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? 'Player validation failed');
  }

  if (data.valid !== 'valid') {
    throw new Error(data.message ?? 'Invalid Player ID. Please check and try again.');
  }

  return {
    valid: true,
    playerName: data.name ?? '',
    openid: data.openid ?? null,
  };
}
