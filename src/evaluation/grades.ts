import chalk from 'chalk';

import { CodeObjectGrade } from '../contracts/code_object';

export function getColorizeFunForGrade(grade: string): Function {
  const color = getGradeColor(grade as CodeObjectGrade);
  if (color == null) {
    return chalk.reset;
  }

  const defaultTerminalColorFun = chalk[color];

  return defaultTerminalColorFun || chalk.keyword(color);
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
