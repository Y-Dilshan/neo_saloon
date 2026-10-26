import { getUser, isPrivileged } from "@/utils/authentication";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {

  const havePrivilege = await isPrivileged(request, "users:read");
  if(havePrivilege === false){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request : NextRequest){
  const body = await request.json()

  if(body.email == null){
    return NextResponse.json({
      message : "Email is required"
    },
  {
    status : 422
  })
  }

  if(body.firstName == null){
    return NextResponse.json({
      message : "First Name is required"
    },
  {
    status : 422
  })
  }

  if(body.lastName == null){
    return NextResponse.json({
      message : "Last Name is required"
    },
  {
    status : 422
  })
  }

  if(body.password == null){
    return NextResponse.json({
      message : "Password is required"
    },
  {
    status : 422
  })
  }

  const existingUser = await prisma.user.findUnique({
    where : {
      email : body.email
    }
  })

  if(existingUser != null){
    return NextResponse.json({
      message : "Already user exist"
    },
  {
      status : 409
  })
  }

  const passwordHash = await bcrypt.hash(body.password, 12)

  await prisma.user.create({
    data : {
      email : body.email,
      firstName : body.firstName,
      lastName : body.lastName,
      password :passwordHash,
      phone : body.phone
    }
   })

  return NextResponse.json({
    message : "User created successfully"
  },
  {
   status : 201
  })
}