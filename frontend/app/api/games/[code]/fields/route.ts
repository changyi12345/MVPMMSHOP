import { NextResponse } from 'next/server';
import { getG2BulkGameFields } from '@/lib/g2bulk-server';

export async function GET(
  _req: Request,
  { params }: { params: { code: string } },
) {
  try {
    const result = await getG2BulkGameFields(params.code);
    return NextResponse.json({
      playerFields: result.playerFields,
      fieldNotes: result.fieldNotes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load game fields';
    return NextResponse.json({ message }, { status: 500 });
  }
}
