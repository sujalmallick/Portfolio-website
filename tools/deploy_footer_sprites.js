const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// PNG encoder helper
function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    crcTable[i] = c;
  }
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    return (crc ^ -1) >>> 0;
  }
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0;
    rgbaBuffer.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function hexToRgba(hex) {
  if (!hex || hex === 'none') return [0, 0, 0, 0];
  let h = hex.replace('#', '');
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255];
  }
  return [0, 0, 0, 0];
}

const PALETTE = {
  '.': 'none',
  // Iron / Metal 4-Tone Ramp
  'M': '#64748B', // Specular iron highlight
  'm': '#334155', // Base slate iron
  's': '#1E293B', // Shadow iron
  'D': '#0F172A', // Deep iron contour

  // Warm Amber Lantern Light 4-Tone Ramp
  'L': '#FFFBEB', // Filament core
  'l': '#FDE047', // Yellow-amber light
  'a': '#F59E0B', // Amber glass base
  'b': '#B45309', // Deep amber glass shadow
  'o': '#78350F', // Tinted frame

  // Wood 4-Tone Ramp (Desk & Crates)
  'W': '#D97706', // Wood highlight plank
  'w': '#92400E', // Base rich amber wood
  'x': '#451A03', // Deep wood shadow
  'k': '#260E02', // Plank crease / outline

  // CRT Monitor & Bezel
  'C': '#94A3B8', // Bezel highlight
  'c': '#475569', // Bezel base
  'u': '#1E293B', // Bezel shadow
  'U': '#0F172A', // Bezel deep outline

  // Phosphor Green Terminal
  'G': '#86EFAC', // Cursor / specular
  'g': '#22C55E', // Code text
  'e': '#15803D', // Shadow code
  'v': '#051C14', // Screen dark background

  // Terracotta & Plant Greens
  'P': '#FB923C', // Pot highlight
  'p': '#C2410C', // Pot base
  'q': '#7C2D12', // Pot shadow
  'T': '#4ADE80', // Leaf highlight
  't': '#16A34A', // Leaf base
  'r': '#14532D', // Leaf shadow

  // LEDs (Server rack)
  'E': '#34D399', // Emerald LED
  'A': '#FBBF24', // Amber LED
  'B': '#38BDF8'  // Cyan LED
};

function gridToBuffer(asciiArray, targetW, targetH) {
  const buf = Buffer.alloc(targetW * targetH * 4);
  const srcH = asciiArray.length;

  for (let y = 0; y < targetH; y++) {
    // If targetH is larger than srcH, align to bottom (ground contact baseline)
    const srcY = y - (targetH - srcH);
    if (srcY >= 0 && srcY < srcH) {
      let row = asciiArray[srcY];
      if (row.length < targetW) row = row.padEnd(targetW, '.');
      else if (row.length > targetW) row = row.slice(0, targetW);

      for (let x = 0; x < targetW; x++) {
        const char = row[x] || '.';
        const hex = PALETTE[char] || 'none';
        const [r, g, b, a] = hexToRgba(hex);
        const idx = (y * targetW + x) * 4;
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = a;
      }
    }
  }
  return buf;
}

function flipHorizontal(buf, width, height) {
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = (y * width + (width - 1 - x)) * 4;
      out[dstIdx] = buf[srcIdx];
      out[dstIdx + 1] = buf[srcIdx + 1];
      out[dstIdx + 2] = buf[srcIdx + 2];
      out[dstIdx + 3] = buf[srcIdx + 3];
    }
  }
  return out;
}

