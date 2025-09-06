import { CheckCircle } from "lucide-react";
import { headers } from "next/headers";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Viewport } from "@/components/core/Container";
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

      <Viewport className="lg:max-w-3xl xl:max-w-4xl">
        <div className="flex space-x-2">
          <Avatar className="h-8 w-8 rounded-full">
            {session.user.image && <AvatarImage src={session.user.image} alt={session.user.name} />}
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
      </Viewport>
    </>
  );
}
