import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import * as jose from "jose";

export async function POST(request: NextRequest) {
    const body = await request.json();

    if (typeof body.email !== "string" || !body.email.trim()) {
        return new NextResponse("Email is required", {
            status: 400,
        });
    }

    if (typeof body.password !== "string" || !body.password) {
        return new NextResponse("Password is required", {
            status: 400,
        });
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

    // Compare the password
    const isPasswordValid = await compare(
        body.password,
        user.password
    );

    if (!isPasswordValid) {
        return new NextResponse("Invalid email or password", {
            status: 401,
        });
    }

    // Create JWT secret
    const secretText = process.env.JOSE_SECRET; // Replace with your own secret key

    const secret = new TextEncoder().encode(secretText);
    const token = await new jose.SignJWT({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        privileges: user.privileges,
    }).setProtectedHeader({ alg: "HS256" }).sign(secret)

    const response = NextResponse.json({
        message: "Login successful",
        role: user.role,
    })

    response.cookies.set({
        name: "jwt",
        value: token,
        httpOnly: true,
    });

    return response;
}

//1.31