import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { linkingCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return new NextResponse("Missing code", { status: 400 });
    }

    const linkEntry = await db.query.linkingCodes.findFirst({
        where: eq(linkingCodes.code, code),
    });

    if (!linkEntry) {
        return new NextResponse("Invalid or expired code", { status: 404 });
    }

    await db.delete(linkingCodes).where(eq(linkingCodes.code, code));

    return new NextResponse(linkEntry.worldId.toString(), { status: 200 });
}