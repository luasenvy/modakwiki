import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";
import { isDev } from "@/config";
import { auth, verifyHCaptcha } from "@/lib/auth/server";

const handlers = toNextJsHandler(auth);
export async function GET(req: NextRequest) {
  if (!isDev) return new Response("Not allowed", { status: 403 });

  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  if (!isDev) return new Response("Not allowed", { status: 403 });

  const captchaToken = req.headers.get("x-captcha-response");

  if (req.nextUrl.pathname.startsWith("/api/auth/sign-in/")) {
    const data = await verifyHCaptcha(captchaToken);
    if (!data?.success)
      return Response.json({ success: false, message: "captcha_failed" }, { status: 401 });
  }

  // 캡차가 없거나(없어도 동작해야 하는 엔드포인트일 수 있으므로) 검증 통과하면 기존 핸들러로 요청 전달
  return handlers.POST(req);
}
