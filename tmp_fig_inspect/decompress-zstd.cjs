const fs = require('fs');
const fzstd = require('fzstd');
const data = fs.readFileSync('canvas.fig');
let offset = 0;
const prelude = data.subarray(0, 8).toString('ascii'); offset += 8;
const version = data.readUInt32LE(offset); offset += 4;
const files = [];
while (offset + 4 < data.length) {
  const size = data.readUInt32LE(offset); offset += 4;
  files.push(data.subarray(offset, offset + size)); offset += size;
}
console.log({ prelude, version, sizes: files.map(f => f.length) });
const raw = fzstd.decompress(files[1]);
fs.writeFileSync('payload-1-raw.bin', Buffer.from(raw));
console.log('raw', raw.length);
