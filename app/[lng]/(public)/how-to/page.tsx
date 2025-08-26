import { Document } from "@/components/core/Document";

export default async function HowToPage(ctx: PageProps<"/[lng]/how-to">) {
  const content = `
## 개요

문서에 대한 작성방법과 권장되는 구조를 설명합니다.

## 일반 문법

### 헤드라인

\`\`\`plain
## 일반 문법

### 헤드라인
\`\`\`

\`#\` 문자를 반복하여 헤드라인과 레벨을 지정할 수 있습니다.

### 일반

아무런 문법없이 글을 입력하면 엔터를 두번 입력하기 전까지 한 문단으로 구성됩니다. 

## 특수 문법

### 코드블록

특수문자 **\\\`** 를 3번 반복하여 코드의 시작과 끝을 묶어 코드 블록으로 활용할 수 있습니다.

\`\`\`ts:hello.ts
(() => {
  const hello = "world";const hello = "world";const hello = "world";const hello = "world";const hello = "world";const hello = "world";const hello = "world";
  console.info(hello);
})();
\`\`\`

`.trim();

  return <Document content={content} />;
}
