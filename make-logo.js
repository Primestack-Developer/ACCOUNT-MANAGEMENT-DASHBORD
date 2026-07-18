const fs   = require('fs');
const path = require('path');

const logoSrc = path.join(__dirname, 'Cobbler Logo_page-0001.jpg');

// If logo doesn't exist, skip silently — build won't fail
if (!fs.existsSync(logoSrc)) {
  console.log('Logo file not found — skipping logo generation');
  // Create a minimal placeholder so import doesn't break
  const placeholder = 'export const LOGO_B64 = "";\n';
  fs.mkdirSync(path.join(__dirname, 'frontend', 'src'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'frontend', 'src', 'logoBase64.ts'), placeholder);
  console.log('Placeholder logoBase64.ts written');
  process.exit(0);
}

const dest1 = path.join(__dirname, 'public', 'logo.jpg');
const dest2 = path.join(__dirname, 'frontend', 'public', 'logo.jpg');

fs.mkdirSync(path.join(__dirname, 'public'),            { recursive: true });
fs.mkdirSync(path.join(__dirname, 'frontend', 'public'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'frontend', 'src'),    { recursive: true });

fs.copyFileSync(logoSrc, dest1);
fs.copyFileSync(logoSrc, dest2);
console.log('Logo copied to public folders');

const b64     = fs.readFileSync(logoSrc).toString('base64');
const dataUrl = `data:image/jpeg;base64,${b64}`;
fs.writeFileSync(
  path.join(__dirname, 'frontend', 'src', 'logoBase64.ts'),
  `export const LOGO_B64 = "${dataUrl}";\n`
);
console.log('logoBase64.ts written, length:', dataUrl.length);
