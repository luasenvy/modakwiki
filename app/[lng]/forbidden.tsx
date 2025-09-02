import Link from "next/link";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div
      className={cn(
        "relative h-screen w-screen overflow-hidden",
        "bg-[url('/bg-not-found.webp')] bg-center bg-cover bg-no-repeat",
      )}
    >
      <div
        className={cn(
          "h-full",
          "flex flex-col items-center",
          "text-center text-[#cdd4de] selection:bg-[#cdd4de]",
        )}
      >
        <h1 className="mt-auto font-black text-8xl opacity-60 sm:text-9xl">403</h1>

        <h2 className="font-bold text-xl opacity-90 sm:text-5xl">접근이 거부되었습니다</h2>
        <p className="font-light text-sm opacity-70 sm:mt-2 sm:text-base">
          이 페이지에 대한 접근 권한이 없습니다
        </p>

        <Button
          className="mt-4 mb-auto border font-light text-sm uppercase opacity-40 sm:mt-8"
          variant="ghost"
          type="button"
          asChild
        >
          <Link href="/">홈으로</Link>
        </Button>
      </div>

      <p className="absolute right-2 bottom-2 text-[#cdd4de] text-xs [text-shadow:_0_0px_3px_rgb(0_0_0)] selection:bg-[#cdd4de]">
        <a
          href="https://unsplash.com/ko/%EC%82%AC%EC%A7%84/%EA%B5%AC%EB%A6%84-%EB%82%80-%ED%95%98%EB%8A%98-%EC%95%84%EB%9E%98-%EC%95%88%EA%B0%9C%EC%97%90-%EB%8D%AE%EC%9D%B8-%EC%86%8C%EB%82%98%EB%AC%B4-ZSI-wuA49T0?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          className="hover:underline"
          target="_blank"
        >
          Unsplash
        </a>
        의{" "}
        <a
          href="https://unsplash.com/ko/@aleskrivec?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          className="hover:underline"
          target="_blank"
        >
          Ales Krivec
        </a>
      </p>
    </div>
  );
}
