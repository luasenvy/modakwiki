import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { cookieName, languages } from "@/lib/i18n/config";
import { negotiate } from "@/lib/i18n/detect";
import packageJson from "@/package.json";

const { version } = packageJson;

export const config = {
  matcher: [
    `/((?!favicon.ico|.+.webp|sitemap.xml|_next/image|_next/static|.+/error|languages/.+|api/auth/.+).{1,})`,
    `/`,
  ],
};

const redirect = (url: URL, reason: string) => {
  console.debug(`${redirectStamp(url, reason)}\n`);
  return NextResponse.redirect(url);
};

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const reqStamp = (req: NextRequest): string =>
  `🠖 ${dateTimeFormat.format(Date.now())} (${req.method}) ${req.url}`;

const resStamp = (res: NextResponse): string =>
  `🠔 ${dateTimeFormat.format(Date.now())} [${res.status}]`;

const redirectStamp = (url: URL, reason: string): string =>
  `  ⮎ ${reason} ${url.pathname}${url.search}`;

const PostMiddleware = (res: NextResponse) => {
  // 버전정보 삽입
  res.headers.set("X-WM-Version", version);

  console.debug(`${resStamp(res)}\n`);

  return res;
};

export default async function (req: NextRequest) {
  // 인증 유효성 검사 전 모든 요청에 대한 작업

  /** 요청 로깅 **********************************
   * middleware는 runtime: edge로 사용되므로     *
   * nodejs API를 사용하고 있는                  *
   * `winston` 패키지를 사용할 수 없음           *
   * 서버 로그 파일을 재활용할 수 없으므로       *
   * `console.debug()`를 통해 로그를 남김         *
   * ******************************************* */
  if ("OPTIONS" !== req.method) console.debug(reqStamp(req));

  // API를 제외한 나머지 페이지에 대하여 다국어 적용
  if (req.nextUrl.pathname.startsWith("/api")) return PostMiddleware(NextResponse.next());

  const { origin, pathname, search } = req.nextUrl;

  // URL 기준으로 언어 선택
  const hasLocaleInPath = languages.some(
    (language) => pathname.startsWith(`/${language}/`) || pathname === `/${language}`,
  );

  if (!hasLocaleInPath) {
    const lng = negotiate(req.cookies.get(cookieName)?.value || req.headers.get("accept-language"));
    return redirect(new URL(`${origin}/${lng}${pathname}${search}`), "Unlocale");
  }

  return PostMiddleware(NextResponse.next());
}
