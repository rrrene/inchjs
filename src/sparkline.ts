export const TICKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
const STEPS = TICKS.length - 1;

export function sparkline(originalNumbers: number[], formatCallback?: Function): string[] {
  const numbers = normalizeNumbers(originalNumbers);
  const oneStep = stepHeight(numbers);

  return numbers.map((n: number, index: number) => {
    const tick = Math.floor(n / oneStep);
    const value = TICKS[tick];

    if (formatCallback != null) {
      return formatCallback(value, index, n);
    }

    return value;
  });
}

function normalizeNumbers(numbers: number[]): number[] {
  const sorted = [...numbers].sort((a: number, b: number) => a - b);
  const min = sorted[0];

  return numbers.map((x: number) => x - min);
}

function stepHeight(numbers: number[]): number {
  const sorted = [...numbers].sort((a: number, b: number) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const actualHeight = max - min;
  const step = actualHeight / STEPS;

  if (step === 0) {
    return 1;
  }

  return step;
}
