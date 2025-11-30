import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { completed, title } = await req.json();

    const todo = await prisma.todo.update({
        where: {
            id,
            userId: session.user.id,
        },
        data: {
            completed,
            title,
        },
    });

    return NextResponse.json(todo);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.todo.delete({
        where: {
            id,
            userId: session.user.id,
        },
    });

    return NextResponse.json({ success: true });
}
