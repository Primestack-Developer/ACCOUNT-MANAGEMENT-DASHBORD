const fs   = require('fs');
const path = require('path');

const logoSrc = path.join(__dirname, 'Cobbler Logo_page-0001.jpg');
const dest1   = path.join(__dirname, 'public', 'logo.jpg');
const dest2   = path.join(__dirname, 'frontend', 'public', 'logo.jpg');

fs.mkdirSync(path.join(__dirname, 'frontend', 'public'), { recursive: true });
fs.copyFileSync(logoSrc, dest1);
fs.copyFileSync(logoSrc, dest2);
console.log('Logo copied to public folders');

const b64    = fs.readFileSync(logoSrc).toString('base64');
const dataUrl = `data:image/jpeg;base64,${b64}`;
fs.writeFileSync(
  path.join(__dirname, 'frontend', 'src', 'logoBase64.ts'),
  `export const LOGO_B64 = "${dataUrl}";\n`
);
console.log('logoBase64.ts written, total length:', dataUrl.length);
