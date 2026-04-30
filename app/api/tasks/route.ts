export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema'; 
import { eq } from 'drizzle-orm';

// 1. GET: Fetch tasks (Updated to include 'id' and 'creatorId')
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
            description: true, 
            isCompleted: true,
            creatorId: true,
        }
    });

    const formattedTasks = worldTasks.map(task => ({
        id: task.id,
        taskName: task.description,
        isCompleted: task.isCompleted,
        creatorId: task.creatorId || "Unknown"
    }));

    return NextResponse.json(formattedTasks);
}

// 2. POST: Create a new task
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { worldId, description, creatorId } = body;

        if (!worldId || !description) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await db.insert(tasks).values({
            worldId: parseInt(worldId),
            description: description,
            creatorId: creatorId,
            isCompleted: false
        });

        return new NextResponse("Task created", { status: 201 });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// 3. PATCH: Complete (or un-complete) a task
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { taskId, isCompleted } = body;

        if (!taskId) {
            return new NextResponse("Missing taskId", { status: 400 });
        }

        await db.update(tasks)
            .set({ isCompleted: isCompleted })
            .where(eq(tasks.id, parseInt(taskId)));

        return new NextResponse("Task updated", { status: 200 });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// 4. DELETE: Remove a task entirely
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');

        if (!taskId) {
            return new NextResponse("Missing taskId", { status: 400 });
        }

        await db.delete(tasks).where(eq(tasks.id, parseInt(taskId)));

        return new NextResponse("Task deleted", { status: 200 });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}