import { Output } from '../output';
import { Dictionary } from '@vercel/client';
import { readFile } from 'fs-extra';
import { parseEnv } from '../parse-env';
import chalk from 'chalk';

export async function createEnvObject(
  envPath: string,
  output: Output
): Promise<Dictionary<string | undefined> | undefined> {
  try {
    // Partially taken from https://github.com/tswaters/env-file-parser/blob/master/lib/parse.js
    let envArr = (await readFile(envPath, 'utf-8'))
      // remove double quotes
      .replace(/"/g, '')
      // split on new line
      .split(/\r?\n|\r/)
      // filter comments
      .filter(line => /^[^#]/.test(line))
      // needs equal sign
      .filter(line => /=/i.test(line));
    return parseEnv(envArr);
  } catch (err) {
    output.debug(`Error parsing env file: ${err}`);
  }
}

function findChanges(
  oldEnv: Dictionary<string | undefined>,
  newEnv: Dictionary<string | undefined>
): {
  added: string[];
  changed: string[];
  removed: string[];
} {
  let added = [];
  let changed = [];
  let removed = [];

  for (const key of Object.keys(newEnv)) {
    if (!oldEnv[key] && oldEnv[key] !== '') {
      added.push(key);
    } else if (oldEnv[key] !== newEnv[key]) {
      changed.push(key);
    }
    delete oldEnv[key];
  }
  removed = Object.keys(oldEnv);

  return {
    added,
    changed,
    removed,
  };
}

export function buildDeltaString(
  oldEnv: Dictionary<string | undefined>,
  newEnv: Dictionary<string | undefined>
): string {
  let { added, changed, removed } = findChanges(oldEnv, newEnv);

  let deltaString = '';
  deltaString += chalk.green(addDeltaSection('+', added));
  deltaString += chalk.yellow(addDeltaSection('~', changed));
  deltaString += chalk.red(addDeltaSection('-', removed));

  return deltaString ? chalk.gray('Changes:\n') + deltaString : deltaString;
}

function addDeltaSection(prefix: string, arr: string[]): string {
  let deltaSection = arr.length > 0 ? `${prefix} ` : '';
  for (const [i, item] of arr.entries()) {
    deltaSection += `${item}${arr[i + 1] ? ' ' : '\n'}`;
  }
  return deltaSection;
}
