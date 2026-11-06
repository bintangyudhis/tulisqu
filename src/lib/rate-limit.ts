// Pembatas laju sederhana di memori untuk route tulis (POST/PATCH/DELETE).
// Bukan pengganti pembatas di tepi jaringan; tujuannya menahan kiriman
// berulang yang tidak wajar ke endpoint publik. Keadaan hilang saat
// server dimulai ulang, itu disengaja untuk alat pribadi sekecil ini.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || "unknown";
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function writeLimitExceeded(request: Request, route: string): boolean {
  return !checkRateLimit(
    `write:${route}:${clientIp(request)}`,
    30,
    60 * 1000,
  );
}
