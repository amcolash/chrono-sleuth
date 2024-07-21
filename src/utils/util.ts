export function isMobile() {
  const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

export function expDecay(a: number, b: number, decay: number, delta: number) {
  return b + (a - b) * Math.exp(-delta * decay);
}
