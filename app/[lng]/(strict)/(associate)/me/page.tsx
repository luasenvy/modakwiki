import { CheckCircle, Info } from "lucide-react";
import { headers } from "next/headers";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

export default async function MyPage(ctx: PageProps<"/[lng]/me">) {
  const session = (await auth.api.getSession({ headers: await headers() }))!;

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: "내 정보", href: `${lng}/me` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />

      <Viewport>
        <Container as="div" variant="aside">
          <div className="flex space-x-2">
            <Avatar className="h-8 w-8 rounded-full">
              {session.user.image && (
                <AvatarImage src={session.user.image} alt={session.user.name} />
              )}
              <AvatarFallback className="rounded-full">
                {session.user.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm">
                {session.user.name}
                {session.user.emailVerified && (
                  <CheckCircle className="ml-1 inline size-3 text-green-600" />
                )}
              </p>
              <p className="text-xs">{session.user.email}</p>
            </div>
          </div>
        </Container>

        <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
          <div className="mb-2 flex items-center gap-2">
            <Info className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">내 정보</p>
          </div>

          <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]">
            내정보~
          </div>

          <Advertisement className="py-6" />
        </div>
      </Viewport>
    </>
  );
}
