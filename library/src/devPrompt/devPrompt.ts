import { readFileSync } from "node:fs";
import { join } from "node:path";
const normalPrompt = readFileSync(join(import.meta.dirname, 'normal.md'), 'utf-8');
const darkPrompt = readFileSync(join(import.meta.dirname, 'dark.md'), 'utf-8');

export {normalPrompt, darkPrompt};