// 1. Streetlamp Left (27 x 78)
// Arched bracket holding lantern on right side
const LAMP_ARRAY = [
  ".......DDDDDDDDDDDDDDDDD...", // 0
  ".....DDMMMMMMMMMMMMMMMMMDD.", // 1: Arched iron bracket
  "....DMMDDDDDDDDDDDDDDDmmmms", // 2
  "...DMMD.............DMMMMms", // 3: Lantern suspension ring
  "..DMMD.............DMMMMMms", // 4: Lantern finial
  "..DMD.............DMMMMMMMm", // 5: Lantern roof
  "..DMD............DMMMMMMMMm", // 6
  "..DMD...........DDDDDDDDDDD", // 7: Roof eaves rim
  "..DMD..........DMMmmooooomm", // 8: Glass top frame
  "..DMD.........DMmmooLLLLoom", // 9: Bright incandescent filament
  "..DMD.........DMmooLLlllllo", // 10
  "..DMD.........DMooLLllaaaaa", // 11: Amber light field
  "..DMD.........DMooLllaaaaaa", // 12
  "..DMD.........DMolaaaaaaaaa", // 13
  "..DMD.........DMolaaaaaaaaa", // 14
  "..DMD.........DMooaaaaabbbb", // 15: Deep amber shadow
  "..DMD.........DMmmooooooooo", // 16: Glass lower rim
  "..DMD..........DDDDDDDDDDDD", // 17: Base cup
  "..DMD............DMMMMmmsD.", // 18: Base drop finial
  "..DmmsD...........DDDDDD...", // 19
  "..DMMmsD...................", // 20: Scroll bracket under arm
  "..DMDDmmsD.................", // 21
  "..DMD..DmmsD...............", // 22
  "..DMD...DmmsD..............", // 23
  "..DMD....DmmsD.............", // 24
  "..DMD.....DDD..............", // 25
  ".DDMMMMmmssDD..............", // 26: Upper post collar
  ".DMMMMMMmssDD..............", // 27
  "..DDDDDDDDDD...............", // 28
  "..DMMMMmmssD...............", // 29: Fluted post shaft (top-left lit)
  "..DMMMMmmssD...............", // 30
  "..DMMMMmmssD...............", // 31
  "..DMMMMmmssD...............", // 32
  "..DMMMMmmssD...............", // 33
  "..DMMMMmmssD...............", // 34
  "..DMMMMmmssD...............", // 35
  "..DMMMMmmssD...............", // 36
  "..DMMMMmmssD...............", // 37
  "..DMMMMmmssD...............", // 38
  "..DMMMMmmssD...............", // 39
  "..DMMMMmmssD...............", // 40
  "..DMMMMmmssD...............", // 41
  "..DMMMMmmssD...............", // 42
  "..DMMMMmmssD...............", // 43
  "..DMMMMmmssD...............", // 44
  "..DMMMMmmssD...............", // 45
  "..DMMMMmmssD...............", // 46
  "..DMMMMmmssD...............", // 47
  "..DMMMMmmssD...............", // 48
  "..DMMMMmmssD...............", // 49
  "..DMMMMmmssD...............", // 50
  "..DMMMMmmssD...............", // 51
  "..DMMMMmmssD...............", // 52
  "..DMMMMmmssD...............", // 53
  "..DMMMMmmssD...............", // 54
  "..DMMMMmmssD...............", // 55
  "..DMMMMmmssD...............", // 56
  "..DMMMMmmssD...............", // 57
  "..DMMMMmmssD...............", // 58
  "..DMMMMmmssD...............", // 59
  "..DMMMMmmssD...............", // 60
  "..DMMMMmmssD...............", // 61
  "..DMMMMmmssD...............", // 62
  "..DMMMMmmssD...............", // 63
  "..DMMMMmmssD...............", // 64
  "..DMMMMmmssD...............", // 65
  "..DMMMMmmssD...............", // 66
  ".DDMMMMMMmssDD.............", // 67: Lower collar ring
  "DMMMMMMMMMMmmsD............", // 68: Pedestal flare
  "DMMMMMMMMMMMmsD............", // 69
  "DMMMMMMMMMMMmmsD...........", // 70
  "DMMMMMMMMMMMMmsD...........", // 71
  "DMMMMMMMMMMMMmmsD..........", // 72
  "DDDDDDDDDDDDDDDDD..........", // 73: Base rim
  "DMMMMMMMMMMMMMmmsD.........", // 74: Plinth block
  "DMMMMMMMMMMMMMmmsD.........", // 75
  "DDDDDDDDDDDDDDDDDD.........", // 76: Ground contact baseline
  "DDDDDDDDDDDDDDDDDD........."  // 77
];

