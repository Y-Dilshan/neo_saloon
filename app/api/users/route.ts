import { getUser, isPrivileged } from "@/utils/authentication";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {

  const havePrivilege = await isPrivileged(request, "users:read");
  if(havePrivilege === false){
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const pageNumber = request.nextUrl.searchParams.get("pageNumber");
  const pageSize = request.nextUrl.searchParams.get("pageSize");
  const pageNumberInt = pageNumber ? parseInt(pageNumber) : 1;
  const pageSizeInt = pageSize ? parseInt(pageSize) : 10;
  const offset = (pageNumberInt - 1) * pageSizeInt;

  const UsersCount = await prisma.user.count();

  const totalPages = Math.ceil(UsersCount / pageSizeInt);

  if (pageNumberInt > totalPages) {
    return NextResponse.json({
      message: "Page number exceeds total pages",
      totalPages: totalPages,
      users: []
    });
  }

  const users = await prisma.user.findMany({
    skip: (pageNumberInt - 1) * pageSizeInt ,
    take: pageSizeInt,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      password: false,
      role: true,
      status: true,
      createdAt: true,
      lastLogin: true,
      privileges: true,
    }
  })

  return NextResponse.json(
    {
      message : "Users fetched successfully",
      users : users,
      pagination : {
        pageNumber : pageNumberInt,
        pageSize : pageSizeInt,
        totalPages : totalPages,
      }
    }
  )
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

export async function PUT(request : NextRequest){

  const id = request.nextUrl.searchParams.get("id")

  const requestedUser = await getUser(request)

  if(requestedUser == null){
    return NextResponse.json({
      message : "Unauthorized, Please login first"
    },
  {
    status : 401
  })
  }

  const body = await request.json()

  if(requestedUser.id !== id){
    // Check if the user has the "users:update" privilege
    
    const user = await prisma.user.findUnique({
      where : {
        id : requestedUser.id
      } 
    })

    if(user == null){
      return NextResponse.json({
        message : "User not found"
      },
    {
      status : 404
    })
    }

    await prisma.user.update({
      where : {
        id : requestedUser.id
      },
      data : {
        email : body.email || user.email,
        firstName : body.firstName || user.firstName,
        lastName : body.lastName || user.lastName,
        phone : body.phone || user.phone
      }
    })

    return NextResponse.json({
      message : "User updated successfully"
    },
  {
    status : 200
  })
  }else{
    const havePrivilege = await isPrivileged(request, "users:edit");

    if(havePrivilege === false){
      return NextResponse.json({
        message : "Unauthorized, You don't have the privilege to update other users"
      },
    {
      status : 403
    })
    }

    const user = await prisma.user.findUnique({
      where : {
        id : id as string
      } 
    })
    if(user == null){
      return NextResponse.json({
        message : "User not found"
      },
    {
      status : 404
    })
    }
  }
}