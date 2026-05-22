import fs from 'node:fs';
import { FigmaArchiveParser } from './fig-kiwi.mjs';
import { inflateRaw } from './node_modules/pako/dist/pako.esm.mjs';
import kiwi from './node_modules/kiwi-schema/kiwi.js';
const { decodeBinarySchema, compileSchema } = kiwi;

const data = fs.readFileSync('canvas.fig');
const { header, files } = FigmaArchiveParser.parseArchive(data);
console.log(JSON.stringify({ header, fileSizes: files.map(f => f.length) }));
const schema = decodeBinarySchema(inflateRaw(files[0]));
const compiled = compileSchema(schema);
const message = compiled.decodeMessage(inflateRaw(files[1]));
fs.writeFileSync('message.json', JSON.stringify(message));
console.log(JSON.stringify(Object.keys(message)));
