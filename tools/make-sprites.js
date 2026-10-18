const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure output directories exist
if (!fs.existsSync('tools')) fs.mkdirSync('tools');
if (!fs.existsSync('scratch/new_props')) fs.mkdirSync('scratch/new_props', { recursive: true });

// ═══════════════════════════════════════════════════════════════════════════
// PURE PNG ENCODER (Dependency-free, exact RGBA pixel fidelity, no anti-aliasing)
// ═══════════════════════════════════════════════════════════════════════════
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
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
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
  ihdr[8] = 8; // bit depth: 8
  ihdr[9] = 6; // color type: 6 (RGBA)
  ihdr[10] = 0; // compression: deflate
  ihdr[11] = 0; // filter: none
  ihdr[12] = 0; // interlace: none
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0; // Filter 0 (None)
    rgbaBuffer.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Convert Hex string to RGBA [r, g, b, a]
function hexToRgba(hex) {
  if (!hex || hex === 'none') return [0, 0, 0, 0];
  let h = hex.replace('#', '');
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255];
  } else if (h.length === 8) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), parseInt(h.slice(6, 8), 16)];
  }
  return [0, 0, 0, 0];
}

// Grid to PNG buffer
function gridToPng(asciiArray, palette) {
  const H = asciiArray.length;
  const W = asciiArray[0].length;
  const buf = Buffer.alloc(W * H * 4);

  for (let y = 0; y < H; y++) {
    let row = asciiArray[y] || '';
    if (row.length < W) row = row.padEnd(W, '.');
    else if (row.length > W) row = row.slice(0, W);
    for (let x = 0; x < W; x++) {
      const char = row[x] || '.';
      const hex = palette[char] || 'none';
      const [r, g, b, a] = hexToRgba(hex);
      const idx = (y * W + x) * 4;
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }
  return createPng(W, H, buf);
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED PALETTE FAMILIES (Max 24 colors per large prop, 4-tone ramps, top-left)
// ═══════════════════════════════════════════════════════════════════════════

const SHARED_PALETTE = {
  '.': 'none',
  // Cast Iron & Metal 4-Tone Ramp
  'M': '#64748B', // Iron highlight (top-left specular)
  'm': '#334155', // Base iron slate
  's': '#1E293B', // Shadow iron
  'D': '#0F172A', // Deep iron outline

  // Warm Amber Lantern Light 4-Tone Ramp
  'L': '#FFFBEB', // Apex light filament (pure warm white)
  'l': '#FDE047', // Brilliant yellow-amber core
  'a': '#F59E0B', // Rich amber glass base
  'b': '#B45309', // Deep amber glass shadow
  'o': '#78350F', // Tinted frame rim

  // Wood 4-Tone Ramp (Desk & Crates)
  'W': '#D97706', // Wood highlight (warm honey)
  'w': '#92400E', // Base rich amber wood
  'x': '#451A03', // Deep wood shadow
  'k': '#260E02', // Crease / plank joint outline

  // CRT Monitor & Metal Case 4-Tone Ramp
  'C': '#94A3B8', // Monitor rim highlight
  'c': '#475569', // Monitor bezel base
  'u': '#1E293B', // Monitor shadow
  'U': '#0F172A', // Deep bezel outline

  // Terminal Green Phosphor Screen 4-Tone Ramp
  'G': '#86EFAC', // Cursor / bright text highlight
  'g': '#22C55E', // Standard green code line
  'e': '#15803D', // Shadow code line
  'v': '#051C14', // Deep green CRT screen background

  // Terracotta & Plant Greens
  'P': '#FB923C', // Pot highlight
  'p': '#C2410C', // Pot terracotta base
  'q': '#7C2D12', // Pot deep shadow
  'T': '#4ADE80', // Plant leaf highlight
  't': '#16A34A', // Plant leaf base
  'r': '#14532D', // Plant leaf deep shadow

  // LEDs (Server rack)
  'E': '#34D399', // Emerald LED
  'A': '#FBBF24', // Amber LED
  'B': '#38BDF8'  // Cyan LED
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. STREETLAMP — TWO GRID VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

// Variant 1: Coarser Grid (14 cells wide x 39 cells tall — 2px cell size => 28x78px displayed)
const LAMP_V1 = [
  ".....DDDDDDDDDD...",
  "...DDMMMMMMMMMMDD.",
  "..DMMDDDDDDDDDmmsD",
  "..DMD.......DMMmsD",
  "..DMD......DMMMmsD",
  "..DMD.....DDDDDDDD",
  "..DMD....DMmoLLLLm",
  "..DMD....DMloLLllm",
  "..DMD....DMolaaabm",
  "..DMD....DMmmooobD",
  "..DmmsD...DDDDDDDD",
  "..DmmsD.....DD....",
  "..DMDmmsD.........",
  "..DMD..DmmsD......",
  "..DMD...DmmsD.....",
  "..DMD....DDD......",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  "..DMMsD...........",
  ".DDMMsDD..........",
  ".DMMMMmsD.........",
  "DMMMMMMmmsD.......",
  "DDDDDDDDDDD.......",
  "DMMMMMMMmms.......",
  "DDDDDDDDDDD.......",
  "DDDDDDDDDDD......."
];

// Variant 2: Fine Detail Grid (24 cells wide x 68 cells tall — 1.1px cell size => 27x78px displayed)
const LAMP_V2 = [
  ".......DDDDDDDDDDDDDDDDD.......",
  ".....DDMMMMMMMMMMMMMMMMMDD.....",
  "....DMMDDDDDDDDDDDDDDDmmmmsD...",
  "...DMMD.............DMMMMmsD...",
  "..DMMD.............DMMMMMmsD...",
  "..DMD.............DMMMMMMMmsD..",
  "..DMD............DMMMMMMMMmsD..",
  "..DMD...........DDDDDDDDDDDDDD.",
  "..DMD..........DMMmmooooommmsD.",
  "..DMD.........DMmmooLLLLoommsD.",
  "..DMD.........DMmooLLllllloomD.",
  "..DMD.........DMooLLllaaaaaoomD.",
  "..DMD.........DMooLllaaaaaaaaoD.",
  "..DMD.........DMolaaaaaaaaaaaoD.",
  "..DMD.........DMolaaaaaaaaaaboD.",
  "..DMD.........DMooaaaaabbbbbboD.",
  "..DMD.........DMmmooooooooooomD.",
  "..DMD..........DDDDDDDDDDDDDD..",
  "..DMD............DMMMMmmsD.....",
  "..DmmsD...........DDDDDD.......",
  "..DMMmsD.......................",
  "..DMDDmmsD.....................",
  "..DMD..DmmsD...................",
  "..DMD...DmmsD..................",
  "..DMD....DmmsD.................",
  "..DMD.....DDD..................",
  ".DDMMMMmmssDD..................",
  ".DMMMMMMmssDD..................",
  "..DDDDDDDDDD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  "..DMMMMmmssD...................",
  ".DDMMMMMMmssDD.................",
  "DMMMMMMMMMMmmsD................",
  "DMMMMMMMMMMMmsD................",
  "DMMMMMMMMMMMmmsD...............",
  "DMMMMMMMMMMMMmsD...............",
  "DMMMMMMMMMMMMmmsD..............",
  "DDDDDDDDDDDDDDDDD..............",
  "DMMMMMMMMMMMMMmmsD.............",
  "DMMMMMMMMMMMMMmmsD.............",
  "DDDDDDDDDDDDDDDDDD.............",
  "DDDDDDDDDDDDDDDDDD............."
];

// ═══════════════════════════════════════════════════════════════════════════
// 2. WORKSTATION DESK — TWO GRID VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

// Variant 1: Coarser Grid (34 cells wide x 39 cells tall — 2px cell => 68x78px displayed)
const DESK_V1 = [
  "....UUUUUUUUUUUUUUUUUUUUU.........", // 0: CRT Top bezel
  "....UCCCCCCCCCCCCCCCcuuuU.........", // 1: Bezel bevel
  "....UCvvvvvvvvvvvvvvvcuuU.........", // 2: Screen top
  "....UCvGvvvvvvvvvvvvvcuuU...TT....", // 3: Screen diagonal glint + plant
  "....UCvvGvggggggggvvvcuuU..Tttr...", // 4: Code line 1
  "....UCvvvvgggggevvvvvcuuU.Ttttrr..", // 5: Code line 2
  "....UCvvvvvvggggggggvcuuU.Ttttrr..", // 6: Code line 3
  "....UCvvvvvvgggevvvvvcuuU..Trrr...", // 7: Code line 4
  "....UCvvvvGvggggggggvcuuU..DPPD...", // 8: Succulent pot rim
  "....UCvvvvvvvvvvvvvvvcuuU..DppqD..", // 9: Terracotta pot
  "....UCCCCCCCCCCCCCCCuuuuU..DppqD..", // 10: CRT Lower bezel
  "....UUUUUUUUUUUUUUUUUUUUU...DDDD..", // 11: CRT bottom
  "..........UCCCCuU.................", // 12: Monitor stand neck
  ".........UCCCCCCuU................", // 13
  ".......UUUUUUUUUUUU...............", // 14: Monitor stand foot
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 15: Desk surface edge
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 16: Golden wood highlight plank
  "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", // 17: Rich amber wood desktop
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // 18: Bevel shadow
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 19: Desk front fascia
  "..WWx........................WWx..", // 20: Wooden legs top
  "..WWx........................WWx..", // 21
  "..WWx........................WWx..", // 22
  "..WWx........................WWx..", // 23
  "..WWx........................WWx..", // 24
  "..WWx........................WWx..", // 25
  "..WWx........................WWx..", // 26
  "..WWx........................WWx..", // 27
  "..WWx........................WWx..", // 28
  "..WWx........................WWx..", // 29
  "..WWx........................WWx..", // 30
  "..WWx........................WWx..", // 31
  "..WWx........................WWx..", // 32
  "..WWx........................WWx..", // 33
  "..WWx........................WWx..", // 34
  "..WWx........................WWx..", // 35
  "..WWx........................WWx..", // 36
  "..WWx........................WWx..", // 37: Desk legs bottom
  "..kkk........................kkk.."  // 38: Ground contact baseline
];

// Variant 2: Fine Detail Grid (48 cells wide x 54 cells tall — 1.1px cell => 51x62px displayed)
const DESK_V2 = [
  ".....UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU............", // 0
  ".....UCCCCCCCCCCCCCCCCCCCCCCCCccccU............", // 1: Bevel highlight
  ".....UCvvvvvvvvvvvvvvvvvvvvvvvvvcuU............", // 2: Screen top
  ".....UCvGvvvvvvvvvvvvvvvvvvvvvvvcuU.............", // 3: Diagonal glint
  ".....UCvvGvvggggggggggggggggvvvvcuU......TT.....", // 4: Code line 1 + plant
  ".....UCvvvGvggggggggggggggevvvvvcuU.....TttT....", // 5
  ".....UCvvvvvgggggevvvvvvvvvvvvvvcuU....Tttttr...", // 6: Code line 2
  ".....UCvvvvvvvvggggggggggggggvvvcuU...Tttttttr..", // 7: Code line 3
  ".....UCvvvvvvvvgggggggggggevvvvvcuU...Tttttttr..", // 8
  ".....UCvvvvvvvvvvvvgggggggevvvvvcuU....Tttttr...", // 9: Indented code line 4
  ".....UCvvvvvvvvvvvvgggggggevvvvvcuU.....Trrr....", // 10
  ".....UCvvvGvvggggggggggggggggvvvcuU....DPPPPD...", // 11: Pot rim
  ".....UCvvvvvvggggggggggggeeeevvvcuU....DppppqD..", // 12
  ".....UCvvvvvvvvvvvvvvvvvvvvvvvvvcuU....DppppqD..", // 13: Terracotta pot
  ".....UCvvvvvvvvvvvvvvvvvvvvvvvvvcuU....DppppqD..", // 14
  ".....UCCCCCCCCCCCCCCCCCCCCCCCCCuuuU.....DDDD....", // 15: Lower bezel
  ".....UUUUUUUUUUUUUUUUUUUUUUUUUUUUUU.............", // 16: Monitor base
  "...............UCCCCCuuU........................", // 17: Neck
  "..............UCCCCCCCuuU.......................", // 18
  "............UUUUUUUUUUUUUUU.....................", // 19: Stand foot
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 20: Desk rim outline
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 21: Highlight plank
  "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", // 22: Rich wood desk surface
  "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", // 23
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // 24: Front bevel shadow
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 25: Fascia joint
  "...WWxx..................................WWxx...", // 26: Sturdy wooden legs
  "...WWxx..................................WWxx...", // 27
  "...WWxx..................................WWxx...", // 28
  "...WWxx..................................WWxx...", // 29
  "...WWxx..................................WWxx...", // 30
  "...WWxx..................................WWxx...", // 31
  "...WWxx..................................WWxx...", // 32
  "...WWxx..................................WWxx...", // 33
  "...WWxx..................................WWxx...", // 34
  "...WWxx..................................WWxx...", // 35
  "...WWxx..................................WWxx...", // 36
  "...WWxx..................................WWxx...", // 37
  "...WWxx..................................WWxx...", // 38
  "...WWxx..................................WWxx...", // 39
  "...WWxx..................................WWxx...", // 40
  "...WWxx..................................WWxx...", // 41
  "...WWxx..................................WWxx...", // 42
  "...WWxx..................................WWxx...", // 43
  "...WWxx..................................WWxx...", // 44
  "...WWxx..................................WWxx...", // 45
  "...WWxx..................................WWxx...", // 46
  "...WWxx..................................WWxx...", // 47
  "...WWxx..................................WWxx...", // 48
  "...WWxx..................................WWxx...", // 49
  "...WWxx..................................WWxx...", // 50
  "...WWxx..................................WWxx...", // 51
  "...WWxx..................................WWxx...", // 52
  "...kkkk..................................kkkk..."  // 53: Ground contact
];

// ═══════════════════════════════════════════════════════════════════════════
// 3. POTTED PLANT (16 cells wide x 36 cells tall)
// ═══════════════════════════════════════════════════════════════════════════
const PLANT_SPRITE = [
  "......TT........", // 0
  ".....TttT.......", // 1
  "....Tttttr......", // 2: Leaf tip
  "...Tttttttr.....", // 3
  "....Tttttr......", // 4
  ".....Trrr.......", // 5
  "..TT....TT......", // 6: Side leaf cluster
  ".TttT..TttT.....", // 7
  "TttttrTttttr....", // 8
  "TttttrTttttr....", // 9
  ".Trrr..Trrr.....", // 10
  "....TT..........", // 11: Lower leaf cluster
  "...TttT.........", // 12
  "..Tttttr........", // 13
  "...Trrr.........", // 14
  "...DPPPPPPD.....", // 15: Pot rim highlight
  "..DPPPPPPPPqD...", // 16: Pot rim base
  "..DppppppppqD...", // 17
  "..DDDDDDDDDDD...", // 18: Pot rim underside shadow
  "...DppppppqD....", // 19: Pot tapered wall
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
  "...DppppppqD....", // 33: Pot base
  "....DDDDDD......", // 34
  "....DDDDDD......"  // 35: Ground contact
];

// ═══════════════════════════════════════════════════════════════════════════
// 4. CARGO CRATES (32 cells wide x 40 cells tall)
// ═══════════════════════════════════════════════════════════════════════════
const CRATES_SPRITE = [
  "........kkkkkkkkkkkkkkkkkk......", // 0: Top crate lid
  "........kWWWWWWWWWWWWWWWWk......", // 1
  "........kWWWWWWWWWWWWWWWWk......", // 2
  "........kwwkwwwwwwwwwwkwwk......", // 3: Top crate front
  "........kwwkwwwwwwwwwwkwwk......", // 4
  "........kwwkwwkwwwwkwwkwwk......", // 5: Cross brace
  "........kwwkwwwkwwkwwwkwwk......", // 6
  "........kwwkwwwwkkwwwwkwwk......", // 7
  "........kwwkwwwkwwkwwwkwwk......", // 8
  "........kwwkwwkwwwwkwwkwwk......", // 9
  "........kwwkwwwwwwwwwwkwwk......", // 10
  "........kxxkxxxxxxxxxxkxxk......", // 11: Top crate shadow
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 12: Bottom crates lid rim
  "kWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWk", // 13: Left crate / Right crate highlights
  "kWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWk", // 14
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 15: Dual crate panels
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 16
  "kwwkwwkwwkwwkwwkwwkwwkwwkwwkwwk.", // 17: Diagonal brace
  "kwwkwwwkkwwwkwwkwwkwwwkkwwwkwwk.", // 18
  "kwwkwwwwkwwwkwwkwwkwwwwkwwwkwwk.", // 19
  "kwwkwwwkkwwwkwwkwwkwwwkkwwwkwwk.", // 20
  "kwwkwwkwwkwwkwwkwwkwwkwwkwwkwwk.", // 21
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 22
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 23
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 24
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 25
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 26
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 27
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 28
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 29
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 30
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 31
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 32
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 33
  "kwwkwwwwwwwwkwwkwwkwwwwwwwwkwwk.", // 34
  "kxxkxxxxxxxxkxxkxxkxxxxxxxxkxxk.", // 35: Bottom crate shadow
  "kxxkxxxxxxxxkxxkxxkxxxxxxxxkxxk.", // 36
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 37
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", // 38: Ground contact baseline
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"  // 39
];

// ═══════════════════════════════════════════════════════════════════════════
// 5. SERVER RACK (34 cells wide x 64 cells tall)
// ═══════════════════════════════════════════════════════════════════════════
const SERVER_SPRITE = [
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 0: Server rack top rim
  "DMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmD", // 1: Steel top bevel
  "DMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmD", // 2
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 3: Frame top
  "DMs............................smD", // 4: Bay 1 (Top blade unit)
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 5
  "DMs.DMMMMMmsDDDDDDAAADsDMMMMsD.smD", // 6: LEDs: Amber + Emerald
  "DMs.DMMEEmsDDDDDDDaAAbDsDMMMsD.smD", // 7
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 8
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDD.smD", // 9: Vent slits
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 10
  "DMs............................smD", // 11
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 12: Unit divider shelf
  "DMs............................smD", // 13: Bay 2 (Second blade unit)
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 14
  "DMs.DMMEEmsDDDDDDDBBBDsDMMMMsD.smD", // 15: LEDs: Emerald + Cyan
  "DMs.DMMEEmsDDDDDDDbBBbDsDMMMsD.smD", // 16
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 17
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDD.smD", // 18: Vent slits
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 19
  "DMs............................smD", // 20
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 21: Unit divider shelf
  "DMs............................smD", // 22: Bay 3 (Third blade unit)
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 23
  "DMs.DMMsAAADsDDDDDDEEEDsDMMMMsD.smD", // 24: LEDs: Amber + Emerald
  "DMs.DMMsaAAbDsDDDDDeEEeDsDMMMsD.smD", // 25
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 26
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDD.smD", // 27: Vent slits
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 28
  "DMs............................smD", // 29
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 30: Unit divider shelf
  "DMs............................smD", // 31: Bay 4 (Bottom power unit)
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 32
  "DMs.DMMBBBsDDDDDDDDEEEDsDMMMMsD.smD", // 33: LEDs: Cyan + Emerald
  "DMs.DMMbBBbDsDDDDDDeEEeDsDMMMsD.smD", // 34
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 35
  "DMs.DMMsDMMsDMMsDMMsDMMsDMMsDD.smD", // 36: Vent slits
  "DMs.DDDDDDDDDDDDDDDDDDDDDDDDDD.smD", // 37
  "DMs............................smD", // 38
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 39: Frame base
  "DMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmD", // 40
  "DsssssssssssssssssssssssssssssssmD", // 41
  "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", // 42
  "..DDDD....................DDDD....", // 43: Sturdy rack feet
  "..DMMD....................DMMD....", // 44
  "..DDDD....................DDDD...."  // 45: Ground baseline
];

// Write PNG files to scratch/new_props/
fs.writeFileSync('scratch/new_props/lamp_v1.png', gridToPng(LAMP_V1, SHARED_PALETTE));
fs.writeFileSync('scratch/new_props/lamp_v2.png', gridToPng(LAMP_V2, SHARED_PALETTE));
fs.writeFileSync('scratch/new_props/desk_v1.png', gridToPng(DESK_V1, SHARED_PALETTE));
fs.writeFileSync('scratch/new_props/desk_v2.png', gridToPng(DESK_V2, SHARED_PALETTE));
fs.writeFileSync('scratch/new_props/plant.png', gridToPng(PLANT_SPRITE, SHARED_PALETTE));
fs.writeFileSync('scratch/new_props/crates.png', gridToPng(CRATES_SPRITE, SHARED_PALETTE));
fs.writeFileSync('scratch/new_props/server.png', gridToPng(SERVER_SPRITE, SHARED_PALETTE));

console.log('Successfully generated native PNGs in scratch/new_props/');

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE 8X CHECKPOINT HTML FOR REVIEW
// ═══════════════════════════════════════════════════════════════════════════
const checkpointHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Footer Props Step 1 Checkpoint (8x Zoom Review)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #09090b;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 0.95rem;
      color: #a1a1aa;
      margin-top: -1.75rem;
    }
    .rule-box {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 6px;
      padding: 1rem 1.25rem;
      font-size: 0.85rem;
      color: #cbd5e1;
      line-height: 1.6;
    }
    .rule-box strong { color: #facc15; }

    .prop-card {
      background: #121316;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .prop-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #fafafa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #27272a;
      padding-bottom: 0.5rem;
    }
    .prop-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      background: #27272a;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .view-card {
      border: 1px solid #27272a;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .view-label {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.4rem 0.75rem;
      background: #18181b;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .view-stage {
      height: 320px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 20px;
      overflow: hidden;
      position: relative;
    }
    .view-stage.dark { background: #0F0F0E; }
    .view-stage.light { background: #E2E8F0; }
    .view-stage.old { background: #121316; }

    /* Ground line marker */
    .view-stage::after {
      content: '';
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(207, 198, 181, 0.4);
    }

    /* 8x Pixel Art Zoom */
    .zoom-8x {
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      transform: scale(4);
      transform-origin: bottom center;
      margin-bottom: 1px;
    }
  </style>
</head>
<body>
  <div>
    <h1>Footer Environmental Props Checkpoint (Step 1)</h1>
    <p class="subtitle">Clean, code-generated pixel-art PNGs replacing broken/blurry sprites, flush with ground baseline.</p>
  </div>

  <div class="rule-box">
    <strong>Decision Required for First Element:</strong> Choose between <strong>Variant 1 (Coarser / 2px cell grid)</strong> and <strong>Variant 2 (Finer / High-detail grid)</strong> to establish the site-wide pixelation level for all in-scope props.
  </div>

  <!-- ELEMENT 1: STREETLAMP -->
  <div class="prop-card">
    <div class="prop-title">
      <span>1. Streetlamp (Left & Right Props)</span>
      <span class="prop-tag">First Element — Choose Grid Density</span>
    </div>
    <div class="comparison-grid">
      <!-- (a) Dark Background -->
      <div class="view-card">
        <span class="view-label">Variant 1 (2px Cell) &bull; Dark Theme</span>
        <div class="view-stage dark">
          <img src="new_props/lamp_v1.png" class="zoom-8x" alt="Lamp V1 Dark">
        </div>
      </div>
      <!-- (a2) Variant 2 Dark -->
      <div class="view-card">
        <span class="view-label">Variant 2 (Fine Grid) &bull; Dark Theme</span>
        <div class="view-stage dark">
          <img src="new_props/lamp_v2.png" class="zoom-8x" alt="Lamp V2 Dark">
        </div>
      </div>
      <!-- (c) Old Sprite Comparison -->
      <div class="view-card">
        <span class="view-label">Current Blurry Sprite (For Comparison)</span>
        <div class="view-stage old">
          <img src="../assets/footer-prop-lamp-left.png" class="zoom-8x" alt="Old Lamp">
        </div>
      </div>
    </div>
    <!-- Light Background Check -->
    <div class="comparison-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="view-card">
        <span class="view-label">Variant 1 (2px Cell) &bull; Light Background</span>
        <div class="view-stage light">
          <img src="new_props/lamp_v1.png" class="zoom-8x" alt="Lamp V1 Light">
        </div>
      </div>
      <div class="view-card">
        <span class="view-label">Variant 2 (Fine Grid) &bull; Light Background</span>
        <div class="view-stage light">
          <img src="new_props/lamp_v2.png" class="zoom-8x" alt="Lamp V2 Light">
        </div>
      </div>
    </div>
  </div>

  <!-- ELEMENT 2: WORKSTATION DESK -->
  <div class="prop-card">
    <div class="prop-title">
      <span>2. Wooden Workstation Desk & CRT Monitor</span>
      <span class="prop-tag">Large Prop Grid Density</span>
    </div>
    <div class="comparison-grid">
      <div class="view-card">
        <span class="view-label">Variant 1 (2px Cell) &bull; Dark Theme</span>
        <div class="view-stage dark">
          <img src="new_props/desk_v1.png" class="zoom-8x" alt="Desk V1 Dark">
        </div>
      </div>
      <div class="view-card">
        <span class="view-label">Variant 2 (Fine Grid) &bull; Dark Theme</span>
        <div class="view-stage dark">
          <img src="new_props/desk_v2.png" class="zoom-8x" alt="Desk V2 Dark">
        </div>
      </div>
      <div class="view-card">
        <span class="view-label">Current Blurry Desk (For Comparison)</span>
        <div class="view-stage old">
          <img src="../assets/footer-prop-desk.png" class="zoom-8x" alt="Old Desk">
        </div>
      </div>
    </div>
  </div>

  <!-- ELEMENT 3: SERVER RACK, CRATES & PLANT -->
  <div class="prop-card">
    <div class="prop-title">
      <span>3. Server Rack, Cargo Crates & Potted Plant</span>
      <span class="prop-tag">Clean Pixel-Art Generation</span>
    </div>
    <div class="comparison-grid">
      <div class="view-card">
        <span class="view-label">Server Rack (Dark Steel & Blinking LEDs)</span>
        <div class="view-stage dark">
          <img src="new_props/server.png" class="zoom-8x" alt="Server">
        </div>
      </div>
      <div class="view-card">
        <span class="view-label">Cargo Crates (Wooden Planks & Braces)</span>
        <div class="view-stage dark">
          <img src="new_props/crates.png" class="zoom-8x" alt="Crates">
        </div>
      </div>
      <div class="view-card">
        <span class="view-label">Potted Plant (Terracotta & 3-Tone Leaves)</span>
        <div class="view-stage dark">
          <img src="new_props/plant.png" class="zoom-8x" alt="Plant">
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('scratch/props_checkpoint.html', checkpointHtml);
console.log('Saved scratch/props_checkpoint.html');
