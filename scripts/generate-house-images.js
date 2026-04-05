#!/usr/bin/env node
/**
 * Downloads all 24 house-builder quiz images from Pollinations.ai
 * and saves them as static files in public/images/house-builder/.
 *
 * Run once: node scripts/generate-house-images.js
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'house-builder');

fs.mkdirSync(OUT_DIR, { recursive: true });

const ART_STYLE = 'cute Pixar 3D render, soft pastel colours, children illustration, vibrant and playful, isolated on white background, toy-like proportions, high detail';

function imgUrl(prompt, seed) {
  const full = encodeURIComponent(prompt + ', ' + ART_STYLE);
  return `https://image.pollinations.ai/prompt/${full}?width=512&height=512&seed=${seed}&nologo=true&model=flux`;
}

const IMAGES = [
  { seed: 1001, prompt: 'Pikachu shaped sofa, yellow electric pokemon furniture, cute couch' },
  { seed: 1002, prompt: 'Lilo and Stitch blue alien sofa, fluffy monster couch, blue furry' },
  { seed: 1003, prompt: 'dragon fire throne armchair, fantasy dragon seat with flames and scales' },
  { seed: 1004, prompt: 'giant gaming TV setup with neon LED lights, gaming room wall screen' },
  { seed: 1005, prompt: 'full wall home cinema projector screen with cozy seats and popcorn' },
  { seed: 1006, prompt: 'enchanted magic mirror television, glowing fairy tale smart mirror on wall' },
  { seed: 1007, prompt: 'candy and sweets kitchen, chocolate countertops, lollipop door handles, gingerbread walls' },
  { seed: 1008, prompt: 'futuristic space station kitchen, zero gravity floating food dispensers, sci-fi interior' },
  { seed: 1009, prompt: 'treehouse kitchen up in the tree branches, fairy lights and hanging vines, wooden cosy' },
  { seed: 1010, prompt: 'rocket ship kids bed, spaceship bedroom furniture, space themed bed frame' },
  { seed: 1011, prompt: 'unicorn cloud bed, fluffy rainbow clouds mattress, sparkles and pastel stars' },
  { seed: 1012, prompt: 'castle bunk bed with slide for kids, mini stone castle bedroom with towers' },
  { seed: 1013, prompt: 'magical Narnia wardrobe, enchanted wooden closet with snow and light inside, fantasy' },
  { seed: 1014, prompt: 'rainbow closet, clothes organized by every colour of rainbow, disco ball inside' },
  { seed: 1015, prompt: 'robot butler wardrobe, cute robot assistant selecting clothes, futuristic closet' },
  { seed: 1016, prompt: 'volcano hot tub bathroom, bubbling lava springs inside cute mini volcano, steam' },
  { seed: 1017, prompt: 'mermaid lagoon bathtub, underwater grotto bathroom with shells pearls and coral' },
  { seed: 1018, prompt: 'cloud shower, rain falls from giant fluffy white cloud above, rainbow bathroom' },
  { seed: 1019, prompt: 'dinosaur park garden, life size cute dinosaur statues, fossil dig pit, jungle plants' },
  { seed: 1020, prompt: 'backyard theme park, mini rollercoaster and candy floss machine, fun fair garden' },
  { seed: 1021, prompt: 'tropical beach backyard, palm trees, golden sand, wave pool, sunshine' },
  { seed: 1022, prompt: 'arcade room paradise with every game machine, neon lights, tokens and high scores' },
  { seed: 1023, prompt: 'wizard library with floating magic books, glowing spell books, magic wand and potions' },
  { seed: 1024, prompt: 'pop star recording studio with stage spotlights and fog machine, music room' },
];

function download(url, dest, retries = 3) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest, retries).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });

    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });

    req.setTimeout(60000, () => {
      req.destroy();
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(new Error('Timeout'));
    });
  });
}

async function run() {
  console.log(`Downloading ${IMAGES.length} images to ${OUT_DIR}\n`);

  for (let i = 0; i < IMAGES.length; i++) {
    const { seed, prompt } = IMAGES[i];
    const dest = path.join(OUT_DIR, `${seed}.png`);
    const url = imgUrl(prompt, seed);

    // Skip if already downloaded
    if (fs.existsSync(dest)) {
      console.log(`[${i + 1}/${IMAGES.length}] Skipping ${seed}.png (already exists)`);
      continue;
    }

    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        process.stdout.write(`[${i + 1}/${IMAGES.length}] Downloading ${seed}.png (attempt ${attempt})... `);
        await download(url, dest);
        const size = Math.round(fs.statSync(dest).size / 1024);
        console.log(`done (${size}KB)`);
        lastErr = null;
        break;
      } catch (err) {
        console.log(`failed: ${err.message}`);
        lastErr = err;
        if (attempt < 3) {
          const delay = attempt * 3000;
          console.log(`  Retrying in ${delay / 1000}s...`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    if (lastErr) {
      console.error(`  ERROR: Could not download seed ${seed} after 3 attempts.`);
    }

    // Polite delay between requests
    if (i < IMAGES.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  const downloaded = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).length;
  console.log(`\nDone. ${downloaded}/${IMAGES.length} images saved to public/images/house-builder/`);
}

run().catch(console.error);
