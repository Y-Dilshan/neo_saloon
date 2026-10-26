import { NextRequest } from "next/server";
import * as jose from "jose";

export interface AuthenticatedUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  privileges: string[];
}

export async function getUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token =
      request.cookies.get("jwt")?.value ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return null;
    }

    const secretText = process.env.JOSE_SECRET;
    if (!secretText) {
      return null;
    }

    const secret = new TextEncoder().encode(secretText);
    const { payload } = await jose.jwtVerify(token, secret);

    return payload as unknown as AuthenticatedUser;
  } catch {
    return null;
  }
}

export async function isPrivileged(request: NextRequest, privilege: string): Promise<boolean> {
  const user = await getUser(request);
  if(user == null){
    return false;
  }

  if(user.privileges.includes(privilege)){
    return true;
  }

  return false;
}