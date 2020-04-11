import chalk from 'chalk';

import { CodeObjectGrade } from '../contracts/code_object';

export function getColorizeFunForGrade(grade: string): Function {
  const ansiColor = getGradeAnsiColor(grade);
  if (ansiColor == null) {
    return chalk.reset;
  }

  return chalk.ansi256(ansiColor);
}

/**
 * Returns the color for the given `grade`.
 */
export function getGradeAnsiColor(grade: string): number | null {
  switch (grade) {
    case 'A':
      return 34; // 'green'
    case 'B':
      return 220; // 'yellow';
    case 'C':
      return 196; // 'red';
    case 'U':
      return 141; // 'mediumorchid';
  }

  return null;
}

export function getGradeBgAnsiColor(grade: string): number | null {
  switch (grade) {
    case 'A':
      return 34; // 'green'
    case 'B':
      return 220; // 'yellow';
    case 'C':
      return 196; // 'red';
    case 'U':
      return 141; // 'mediumorchid';
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
export function getDecriptionForGrade(grade: string): string | null {
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

  return null;
}
