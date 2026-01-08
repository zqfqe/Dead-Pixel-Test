import fs from 'fs';
import path from 'path';
import https from 'https';

const FONTS = [
  // Inter (Sans-serif)
  {
    name: 'inter-400.woff2',
    url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2'
  },
  {
    name: 'inter-500.woff2',
    url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2'
  },
  {
    name: 'inter-700.woff2',
    url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFufAZ9hjp-Ek-_EeA.woff2'
  },
  // JetBrains Mono (Monospace)
  {
    name: 'jetbrains-mono-400.woff2',
    url: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn5.woff2'
  },
  {
    name: 'jetbrains-mono-500.woff2',
    url: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn5.woff2'
  }
];

const downloadFile = (url: string, dest: string) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const main = async () => {
  // Use path.resolve() which resolves relative to process.cwd() by default
  const fontsDir = path.resolve('public', 'fonts');

  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
    console.log('📁 Created public/fonts directory');
  }

  console.log('⬇️  Downloading fonts...');
  
  for (const font of FONTS) {
    const dest = path.join(fontsDir, font.name);
    // Skip if already exists to save bandwidth/time
    if (fs.existsSync(dest)) {
        console.log(`✨ ${font.name} already exists`);
        continue;
    }
    
    try {
      await downloadFile(font.url, dest);
      console.log(`✅ Downloaded ${font.name}`);
    } catch (e) {
      console.error(`❌ Failed to download ${font.name}`, e);
    }
  }
  
  console.log('🎉 Fonts setup complete! Please restart your dev server.');
};

main();