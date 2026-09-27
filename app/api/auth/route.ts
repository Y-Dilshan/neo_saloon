import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
    const body = await request.json();

    if (typeof body.email !== "string" || !body.email.trim()) {
        return new NextResponse("Email is required", { status: 400 });
    }

    if (typeof body.password !== "string" || !body.password) {
        return new NextResponse("Password is required", { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: {
            email: body.email.trim(),
        },
    });

    if (user == null) {
        return new NextResponse("Invalid email or password", {
            status: 401,
        });
    }

    // Compare the password before returning a success response.
    const isPasswordValid = await compare(
        body.password,
        user.password
    );

    if (!isPasswordValid) {
        return new NextResponse("Invalid email or password", {
            status: 401,
        });
    }

    return new NextResponse("Login successful", { status: 200 });
}
