/**
 * URL 해석기
 *
 * @description
 * URL의 부분들을 해석하여 JSON으로 반환한다.
 *
 * @example
 * const parsed = parse("redis://hello:world@example.com:6379/0")
 *
 * @param url URL 주소
 * @returns [URL 객체](https://developer.mozilla.org/en-US/docs/Web/API/URL) + baseurl
 */
export const parse = (url: string): (URL & { baseurl: string }) | undefined => {
  if (!url) return;

  const targetUrl = url.replace(/^opensearch/, "http");

  const hasAuthentication = targetUrl.includes("@");

  if (!hasAuthentication) {
    const [protocol, body] = targetUrl.split("//");

    const hasPathname = body.includes("/");

    const hostnameEndIndex = hasPathname ? body.indexOf("/") : undefined;
    const hostname = body.substring(0, hostnameEndIndex);

    const baseurl = `${protocol}//${hostname}`;

    const parsed = new URL(targetUrl);

    return Object.assign(parsed, { baseurl });
  }

  const [head, tail] = targetUrl.split("@");

  const heads = head.split("//");

  const [protocol] = heads;
  let [, authorization] = heads;

  const isUsernamePasswordPair = authorization.includes(":");

  if (isUsernamePasswordPair) {
    const [username, password] = authorization.split(":");
    authorization = `${encodeURIComponent(username)}:${encodeURIComponent(password)}`;
  } else {
    // password only
    authorization = `:${encodeURIComponent(authorization)}`;
  }

  const parsed = new URL(`${protocol}//${authorization}@${tail}`);

  Object.assign(parsed, { ssl: !protocol.startsWith("redis:") && /^\W+s:/.test(protocol) });
  const hasPathname = tail.includes("/");

  const hostnameEndIndex = hasPathname ? tail.indexOf("/") : undefined;
  const hostname = tail.substring(0, hostnameEndIndex);

  const baseurl = `${protocol}//${hostname}`;

  return Object.assign(parsed, { baseurl });
};

export function unwrap(url: string): string {
  return url.replace(/\0|\.{2,}|\/{2,}/g, "");
}
