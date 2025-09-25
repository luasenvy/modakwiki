import { BlockContent, Root } from "mdast";
import type { Processor } from "unified";
import { visit } from "unist-util-visit";

export default function remarkYoutube(this: Processor) {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!node.children?.length) return;

      const [first] = node.children;
      if (first.type !== "text" || first.value.indexOf("@[") < 0) return;

      const videoMarkdowns = first.value.match(/@\[([^\]]+)\]/g) || [];
      if (!videoMarkdowns.length) return;

      parent!.children.splice(index!, 1, {
        type: "mdxJsxFlowElement",
        name: "Youtube",
        attributes: [{ type: "mdxJsxAttribute", name: "v", value: videoMarkdowns.join(",") }],
        children: [],
      } satisfies BlockContent);
    });
  };
}
