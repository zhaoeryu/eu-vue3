// sliding-scroll.ts
const pi = Math.PI;
const halfPi = Math.PI / 2;

interface EasingFunctions {
  linear: (x: number) => number;
  fastInSlowOut: (x: number) => number;
  slowInFastOut: (x: number) => number;
  slowInSlowOut: (x: number) => number;
}

const EASING_FUNCTIONS: EasingFunctions = {
  // linear: x
  // https://www.wolframalpha.com/input?i=y+%3D+x+for+x%3E%3D0%2C+x+%3C%3D+1
  linear: (x: number) => x,
  // fast in - slow out: sin((pi/2) * x)
  // https://www.wolframalpha.com/input?i=y+%3D+sin%28%28pi%2F2%29*x%29+for+x%3E%3D0%2C+x+%3C%3D+1
  fastInSlowOut: (x: number) => Math.sin(halfPi * x),
  // slow in - fast out: cos((pi/2)*x +pi ) + 1
  // https://www.wolframalpha.com/input?i=y+%3D+cos%28%28pi%2F2%29*x+%2Bpi+%29+%2B+1+for+x%3E%3D0%2C+x+%3C%3D+1
  slowInFastOut: (x: number) => Math.cos(halfPi * x + pi) + 1,
  // slow in - slow out: 1/2 * (cos((x * pi) + pi) + 1)
  // https://www.wolframalpha.com/input?i=y+%3D+1%2F2+*+%28cos%28%28x+*+pi%29+%2B+pi%29+%2B+1%29+for+x%3E%3D0%2C+x+%3C%3D+1
  slowInSlowOut: (x: number) => 0.5 * (Math.cos(x * pi + pi) + 1),
};

interface ScrollOptions {
  isUp?: boolean;
  top?: number;
  left?: number;
  duration?: number;
  element?: HTMLElement | (Document & HTMLElement);
  easingFunction?: (x: number) => number;
}

interface ScrollToElementOptions {
  duration?: number;
  easingFunction?: (x: number) => number;
  offsetTop?: number;
  offsetLeft?: number;
}

export function smoothScrollTo({
  isUp = false,
  top = 0,
  left = 0,
  duration = 0,
  element = document.scrollingElement as HTMLElement,
  easingFunction = EASING_FUNCTIONS.slowInSlowOut,
}: ScrollOptions): void {
  // save starting scroll positions
  const startTop = element.scrollTop;
  const startLeft = element.scrollLeft;
  // if unset assign current position so scrolling has no affect for this axis
  if (!isUp) {
    top = top || startTop;
    left = left || startLeft;
    // clamp top position between 0 and max scroll position
    top = Math.max(0, Math.min(element.scrollHeight - element.clientHeight, top));
    left = Math.max(0, Math.min(element.scrollWidth - element.clientWidth, left));
  }
  // cancel if already on target position
  if (startTop === top && startLeft === left) {
    return;
  }
  // calculate scroll distance for each axis
  let distanceTop = top - startTop;
  let distanceLeft = left - startLeft;
  if (isUp) {
    distanceTop = startTop - top;
    distanceLeft = startLeft - left;
  }
  let x = 0;
  let prevTimestamp: number | null = null;

  function step(newTimestamp: number) {
    // if duration is 0 x will be Infinity
    if (prevTimestamp === null) return;
    x += (newTimestamp - prevTimestamp) / duration;
    // clamp x to 1
    x = Math.min(x, 1);
    // calculate proportional fraction based on given easing function
    const fraction = easingFunction(x);
    // jump to scroll position
    element.scroll({
      top: isUp ? startTop - fraction * distanceTop : startTop + fraction * distanceTop,
      left: isUp ? startLeft - fraction * distanceLeft : startLeft + fraction * distanceLeft,
      behavior: 'instant',
    });
    // exit function when finished
    if (x >= 1) {
      return;
    }
    // restart function again on next frame
    prevTimestamp = newTimestamp;
    window.requestAnimationFrame(step);
  }

  // use first frame to initialize the timestamp
  window.requestAnimationFrame((timestamp) => {
    prevTimestamp = timestamp;
    window.requestAnimationFrame(step);
  });
}

export function smoothScrollToTop({ duration, element, easingFunction = EASING_FUNCTIONS.slowInSlowOut }: Pick<ScrollOptions, 'duration' | 'element' | 'easingFunction'> = {}): void {
  smoothScrollTo({
    isUp: true,
    top: 0,
    duration: duration,
    element: element,
    easingFunction: easingFunction,
  });
}

export function smoothScrollToBottom({ duration, element, easingFunction = EASING_FUNCTIONS.slowInSlowOut }: Pick<ScrollOptions, 'duration' | 'element' | 'easingFunction'> = {}): void {
  if (!element) return;
  smoothScrollTo({
    top: element.scrollHeight - element.clientHeight,
    duration: duration,
    element: element,
    easingFunction: easingFunction,
  });
}

export function smoothScrollToElement(element: HTMLElement, { duration, easingFunction, offsetTop = 0, offsetLeft = 0 }: ScrollToElementOptions = {}): void {
  const rect = element.getBoundingClientRect();
  smoothScrollTo({
    top: document.scrollingElement!.scrollTop + Math.round(rect.top) + offsetTop,
    left: document.scrollingElement!.scrollLeft + Math.round(rect.left) + offsetLeft,
    duration: duration,
    easingFunction: easingFunction,
  });
}

export function smoothScrollToId(id: string, { duration, easingFunction, offsetTop = 0, offsetLeft = 0 }: ScrollToElementOptions = {}): void {
  const element = document.getElementById(id);
  if (element) {
    smoothScrollToElement(element, {
      duration: duration,
      easingFunction: easingFunction,
      offsetTop: offsetTop,
      offsetLeft: offsetLeft,
    });
  }
}
