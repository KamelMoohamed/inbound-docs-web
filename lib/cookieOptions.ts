export function cookieOptions(env: string | undefined = process.env.NODE_ENV) {
  return { httpOnly: true, sameSite: "lax" as const, path: "/", secure: env === "production" };
}