// 2. Workstation Desk (51 x 62)
const DESK_ARRAY = [
  ".....UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU...............", // 0
  ".....UCCCCCCCCCCCCCCCCCCCCCCCCccccU................", // 1
  ".....UCvvvvvvvvvvvvvvvvvvvvvvvvvcuU................", // 2: Screen
  ".....UCvGvvvvvvvvvvvvvvvvvvvvvvvcuU.................", // 3: Diagonal glint
  ".....UCvvGvvggggggggggggggggvvvvcuU..........TT.....", // 4: Code lines + plant
  ".....UCvvvGvggggggggggggggevvvvvcuU.........TttT....", // 5
  ".....UCvvvvvgggggevvvvvvvvvvvvvvcuU........Tttttr...", // 6
  ".....UCvvvvvvvvggggggggggggggvvvcuU.......Tttttttr..", // 7
  ".....UCvvvvvvvvgggggggggggevvvvvcuU.......Tttttttr..", // 8
  ".....UCvvvvvvvvvvvvgggggggevvvvvcuU........Tttttr...", // 9
  ".....UCvvvvvvvvvvvvgggggggevvvvvcuU.........Trrr....", // 10
  ".....UCvvvGvvggggggggggggggggvvvcuU........DPPPPD...", // 11: Pot
  ".....UCvvvvvvggggggggggggeeeevvvcuU........DppppqD..", // 12
  ".....UCvvvvvvvvvvvvvvvvvvvvvvvvvcuU........DppppqD..", // 13
  ".....UCvvvvvvvvvvvvvvvvvvvvvvvvvcuU........DppppqD..", // 14
  ".....UCCCCCCCCCCCCCCCCCCCCCCCCCuuuU.........DDDD....", // 15
  ".....UUUUUUUUUUUUUUUUUUUUUUUUUUUUUU.................", // 16
  "...............UCCCCCuuU............................", // 17: Stand neck
  "..............UCCCCCCCuuU...........................", // 18
  "............UUUUUUUUUUUUUUU.........................", // 19: Stand foot
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 20: Desk rim
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 21: Wood highlight plank
  "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", // 22: Rich wood desk surface
  "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", // 23
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // 24: Front bevel shadow
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 25: Fascia joint
  "...WWxx......................................WWxx..", // 26: Sturdy wooden legs
  "...WWxx......................................WWxx..", // 27
  "...WWxx......................................WWxx..", // 28
  "...WWxx......................................WWxx..", // 29
  "...WWxx......................................WWxx..", // 30
  "...WWxx......................................WWxx..", // 31
  "...WWxx......................................WWxx..", // 32
  "...WWxx......................................WWxx..", // 33
  "...WWxx......................................WWxx..", // 34
  "...WWxx......................................WWxx..", // 35
  "...WWxx......................................WWxx..", // 36
  "...WWxx......................................WWxx..", // 37
  "...WWxx......................................WWxx..", // 38
  "...WWxx......................................WWxx..", // 39
  "...WWxx......................................WWxx..", // 40
  "...WWxx......................................WWxx..", // 41
  "...WWxx......................................WWxx..", // 42
  "...WWxx......................................WWxx..", // 43
  "...WWxx......................................WWxx..", // 44
  "...WWxx......................................WWxx..", // 45
  "...WWxx......................................WWxx..", // 46
  "...WWxx......................................WWxx..", // 47
  "...WWxx......................................WWxx..", // 48
  "...WWxx......................................WWxx..", // 49
  "...WWxx......................................WWxx..", // 50
  "...WWxx......................................WWxx..", // 51
  "...WWxx......................................WWxx..", // 52
  "...WWxx......................................WWxx..", // 53
  "...WWxx......................................WWxx..", // 54
  "...WWxx......................................WWxx..", // 55
  "...WWxx......................................WWxx..", // 56
  "...WWxx......................................WWxx..", // 57
  "...WWxx......................................WWxx..", // 58
  "...WWxx......................................WWxx..", // 59
  "...WWxx......................................WWxx..", // 60
  "...kkkk......................................kkkk.."  // 61: Ground contact
];

