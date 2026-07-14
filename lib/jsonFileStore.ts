import fs from 'fs/promises';
import path from 'path';

async function writeAtomic(filePath: string, content: string) {
  const directory = path.dirname(filePath);
  const tempPath = path.join(directory, `${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tempPath, content, 'utf8');
  await fs.rename(tempPath, filePath);
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(filePath: string, value: unknown) {
  await writeAtomic(filePath, JSON.stringify(value, null, 2));
}
