import { Container } from "@/components/core/Container";
import { Editor } from "@/components/core/Editor";
import { Language } from "@/lib/i18n/config";

export default async function WritePage(ctx: PageProps<"/[lng]/editor/write">) {
  const lngParam = (await ctx.params).lng as Language;

  return (
    <Container className="lg:max-w-3xl xl:max-w-4xl">
      <Editor lng={lngParam} />
    </Container>
  );
}