// 3. Potted Plant (16 x 38)
const PLANT_ARRAY = [
  "......TT........", // 0
  ".....TttT.......", // 1
  "....Tttttr......", // 2
  "...Tttttttr.....", // 3
  "....Tttttr......", // 4
  ".....Trrr.......", // 5
  "..TT....TT......", // 6
  ".TttT..TttT.....", // 7
  "TttttrTttttr....", // 8
  "TttttrTttttr....", // 9
  ".Trrr..Trrr.....", // 10
  "....TT..........", // 11
  "...TttT.........", // 12
  "..Tttttr........", // 13
  "...Trrr.........", // 14
  "...DPPPPPPD.....", // 15
  "..DPPPPPPPPqD...", // 16
  "..DppppppppqD...", // 17
  "..DDDDDDDDDDD...", // 18
  "...DppppppqD....", // 19
  "...DppppppqD....", // 20
  "...DppppppqD....", // 21
  "...DppppppqD....", // 22
  "...DppppppqD....", // 23
  "...DppppppqD....", // 24
  "...DppppppqD....", // 25
  "...DppppppqD....", // 26
  "...DppppppqD....", // 27
  "...DppppppqD....", // 28
  "...DppppppqD....", // 29
  "...DppppppqD....", // 30
  "...DppppppqD....", // 31
  "...DppppppqD....", // 32
  "...DppppppqD....", // 33
  "...DppppppqD....", // 34
  "...DppppppqD....", // 35
  "....DDDDDD......", // 36
  "....DDDDDD......"  // 37: Ground contact
];

// 4. Cargo Crates (36 x 45)
const CRATES_ARRAY = [
  "..........kkkkkkkkkkkkkkkkkk........", // 0
  "..........kWWWWWWWWWWWWWWWWk........", // 1
  "..........kWWWWWWWWWWWWWWWWk........", // 2
  "..........kwwkwwwwwwwwwwkwwk........", // 3
  "..........kwwkwwwwwwwwwwkwwk........", // 4
  "..........kwwkwwkwwwwkwwkwwk........", // 5
  "..........kwwkwwwkwwkwwwkwwk........", // 6
  "..........kwwkwwwwkkwwwwkwwk........", // 7
  "..........kwwkwwwkwwkwwwkwwk........", // 8
  "..........kwwkwwkwwwwkwwkwwk........", // 9
  "..........kwwkwwwwwwwwwwkwwk........", // 10
  "..........kxxkxxxxxxxxxxkxxk........", // 11
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 12
  "kWWWWWWWWWWWWWWWWkkWWWWWWWWWWWWWWWWk", // 13
  "kWWWWWWWWWWWWWWWWkkWWWWWWWWWWWWWWWWk", // 14
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 15
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 16
  "kwwkwwkwwwwkwwkwwkkwwkwwkwwwwkwwkwwk", // 17
  "kwwkwwwkwwkwwwkwwkkwwkwwwkwwkwwwkwwk", // 18
  "kwwkwwwwkkwwwwkwwkkwwkwwwwkkwwwwkwwk", // 19
  "kwwkwwwkwwkwwwkwwkkwwkwwwkwwkwwwkwwk", // 20
  "kwwkwwkwwwwkwwkwwkkwwkwwkwwwwkwwkwwk", // 21
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 22
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 23
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 24
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 25
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 26
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 27
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 28
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 29
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 30
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 31
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 32
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 33
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 34
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 35
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 36
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 37
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 38
  "kwwkwwwwwwwwwwkwwkkwwkwwwwwwwwwwkwwk", // 39
  "kxxkxxxxxxxxxxkxxkkxxkxxxxxxxxxxkxxk", // 40
  "kxxkxxxxxxxxxxkxxkkxxkxxxxxxxxxxkxxk", // 41
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 42
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 43
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"  // 44: Ground contact
];

