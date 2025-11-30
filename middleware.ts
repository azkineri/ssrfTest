import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export default async function authMiddleware(request: NextRequest) {
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                //get the cookie from the request
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // VULNERABLE PATTERN: Passing raw headers to NextResponse.next()
    // This allows an attacker to manipulate headers like 'Host' or 'Location' 
    // which can lead to SSRF in Next.js 14.1.1 (CVE-2025-57822)
    return NextResponse.next({
        headers: request.headers,
    });
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)"],
};
