export const TICKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
const STEPS = TICKS.length - 1;

// def run(original_numbers, format_callback \\ nil) do
//   numbers = normalize_numbers(original_numbers)
//   one_step = step_height(numbers)
//   numbers
//   |> Enum.with_index()
//   |> Enum.map(fn {n, index} ->
//     tick = trunc(n / one_step)
//     value = Enum.at(@ticks, tick)

//     if format_callback do
//       format_callback.(value, index, n)
//     else
//       value
//     end
//   end)
// end

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

// def normalize_numbers(numbers) do
//   min = numbers |> Enum.sort() |> List.first()

//   Enum.map(numbers, &(&1 - min))
// end

function normalizeNumbers(numbers: number[]): number[] {
  const sorted = [...numbers].sort((a: number, b: number) => a - b);
  const min = sorted[0];

  return numbers.map((x: number) => x - min);
}

// def step_height(numbers) do
//   sorted = numbers |> Enum.sort()
//   min = List.first(sorted)
//   max = List.last(sorted)
//   actual_height = max - min
//   step = actual_height / @steps

//   if step == 0 do
//     1
//   else
//     step
//   end
// end

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
