import MdxEditor from "@/components/core/MdxEditor";
import { Language } from "@/lib/i18n/config";

export default async function WritePage(ctx: PageProps<"/[lng]/editor/write">) {
  const lngParam = (await ctx.params).lng as Language;

  return (
    <>
      <MdxEditor lng={lngParam} />
    </>
  );
}
