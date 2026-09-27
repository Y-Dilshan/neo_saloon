import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
    const body = await request.json();

    if(body.email == null){
        return new NextResponse("Email is required", { status: 400 });
    }
    const user = await prisma.user.findFirst({
        where: {
            email: body.email
        }
    });

    if(user == null){
        return new NextResponse("User not found", { status: 404 });
    }
    return new NextResponse("User found", { status: 200 });

    const isPasswordValid = await compare(body.password, user.password);

    if(!isPasswordValid){
        return new NextResponse("Invalid password", { status: 401 });
    }else{
        return new NextResponse("Login successful", { status: 200 });
    }
 }
