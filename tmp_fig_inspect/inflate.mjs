import fs from 'node:fs';
import { FigmaArchiveParser } from './fig-kiwi.mjs';
import { inflateRaw } from './node_modules/pako/dist/pako.esm.mjs';
const data = fs.readFileSync('canvas.fig');
const { files } = FigmaArchiveParser.parseArchive(data);
for (let i=0; i<files.length; i++) {
  try {
    const raw = inflateRaw(files[i]);
    fs.writeFileSync(`inflated-${i}.bin`, raw);
    console.log(i, raw.length);
  } catch (e) { console.log('inflate fail', i, e.message); }
}
