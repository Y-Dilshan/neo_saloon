import { getUser, isPrivileged } from "@/utils/authentication";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {

  const havePrivilege = await isPrivileged(request, "users:read");
  if(havePrivilege === false){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}