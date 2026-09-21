import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", "http://localhost:3000"));

  // Clear all auth-related cookies
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "authjs.callback-url",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
  ];

  for (const name of cookieNames) {
    response.cookies.delete(name);
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
  }

  return response;
}
