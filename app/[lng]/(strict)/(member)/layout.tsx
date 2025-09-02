import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ScopedLayout } from "@/components/core/ScopedLayout";
import { auth } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { scopeEnum } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

export default async function MemberLayout({ params, children }: LayoutProps<"/[lng]">) {
  const lngParam = (await params).lng as Language;
  const lng = localePrefix(lngParam);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return redirect(`${lng}/signin`);

  return (
    <ScopedLayout lng={lngParam as Language} session={session} above={scopeEnum.member}>
      {children}
    </ScopedLayout>
  );
}
