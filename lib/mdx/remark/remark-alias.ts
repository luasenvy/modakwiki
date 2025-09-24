import { BlockContent, Root } from "mdast";
import type { Processor } from "unified";
import { visit } from "unist-util-visit";

export default function remarkYoutube(this: Processor) {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!node.children?.length) return;

      const [first] = node.children;
      if (first.type !== "text") return;

      first.value = first.value
        .replace(/-{1,}>/g, "→")
        .replaceAll(/<-{1,}/g, "←")
        .replaceAll(/<-{1,}>/g, "↔");
    });
  };
}
