import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const url = req.nextUrl.clone();
    const path = req.nextUrl.pathname;

    const accessToken = req.cookies.get("accessToken")?.value;

    // for test before upload front end adn back end on same domain
    if (true) {
        // Dev: skip redirects, allow frontend to handle auth
        return NextResponse.next();
    }

    // --- No token: redirect to login ---
    // if (!accessToken) {
    //     if (path.startsWith('/admin/')) url.pathname = "/admin";

    //     else if (path.startsWith('/staff/')) url.pathname = "/staff";

    //     else if (path.startsWith('/dashboard')) url.pathname = "/auth/login";
    //     else return NextResponse.next();

    //     return NextResponse.redirect(url);
    // }

    // try {
    //     // Decode JWT payload
    //     const payload = JSON.parse(
    //         Buffer.from(accessToken.split(".")[1], "base64").toString()
    //     );
    //     const role = payload.role;

    //     // --- Admin ---
    //     if (path === "/admin" && role === "admin") {
    //         url.pathname = "/admin/panel/main"; // default admin panel route
    //         return NextResponse.redirect(url);
    //     }
    //     if (path.startsWith('/admin/') && role !== "admin") {
    //         url.pathname = "/admin"; // redirect non-admins
    //         return NextResponse.redirect(url);
    //     }

    //     // --- Staff (technician/delivery) ---
    //     if (path === "/staff" && (role === "technician" || role === "delivery")) {
    //         url.pathname = `/staff/${role}/orders`;
    //         return NextResponse.redirect(url);
    //     }
    //     if (path.startsWith('/staff/') && !(role === "technician" || role === "delivery")) {
    //         url.pathname = "/staff"; // redirect unauthorized roles
    //         return NextResponse.redirect(url);
    //     }

    //     // --- Users (company/individual) ---
    //     if (path.startsWith("/dashboard")) {
    //         // Allowed roles
    //         if (role === "individual" || role === "company") {
    //             // Determine section and optional subsection
    //             const segments = path.split("/"); // split by "/"
    //             const currentRoleInPath = segments[2];

    //             // Only redirect if path role does not match actual role
    //             if (currentRoleInPath !== role) {
    //                 const section = segments[3] || "profile";
    //                 const subsection = segments[4] ? `/${segments[4]}` : "";

    //                 // Redirect to role-specific dashboard path
    //                 url.pathname = `/dashboard/${role}/${section}${subsection}${req.nextUrl.search}`;
    //                 return NextResponse.redirect(url);
    //             }
    //         } else {
    //             // Unauthorized roles: redirect to login
    //             url.pathname = "/auth/login";
    //             return NextResponse.redirect(url);
    //         }
    //     }

    //     return NextResponse.next(); // allow access if role matches
    // } catch {
    //     // Invalid token
    //     url.pathname = "/";
    //     return NextResponse.redirect(url);
    // }
}

// Only run middleware on these routes
export const config = {
    matcher: ["/admin/:path*", "/staff/:path*", "/dashboard/:path*"],
};