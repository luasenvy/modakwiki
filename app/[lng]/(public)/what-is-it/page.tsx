import { Document } from "@/components/core/Document";

export default async function HowToPage(ctx: PageProps<"/[lng]/how-to">) {
  const content = `
## 환영합니다!

모닥위키는 여러 위키들이 협업할 수 있는 위키엔진입니다.

## 모닥이 뭔가요?

\`모닥\`은 *몰다*, *모으다*를 어원으로 여러가지를 모은 것을 말합니다. *여러가지를 모아 지핀 불*이라는 모닥불의 의미를 생각하면 쉽게 이해할 수 있습니다.

`.trim();

  return <Document content={content} />;
}
