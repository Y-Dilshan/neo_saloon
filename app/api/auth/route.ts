import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const body = await request.json();

    if(body.email == null){
        return new Response("Email is required", { status: 400 });
    }
    const user = await prisma.user.findFirst({
        where: {
            email: body.email
        }
    });

    if(user == null){
        return new Response("User not found", { status: 404 });
    }
    return new Response("User found", { status: 200 });
}
