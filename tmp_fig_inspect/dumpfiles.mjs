import fs from 'node:fs';
import { FigmaArchiveParser } from './fig-kiwi.mjs';
const data = fs.readFileSync('canvas.fig');
const { files } = FigmaArchiveParser.parseArchive(data);
for (let i=0;i<files.length;i++) console.log(i, Array.from(files[i].slice(0,16)).map(x=>x.toString(16).padStart(2,'0')).join(' '));
fs.writeFileSync('payload-1.bin', files[1]);
