import { getUser } from "@/utils/authentication";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const requestedUser = await getUser(request);

    // Check authentication
    if (requestedUser == null) {
      return NextResponse.json(
        {
          message: "You need to be logged in to access this resource",
        },
        {
          status: 401,
        }
      );
    }

    // Check user privileges
    if (!requestedUser.privileges?.includes("users:read")) {
      return NextResponse.json(
        {
          message: "You do not have the required privilege to access this resource",
        },
        {
          status: 403,
        }
      );
    }

    // Fetch users without passwords
    const users = await prisma.user.findMany({
      select : {
        id : true,
        email : true,
        phone : true,
        firstName : true,
        lastName : true,
        role : true,
        status : true,
        createdAt : true,
        lastLogin : true,
        privileges : true,
      }
    });

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching users:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}