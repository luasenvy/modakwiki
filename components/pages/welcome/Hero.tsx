import { FlameKindling } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/ui/shadcn-io/announcement";
import { Language } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface HeroProps extends React.ComponentProps<"div"> {
  lng?: Language;
}

export default function Hero({ lng, className, ...props }: HeroProps) {
  return (
    <div className={cn("flex flex-col gap-16 px-8 py-24 text-center", className)} {...props}>
      <div className="flex flex-col items-center justify-center gap-8">
        <Link href="#">
          <Announcement>
            <AnnouncementTag>Recent</AnnouncementTag>
            <AnnouncementTitle>Introducing blocks by Modakwiki</AnnouncementTitle>
          </Announcement>
        </Link>
        <h1 className="mb-0 text-balance font-medium text-6xl md:text-7xl xl:text-[5.25rem]">
          모닥위키
        </h1>
        <p className="mt-0 mb-0 text-balance text-lg text-muted-foreground">
          모닥위키는 여러 사람들이 함께 만들어가는 커뮤니티 위키 입니다.
        </p>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="#">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link className="no-underline" href="#">
              Learn more
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
