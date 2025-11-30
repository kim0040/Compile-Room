export function getClientIp(request) {
  const reqWithIp = request;
  if (typeof reqWithIp.ip === "string" && reqWithIp.ip.trim().length > 0) {
    return reqWithIp.ip;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",").map((item) => item.trim());
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return null;
}
