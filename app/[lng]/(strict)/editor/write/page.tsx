import { Container } from "@/components/core/Container";
import { Editor } from "@/components/core/Editor";

export default async function WritePage() {
  return (
    <Container>
      <h2>새 문서</h2>
      <Editor />
    </Container>
  );
}
