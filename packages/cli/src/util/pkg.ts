import fs from 'fs';
import { join } from 'path';
import { PackageJson } from '@vercel/build-utils';
import url from 'url';
//
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
//
//let rootDir = __dirname;
//while (!fs.existsSync(join(rootDir, 'package.json'))) {
//  rootDir = join(rootDir, '..');
//}
const rootDir = join(__dirname, '..');

const pkgPath = join(rootDir, 'package.json');
const pkg: PackageJson & typeof import('../../package.json') = JSON.parse(
  fs.readFileSync(pkgPath, 'utf8')
);
export default pkg;
