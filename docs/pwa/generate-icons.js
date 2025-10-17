const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'icons', 'icon-512.png');
const out = path.join(__dirname, '..', 'icons');
const sizes = [192, 152, 167, 180, 512];
const splashSizes = [ {w:1125,h:2436}, {w:1242,h:2688}, {w:828,h:1792} ];

async function run(){
  if(!fs.existsSync(src)){
    console.error('Source icon not found:', src);
    process.exit(1);
  }
  const image = await Jimp.read(src);
  for(const s of sizes){
    const file = path.join(out, `icon-${s}.png`);
    await image.clone().resize(s, s).writeAsync(file);
    console.log('Wrote', file);
  }
  for(const s of splashSizes){
    const file = path.join(out, `apple-splash-${s.w}x${s.h}.png`);
    await image.clone().cover(s.w, s.h).writeAsync(file);
    console.log('Wrote', file);
  }
}

run().catch(err=>{ console.error(err); process.exit(2); });
