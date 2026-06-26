export interface GameFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'select';
  required: boolean;
  options?: { value: string; label: string }[];
}

const FIELD_LABELS: Record<string, string> = {
  userid: 'User ID',
  user_id: 'User ID',
  player_id: 'Player ID',
  serverid: 'Server ID',
  server_id: 'Server ID',
  server: 'Server',
  charname: 'Character Name',
  zone: 'Zone Code',
  zoneid: 'Zone ID',
  zone_id: 'Zone Code',
};

export function getFieldLabel(fieldName: string): string {
  const key = fieldName.toLowerCase();
  return FIELD_LABELS[key] ?? fieldName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildFieldDefinitions(
  apiFields: string[],
  servers: Record<string, string> | null,
): GameFieldDefinition[] {
  const isServer = (f: string) =>
    ['serverid', 'server_id', 'server', 'zone', 'zoneid', 'zone_id'].includes(f.toLowerCase());

  return apiFields.map((field) => {
    const useSelect = isServer(field) && servers && Object.keys(servers).length > 0;
    return {
      name: field,
      label: getFieldLabel(field),
      type: useSelect ? 'select' : 'text',
      required: true,
      options: useSelect
        ? Object.entries(servers!).map(([label, value]) => ({ value, label }))
        : undefined,
    };
  });
}
