// Wheel events include a trackpad's momentum tail. Let that tail finish at the
// section boundary; a fresh gesture or a reversal can immediately leave it.
(() => {
  const stops = Array.from(document.querySelectorAll('#check,#journal,#feedback,#gallery,#money'));
  let anchoredAt = null;
  let direction = 0;
  let lastWheel = -Infinity;
  let lastDelta = 0;
  function clear() { anchoredAt = null; }
  function wheel(event) {
    if (event.ctrlKey || event.defaultPrevented || !event.cancelable ||
        document.querySelector('dialog[open]') || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const sign = Math.sign(event.deltaY);
    for (const node of event.composedPath()) {
      if (!(node instanceof Element) || node === document.body) break;
      if (!/auto|scroll/.test(getComputedStyle(node).overflowY)) continue;
      if (sign > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight-1 : node.scrollTop > 1) return;
    }
    const dt = performance.now()-lastWheel;
    const amount = Math.abs(event.deltaY)*(event.deltaMode===1 ? 16 : event.deltaMode===2 ? innerHeight : 1);
    if (sign!==direction || dt>180 || (dt>55 && amount>lastDelta*1.6)) clear();
    direction=sign; lastWheel=performance.now(); lastDelta=amount;
    if (anchoredAt!==null && Math.abs(scrollY-anchoredAt)<2) {
      event.preventDefault();
      return;
    }
    clear();
    // Apply exact deltas around the managed screens, avoiding a native smooth
    // wheel animation overshooting the target between successive wheel events.
    const offsets = stops.map(node=>node.getBoundingClientRect().top);
    if (offsets[0]>amount+2 || (sign<0 && offsets[0]>=-1)) return;
    const next = (sign>0 ? offsets : offsets.reverse()).find(d=>d*sign>1);
    const travel = next!==undefined && Math.abs(next)<=amount+1 ? next : event.deltaY/Math.abs(event.deltaY)*amount;
    event.preventDefault();
    window.scrollBy({top:travel,behavior:'instant'});
    if (travel===next) anchoredAt=scrollY;
  }
  window.addEventListener('wheel',wheel,{passive:false});
  ['pointerdown','keydown','resize','hashchange'].forEach(type=>window.addEventListener(type,clear));
})();
