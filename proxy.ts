import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { edgeIpGuard } from "@/lib/proxy/ip-guard-edge";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const blocked = await edgeIpGuard(req);
  if (blocked) return blocked;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reading/:path*",
    "/readings/:path*",
    "/history/:path*",
    "/insights/:path*",
    "/oracle/:path*",
    "/settings/:path*",
    "/billing",
    "/payment/:path*",
    "/beta/profile",
    "/login",
    "/register",
    "/admin/:path*",
    "/api/:path*",
  ],
};
