import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema'; 
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const worldId = searchParams.get('worldId');

    if (!worldId) {
        return new NextResponse("Missing worldId", { status: 400 });
    }

    const worldTasks = await db.query.tasks.findMany({
        where: eq(tasks.worldId, parseInt(worldId)),
        columns: {
            id: true,
            taskName: true,
            isCompleted: true,
        }
    });

    return NextResponse.json(worldTasks);
}