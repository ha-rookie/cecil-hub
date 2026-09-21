"use strict";

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const sourceIndex = args.indexOf("--source");
const appleSourceIndex = args.indexOf("--apple-source");
const OUTPUT_ROOT = rootIndex >= 0 && args[rootIndex + 1]
  ? path.resolve(args[rootIndex + 1])
  : path.resolve(__dirname, "../public");
const SOURCE = sourceIndex >= 0 && args[sourceIndex + 1]
  ? path.resolve(args[sourceIndex + 1])
  : path.resolve(__dirname, "../docs/design/assets/issue-41-icons/cecil-favicon-master.png");

const APPLE_SOURCE = appleSourceIndex >= 0 && args[appleSourceIndex + 1]
  ? path.resolve(args[appleSourceIndex + 1])
  : path.resolve(__dirname, "../docs/design/assets/issue-41-icons/cecil-apple-touch-icon-master.png");

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodeRgbaPng(buffer) {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("Source icon must be a PNG file");
  }

  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    offset += 4;
    const type = buffer.toString("ascii", offset, offset + 4);
    offset += 4;
    const data = buffer.subarray(offset, offset + length);
    offset += length + 4;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  const supportedColorType = colorType === 2 || colorType === 6;
  if (bitDepth !== 8 || !supportedColorType || interlace !== 0) {
    throw new Error(
      `Source icon must be non-interlaced 8-bit RGB/RGBA PNG; got bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace}`
    );
  }

  const packed = zlib.inflateSync(Buffer.concat(idat));
  const sourceBytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = width * sourceBytesPerPixel;
  const decoded = Buffer.alloc(width * height * sourceBytesPerPixel);
  let src = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = packed[src++];
    const rowStart = y * stride;
    const prevStart = (y - 1) * stride;

    for (let x = 0; x < stride; x += 1) {
      const raw = packed[src++];
      const left = x >= sourceBytesPerPixel
        ? decoded[rowStart + x - sourceBytesPerPixel]
        : 0;
      const up = y > 0 ? decoded[prevStart + x] : 0;
      const upLeft = y > 0 && x >= sourceBytesPerPixel
        ? decoded[prevStart + x - sourceBytesPerPixel]
        : 0;
      let value;

      switch (filter) {
        case 0:
          value = raw;
          break;
        case 1:
          value = raw + left;
          break;
        case 2:
          value = raw + up;
          break;
        case 3:
          value = raw + Math.floor((left + up) / 2);
          break;
        case 4:
          value = raw + paethPredictor(left, up, upLeft);
          break;
        default:
          throw new Error(`Unsupported PNG filter ${filter}`);
      }

      decoded[rowStart + x] = value & 0xff;
    }
  }

  if (colorType === 6) {
    return { width, height, pixels: decoded };
  }

  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const source = i * 3;
    const target = i * 4;
    pixels[target] = decoded[source];
    pixels[target + 1] = decoded[source + 1];
    pixels[target + 2] = decoded[source + 2];
    pixels[target + 3] = 255;
  }

  return { width, height, pixels };
}

function sinc(x) {
  if (Math.abs(x) < 1e-8) return 1;
  const p = Math.PI * x;
  return Math.sin(p) / p;
}

function lanczos(x, a = 3) {
  const ax = Math.abs(x);
  if (ax >= a) return 0;
  return sinc(x) * sinc(x / a);
}

function makeContributions(srcSize, dstSize) {
  const scale = dstSize / srcSize;
  const filterScale = Math.min(1, scale);
  const support = 3 / filterScale;
  const result = [];

  for (let d = 0; d < dstSize; d += 1) {
    const center = (d + 0.5) / scale - 0.5;
    const first = Math.max(0, Math.ceil(center - support));
    const last = Math.min(srcSize - 1, Math.floor(center + support));
    const items = [];
    let total = 0;

    for (let s = first; s <= last; s += 1) {
      const weight = lanczos((center - s) * filterScale) * filterScale;
      if (weight === 0) continue;
      items.push([s, weight]);
      total += weight;
    }

    result.push(items.map(([s, weight]) => [s, weight / total]));
  }

  return result;
}

function resizeLanczos(image, width, height = width) {
  if (image.width === width && image.height === height) {
    return { width, height, pixels: Buffer.from(image.pixels) };
  }

  const xContrib = makeContributions(image.width, width);
  const yContrib = makeContributions(image.height, height);
  const temp = new Float64Array(width * image.height * 4);

  for (let y = 0; y < image.height; y += 1) {
    for (let dx = 0; dx < width; dx += 1) {
      const output = (y * width + dx) * 4;
      for (const [sx, weight] of xContrib[dx]) {
        const input = (y * image.width + sx) * 4;
        temp[output] += image.pixels[input] * weight;
        temp[output + 1] += image.pixels[input + 1] * weight;
        temp[output + 2] += image.pixels[input + 2] * weight;
        temp[output + 3] += image.pixels[input + 3] * weight;
      }
    }
  }

  const pixels = Buffer.alloc(width * height * 4);
  for (let dy = 0; dy < height; dy += 1) {
    for (let x = 0; x < width; x += 1) {
      const output = (dy * width + x) * 4;
      const sums = [0, 0, 0, 0];

      for (const [sy, weight] of yContrib[dy]) {
        const input = (sy * width + x) * 4;
        sums[0] += temp[input] * weight;
        sums[1] += temp[input + 1] * weight;
        sums[2] += temp[input + 2] * weight;
        sums[3] += temp[input + 3] * weight;
      }

      for (let channel = 0; channel < 4; channel += 1) {
        pixels[output + channel] = Math.max(
          0,
          Math.min(255, Math.round(sums[channel]))
        );
      }
    }
  }

  return { width, height, pixels };
}

let crcTable = null;
function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

function crc32(buffer) {
  if (!crcTable) crcTable = buildCrcTable();
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(image) {
  const rowLength = image.width * 4 + 1;
  const raw = Buffer.alloc(rowLength * image.height);

  for (let y = 0; y < image.height; y += 1) {
    const row = y * rowLength;
    raw[row] = 0;
    image.pixels.copy(
      raw,
      row + 1,
      y * image.width * 4,
      (y + 1) * image.width * 4
    );
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function writePng(relativePath, image) {
  const target = path.join(OUTPUT_ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, encodePng(image));
  console.log(`Generated ${relativePath} (${image.width}x${image.height})`);
}

if (!fs.existsSync(SOURCE)) {
  throw new Error(`Favicon master not found: ${SOURCE}`);
}
if (!fs.existsSync(APPLE_SOURCE)) {
  throw new Error(`Apple Touch Icon master not found: ${APPLE_SOURCE}`);
}

const faviconMaster = decodeRgbaPng(fs.readFileSync(SOURCE));
const appleMaster = decodeRgbaPng(fs.readFileSync(APPLE_SOURCE));

if (faviconMaster.width !== faviconMaster.height) {
  throw new Error(`Favicon master must be square, got ${faviconMaster.width}x${faviconMaster.height}`);
}
if (appleMaster.width !== appleMaster.height) {
  throw new Error(`Apple Touch Icon master must be square, got ${appleMaster.width}x${appleMaster.height}`);
}

writePng("icons/favicon-16x16.png", resizeLanczos(faviconMaster, 16));
writePng("icons/favicon-32x32.png", resizeLanczos(faviconMaster, 32));
writePng("icons/apple-touch-icon.png", resizeLanczos(appleMaster, 180));
