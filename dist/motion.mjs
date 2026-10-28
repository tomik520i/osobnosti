// Progressive enhancement: content remains visible even without motion APIs.
export function createMotion(root) {
  if (!root || !window.IntersectionObserver || !Element.prototype.animate) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const panels = '.hero-copy,.profile-art,.page-head,.module-card,.trait-card,.chart-paper,.result-guide,.result-detail,.role-result,.context-card,.temperament-paper,.temperament-reading,.share-preview,.compare-row,.practice-group,.profile-grid>.paper,.source-card';
  const seen = new WeakSet();
  const waiting = new Set();
  const active = new Set();
  const stop = () => { for (const animation of active) animation.cancel(); active.clear(); };
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      waiting.delete(element);
      if (preference.matches || !element.isConnected) continue;
      const animation = element.animate(
        [{opacity:.45,translate:'0 10px'}, {opacity:1,translate:'0 0'}],
        {duration:420,delay:(order++ % 4)*40,easing:'cubic-bezier(.22,1,.36,1)'}
      );
      active.add(animation);
      const clean = () => active.delete(animation);
      animation.addEventListener('finish',clean,{once:true});
      animation.addEventListener('cancel',clean,{once:true});
    }
  }, {threshold:0,rootMargin:'0px 0px -24px 0px'});
  function scan() {
    for (const element of waiting) {
      if (!root.contains(element)) { observer.unobserve(element); waiting.delete(element); }
    }
    for (const animation of active) {
      if (!animation.effect?.target?.isConnected) animation.cancel();
    }
    for (const element of root.querySelectorAll(panels)) {
      if (seen.has(element)) continue;
      seen.add(element);
      if (!preference.matches) { waiting.add(element); observer.observe(element); }
    }
  }
  new MutationObserver(scan).observe(root,{childList:true,subtree:true});
  preference.addEventListener('change',() => {
    if (preference.matches) {stop();observer.disconnect();waiting.clear();}
  });
  window.addEventListener('beforeprint',stop);
  scan();
}
