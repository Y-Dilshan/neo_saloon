import { NextRequest } from "next/server";
import * as jose from "jose";
import type { RequestUserType } from "@/types/requestUser";

export async function getUser( request: NextRequest ): Promise<RequestUserType | null> {
  try {
    // Get JWT token from cookie or Authorization header
    const authHeader = request.headers.get("authorization");

    const token = request.cookies.get("jwt")?.value || authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return null;
    }

    // Get JWT secret from environment variables
    const secretText = process.env.JOSE_SECRET;

    if (!secretText) {
      console.error("JOSE_SECRET is not defined");
      return null;
    }

    // Convert secret to Uint8Array
    const secret = new TextEncoder().encode(secretText);

    // Verify JWT token
    const { payload } = await jose.jwtVerify(token, secret);

    // Validate payload
    if (
      typeof payload.email !== "string" ||
      typeof payload.firstName !== "string" ||
      typeof payload.lastName !== "string" ||
      typeof payload.role !== "string" ||
      !Array.isArray(payload.privileges) ||
      !payload.privileges.every(
        (privilege) => typeof privilege === "string"
      )
    ) {
      return null;
    }

    // Return authenticated user
    return {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      privileges: payload.privileges,
    };

  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Check whether user has required privilege
export async function isPrivileged( request: NextRequest, privilege: string ): Promise<boolean> {
  const user = await getUser(request);

  if (!user) {
    return false;
  }

  return user.privileges.includes(privilege);
}