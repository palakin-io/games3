import sharp from 'sharp';
import fs from 'fs';

async function optimizeSylvanas() {
  const dir = './src/assets/pictures';
  await sharp(`${dir}/sylvanas.png`)
    .resize(1000)
    .jpeg({ quality: 80 })
    .toFile(`${dir}/sylvanas.jpg`);
  console.log('Sylvanas converted to JPG');
}

optimizeSylvanas().catch(err => console.error(err));
