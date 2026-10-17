// Wraps everything after a post's final horizontal rule in a "reflection" block,
// so the closing question gets its own typographic treatment.
export default function rehypeReflection() {
  return (tree) => {
    const kids = tree.children;
    let last = -1;
    kids.forEach((n, i) => {
      if (n.type === 'element' && n.tagName === 'hr') last = i;
    });
    if (last === -1) return;
    const after = kids.slice(last + 1);
    if (!after.some((n) => n.type === 'element')) return;
    const firstEl = after.find((n) => n.type === 'element');
    // A first paragraph made only of bold text is the block's label.
    if (firstEl && firstEl.tagName === 'p') {
      const real = firstEl.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
      if (real.length === 1 && real[0].type === 'element' && real[0].tagName === 'strong') {
        firstEl.properties = { ...(firstEl.properties || {}), className: ['reflection-label'] };
        // Drop the trailing colon; the styling marks it as a label.
        const t = real[0].children[0];
        if (t && t.type === 'text') t.value = t.value.replace(/:\s*$/, '');
      }
    }
    const aside = {
      type: 'element',
      tagName: 'aside',
      properties: { className: ['reflection'], ariaLabel: 'Reflection' },
      children: after,
    };
    tree.children = [...kids.slice(0, last), aside];
  };
}