// 5. Server Rack (37 x 77)
const SERVER_ARRAY = [
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 0
  "DMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmD", // 1
  "DMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmD", // 2
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 3
  "DMs...............................smD", // 4
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 5
  "DMs.DMMMMMmsDDDDDDDAAADsDMMMMMMsD.smD", // 6
  "DMs.DMMEEmsDDDDDDDDaAAbDsDMMMMMsD.smD", // 7
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 8
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDMMsD.smD", // 9
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 10
  "DMs...............................smD", // 11
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 12
  "DMs...............................smD", // 13
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 14
  "DMs.DMMEEmsDDDDDDDDBBBDsDMMMMMMsD.smD", // 15
  "DMs.DMMEEmsDDDDDDDDbBBbDsDMMMMMsD.smD", // 16
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 17
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDMMsD.smD", // 18
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 19
  "DMs...............................smD", // 20
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 21
  "DMs...............................smD", // 22
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 23
  "DMs.DMMsAAADsDDDDDDDEEEDsDMMMMMMsD.smD", // 24
  "DMs.DMMsaAAbDsDDDDDDeEEeDsDMMMMMsD.smD", // 25
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 26
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDMMsD.smD", // 27
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 28
  "DMs...............................smD", // 29
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 30
  "DMs...............................smD", // 31
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 32
  "DMs.DMMBBBsDDDDDDDDDEEEDsDMMMMMMsD.smD", // 33
  "DMs.DMMbBBbDsDDDDDDDeEEeDsDMMMMMsD.smD", // 34
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 35
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDMMsD.smD", // 36
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 37
  "DMs...............................smD", // 38
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 39
  "DMs...............................smD", // 40
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 41
  "DMs.DMMsAAADsDDDDDDDBBBDsDMMMMMMsD.smD", // 42
  "DMs.DMMsaAAbDsDDDDDDbBBbDsDMMMMMsD.smD", // 43
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 44
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDMMsD.smD", // 45
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 46
  "DMs...............................smD", // 47
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 48
  "DMs...............................smD", // 49
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 50
  "DMs.DMMsEEEDsDDDDDDDEEEDsDMMMMMMsD.smD", // 51
  "DMs.DMMseEEeDsDDDDDDeEEeDsDMMMMMsD.smD", // 52
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 53
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDMMsD.smD", // 54
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 55
  "DMs...............................smD", // 56
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 57
  "DMs...............................smD", // 58
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 59
  "DMs.DMMsAAADsDDDDDDDEEEDsDMMMMMMsD.smD", // 60
  "DMs.DMMsaAAbDsDDDDDDeEEeDsDMMMMMsD.smD", // 61
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 62
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDMMsD.smD", // 63
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 64
  "DMs...............................smD", // 65
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 66
  "DMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmD", // 67
  "DsssssssssssssssssssssssssssssssssmD", // 68
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 69
  "DMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmD", // 70
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 71
  "..DDDD.......................DDDD...", // 72: Sturdy rack feet
  "..DMMD.......................DMMD...", // 73
  "..DMMD.......................DMMD...", // 74
  "..DDDD.......................DDDD...", // 75
  "..DDDD.......................DDDD..."  // 76: Ground contact
];

// Generate and deploy directly to assets/
const lampLeftBuf = gridToBuffer(LAMP_ARRAY, 27, 78);
const lampRightBuf = flipHorizontal(lampLeftBuf, 27, 78);
const deskBuf = gridToBuffer(DESK_ARRAY, 51, 62);
const plantBuf = gridToBuffer(PLANT_ARRAY, 16, 38);
const cratesBuf = gridToBuffer(CRATES_ARRAY, 36, 45);
const serverBuf = gridToBuffer(SERVER_ARRAY, 37, 77);

fs.writeFileSync('assets/footer-prop-lamp-left.png', createPng(27, 78, lampLeftBuf));
fs.writeFileSync('assets/footer-prop-lamp-right.png', createPng(27, 78, lampRightBuf));
fs.writeFileSync('assets/footer-prop-desk.png', createPng(51, 62, deskBuf));
fs.writeFileSync('assets/footer-prop-plant.png', createPng(16, 38, plantBuf));
fs.writeFileSync('assets/footer-prop-crates-left.png', createPng(36, 45, cratesBuf));
fs.writeFileSync('assets/footer-prop-server.png', createPng(37, 77, serverBuf));

console.log('Successfully deployed all clean pixel-art PNG props into assets/!');
