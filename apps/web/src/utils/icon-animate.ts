const DURATION = 150;
const EASING = 'ease-out';

export function animateOut(el: Element) {
  return el.animate(
    [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.5)' },
    ],
    { duration: DURATION, easing: EASING, fill: 'forwards' },
  ).finished;
}

export function animateIn(el: Element) {
  return el.animate(
    [
      { opacity: 0, transform: 'scale(0.5)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    { duration: DURATION, easing: EASING, fill: 'forwards' },
  ).finished;
}
