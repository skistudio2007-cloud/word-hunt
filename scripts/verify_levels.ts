import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CompactLevel } from '../src/data/levels/types';
import { Direction } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRECTION_OFFSETS: Record<Direction, [number, number]> = {
  RIGHT: [0, 1],
  LEFT: [0, -1],
  DOWN: [1, 0],
  UP: [-1, 0],
  DOWN_RIGHT: [1, 1],
  DOWN_LEFT: [1, -1],
  UP_RIGHT: [-1, 1],
  UP_LEFT: [-1, -1]
};

async function verifyAllLevels() {
  const chunksDir = path.resolve(__dirname, '../src/data/levels/chunks');
  const chunkFiles = fs.readdirSync(chunksDir).filter(f => f.startsWith('chunk_') && f.endsWith('.json'));

  console.log(`🔍 Verifying ${chunkFiles.length} chunk files...`);

  let totalLevelsCount = 0;
  const levelNumbersSeen = new Set<number>();
  const fingerprintsSeen = new Set<string>();

  for (let c = 1; c <= 20; c++) {
    const filePath = path.join(chunksDir, `chunk_${c}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing expected chunk file: chunk_${c}.json`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const levels: CompactLevel[] = JSON.parse(content);

    if (levels.length !== 500) {
      throw new Error(`Chunk ${c} has ${levels.length} levels, expected 500`);
    }

    for (const lvl of levels) {
      totalLevelsCount++;
      const expectedLvlNum = (c - 1) * 500 + levels.indexOf(lvl) + 1;

      if (lvl.l !== expectedLvlNum) {
        throw new Error(`Level mismatch in chunk ${c}: expected level ${expectedLvlNum}, found ${lvl.l}`);
      }

      if (levelNumbersSeen.has(lvl.l)) {
        throw new Error(`Duplicate level number encountered: ${lvl.l}`);
      }
      levelNumbersSeen.add(lvl.l);

      // Verify grid
      const sz = lvl.sz;
      if (!lvl.g || lvl.g.length !== sz) {
        throw new Error(`Level ${lvl.l}: Grid row count ${lvl.g?.length} does not match sz ${sz}`);
      }

      for (let r = 0; r < sz; r++) {
        if (lvl.g[r].length !== sz) {
          throw new Error(`Level ${lvl.l}: Grid row ${r} length ${lvl.g[r].length} does not match sz ${sz}`);
        }
        for (let col = 0; col < sz; col++) {
          const ch = lvl.g[r][col];
          if (!/[A-Z]/.test(ch)) {
            throw new Error(`Level ${lvl.l}: Non-uppercase letter "${ch}" at (${r},${col})`);
          }
        }
      }

      // Verify words
      if (!lvl.w || lvl.w.length < 3) {
        throw new Error(`Level ${lvl.l}: Insufficient words (${lvl.w?.length})`);
      }

      for (const w of lvl.w) {
        const word = w.w;
        const [dRow, dCol] = DIRECTION_OFFSETS[w.dir];
        const [sr, sc] = w.s;
        const [er, ec] = w.ec;

        const expectedEr = sr + dRow * (word.length - 1);
        const expectedEc = sc + dCol * (word.length - 1);

        if (er !== expectedEr || ec !== expectedEc) {
          throw new Error(`Level ${lvl.l}: Word ${word} end coord mismatch: expected (${expectedEr},${expectedEc}), got (${er},${ec})`);
        }

        for (let i = 0; i < word.length; i++) {
          const r = sr + dRow * i;
          const col = sc + dCol * i;
          if (r < 0 || r >= sz || col < 0 || col >= sz) {
            throw new Error(`Level ${lvl.l}: Word ${word} out of bounds at char index ${i}`);
          }
          if (lvl.g[r][col] !== word[i]) {
            throw new Error(`Level ${lvl.l}: Word ${word} letter mismatch at index ${i}: grid has ${lvl.g[r][col]}, word has ${word[i]}`);
          }
        }
      }

      // Uniqueness fingerprint
      const fp = `${lvl.t}:${lvl.sz}:${lvl.w.map(w => w.w).sort().join(',')}:${lvl.g.join('')}`;
      if (fingerprintsSeen.has(fp)) {
        throw new Error(`Level ${lvl.l}: Duplicate puzzle fingerprint detected!`);
      }
      fingerprintsSeen.add(fp);
    }
  }

  console.log(`✅ VERIFICATION COMPLETE:`);
  console.log(`   - Total levels verified: ${totalLevelsCount} / 10,000`);
  console.log(`   - Level sequence: Level 1 through Level 10,000 sequentially intact`);
  console.log(`   - Solvability: 100% of words verified character-by-character in the grids`);
  console.log(`   - Uniqueness: 10,000 unique fingerprints with 0 duplicates`);
}

verifyAllLevels().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
