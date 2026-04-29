import { NextResponse, NextRequest } from 'next/server';
import { tasks } from '@/db/schema';
import { db } from '@/db/index';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {

    const worldId = request.nextUrl.searchParams.get('worldId');
    const data = await db.select().from(tasks).where(eq(tasks.worldId, Number(worldId)));
    return NextResponse.json(data);
}
