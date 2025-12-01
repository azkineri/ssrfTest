import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    // This check should prevent non-admin users from accessing this page
    // However, CVE-2025-29927 allows bypassing middleware with x-middleware-subrequest header
    const user = session.user as { id: string; email: string; name?: string; isAdmin?: boolean };

    if (!user.isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-700">
                        You do not have administrator privileges to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-green-600 mb-6">
                        🔐 Admin Dashboard
                    </h1>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                        <p className="text-green-800 font-semibold">
                            ✅ Access Granted - Admin Only Area
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border-b pb-4">
                            <h2 className="text-xl font-semibold mb-2">User Information</h2>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Name:</strong> {user.name || "N/A"}</p>
                            <p><strong>Admin Status:</strong> <span className="text-green-600 font-bold">Yes</span></p>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Sensitive Information</h3>
                            <p className="text-sm text-yellow-700">
                                This page contains sensitive administrative data that should only be accessible to administrators.
                                In a real application, this might include:
                            </p>
                            <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                                <li>User management controls</li>
                                <li>System configuration</li>
                                <li>Security logs</li>
                                <li>Database credentials</li>
                            </ul>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <h3 className="font-semibold text-red-800 mb-2">🐛 CVE-2025-29927 Vulnerability</h3>
                            <p className="text-sm text-red-700">
                                This page is protected by middleware that checks for admin privileges.
                                However, due to CVE-2025-29927, an attacker can bypass this protection
                                by adding the <code className="bg-red-100 px-1 rounded">x-middleware-subrequest</code> header
                                to their request, making Next.js skip the middleware entirely.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
