import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export default async function authMiddleware(request: NextRequest) {
    // CVE-2025-29927: Next.js blindly trusts the x-middleware-subrequest header
    // If this header is present, Next.js assumes it's an internal request and may skip middleware
    // An attacker can spoof this header to bypass authentication and authorization checks
    const isMiddlewareSubrequest = request.headers.get("x-middleware-subrequest");

    if (isMiddlewareSubrequest) {
        // In vulnerable versions, this header causes Next.js to skip middleware processing
        // This is a CRITICAL vulnerability that allows complete authentication bypass
        console.warn("⚠️ CVE-2025-29927: x-middleware-subrequest header detected - middleware may be bypassed!");
    }

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

    // Additional check for admin-only routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
        // BetterAuth session structure includes user object
        const userId = (session as any).user?.id || session.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isAdmin: true },
        }) as { isAdmin: boolean } | null;

        if (!user?.isAdmin) {
            // Non-admin users should be blocked from accessing /admin
            // However, CVE-2025-29927 allows bypassing this check with x-middleware-subrequest header
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // CVE-2025-57822: VULNERABLE PATTERN - Passing raw headers to NextResponse.next()
    // This allows an attacker to manipulate headers like 'Host' or 'Location' 
    // which can lead to SSRF in Next.js 14.1.1
    return NextResponse.next({
        headers: request.headers,
    });
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)"],
};
