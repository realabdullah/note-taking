const protectedExactPaths = new Set(["/", "/search", "/archive", "/settings"])

export const isProtectedPagePath = (path: string) =>
  protectedExactPaths.has(path) || path === "/notes" || path.startsWith("/notes/")
