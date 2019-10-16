import chalk from 'chalk';

import { CodeObjectGrade } from '../contracts/code_object';

export function getColorizeFunForGrade(grade: string): Function {
  const color = getGradeColor(grade as CodeObjectGrade);
  const colorizeFun = color ? chalk.keyword(color) : chalk.reset;

  return colorizeFun;
}

/**
 * Returns the color for the given `grade`.
 */
export function getGradeColor(grade: CodeObjectGrade): string | null {
  switch (grade) {
    case 'A':
      return 'green';
    case 'B':
      return 'yellow';
    case 'C':
      return 'red';
    case 'U':
      return 'mediumorchid';
  }

  return null;
}

// @doc ""
// def bg_color("A"), do: nil
// def bg_color("B"), do: nil
// def bg_color("C"), do: nil
// def bg_color("U"), do: :color105

/**
 * Returns the background color for the given `grade`.
 */
export function getGradeBgColor(grade: CodeObjectGrade): string | null {
  if (grade === 'U') {
    return '105';
  }
  return null;
}

/**
 * Returns the grade for the given `score`.
 */
export function getGrade(score: number): CodeObjectGrade {
  if (score >= 80) {
    return 'A';
  } else if (score >= 50) {
    return 'B';
  } else if (score >= 1) {
    return 'C';
  }

  return 'U';
}

/**
 * Returns the description for the given `grade`.
 */
export function getDecriptionForGrade(grade: CodeObjectGrade): string {
  switch (grade) {
    case 'A':
      return 'Seems really good';
    case 'B':
      return 'Proper documentation present';
    case 'C':
      return 'Needs work';
    case 'U':
      return 'Undocumented';
  }
}
