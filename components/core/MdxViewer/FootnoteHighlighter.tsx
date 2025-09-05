"use client";

import { useEffect } from "react";

export function FootnoteHighlighter() {
  // react에서 URL hash값을 감시하고 useEffect로 처리할 수 있는 코드
  useEffect(() => {
    const footnoteHighlighting = (hash: string) => {
      const footnotes = document.querySelectorAll("section[data-footnotes=true] > ol > li");
      footnotes.forEach((footnote) => footnote.toggleAttribute("data-selected", false));

      const selected = document.querySelector(hash);
      selected?.toggleAttribute("data-selected", true);
    };

    const footnoteRefHighlighting = (hash: string) => {
      const footnoteRefs = document.querySelectorAll("[data-footnote-ref=true]");
      footnoteRefs.forEach((footnoteRef) => footnoteRef.toggleAttribute("data-selected", false));

      const selected = document.querySelector(hash);
      selected?.toggleAttribute("data-selected", true);
    };

    const handleHashChange = (e: HashChangeEvent) => {
      const { hash } = new URL(e.newURL);
      footnoteHighlighting(hash);
      footnoteRefHighlighting(hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    // 컴포넌트가 마운트될 때와 hash가 변경될 때마다 handleHashChange 함수 호출
    handleHashChange(new HashChangeEvent("hashchange", { newURL: window.location.href }));

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  return null;
}
