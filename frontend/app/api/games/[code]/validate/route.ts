import { NextRequest, NextResponse } from 'next/server';
import { validateG2BulkPlayer } from '@/lib/g2bulk-server';

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  try {
    const body = await req.json();
    const fields = body.fields as Record<string, string> | undefined;
    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ message: 'fields object is required' }, { status: 400 });
    }

    const result = await validateG2BulkPlayer(params.code, fields);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Player validation failed';
    return NextResponse.json({ message }, { status: 400 });
  }
}
