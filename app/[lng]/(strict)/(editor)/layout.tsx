import { headers } from "next/headers";
import { ScopedLayout } from "@/components/core/ScopedLayout";
import { auth } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { scopeEnum } from "@/lib/schema/user";

export default async function EditorLayout({ params, children }: LayoutProps<"/[lng]">) {
  const lngParam = (await params).lng as Language;

  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <ScopedLayout lng={lngParam as Language} session={session?.user} above={scopeEnum.editor}>
      {children}
    </ScopedLayout>
  );
}
