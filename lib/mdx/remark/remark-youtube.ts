import { BlockContent, Root } from "mdast";
import type { Processor } from "unified";
import { visit } from "unist-util-visit";

export default function remarkYoutube(this: Processor) {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!node.children?.length) return;

      const [first] = node.children;
      if (first.type !== "text" || !first.value.startsWith("@[")) return;

      const [, videoId] = first.value.match(/^@\[([^\]]+)\]/) || [];
      if (!videoId) return;

      parent!.children.splice(index!, 1, {
        type: "mdxJsxFlowElement",
        name: "Youtube",
        attributes: [{ type: "mdxJsxAttribute", name: "v", value: videoId }],
        children: [],
      } satisfies BlockContent);
    });
  };
}
