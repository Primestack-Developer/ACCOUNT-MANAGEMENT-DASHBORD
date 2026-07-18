const fs   = require('fs');
const path = require('path');

// Try both filenames
const candidates = [
  path.join(__dirname, 'cobbler-logo.jpg'),
  path.join(__dirname, 'Cobbler Logo_page-0001.jpg'),
  path.join(__dirname, 'public', 'logo.jpg'),
  path.join(__dirname, 'frontend', 'public', 'logo.jpg'),
];

const logoSrc = candidates.find(f => fs.existsSync(f));

fs.mkdirSync(path.join(__dirname, 'public'),             { recursive: true });
fs.mkdirSync(path.join(__dirname, 'frontend', 'public'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'frontend', 'src'),    { recursive: true });

if (!logoSrc) {
  console.log('No logo found — writing empty placeholder');
  fs.writeFileSync(
    path.join(__dirname, 'frontend', 'src', 'logoBase64.ts'),
    'export const LOGO_B64 = "";\n'
  );
  process.exit(0);
}

console.log('Using logo:', logoSrc);

// Copy to public folders
const dest1 = path.join(__dirname, 'public', 'logo.jpg');
const dest2 = path.join(__dirname, 'frontend', 'public', 'logo.jpg');
if (logoSrc !== dest1) fs.copyFileSync(logoSrc, dest1);
if (logoSrc !== dest2) fs.copyFileSync(logoSrc, dest2);

// Generate base64 for inline use
const b64     = fs.readFileSync(logoSrc).toString('base64');
const dataUrl = `data:image/jpeg;base64,${b64}`;
fs.writeFileSync(
  path.join(__dirname, 'frontend', 'src', 'logoBase64.ts'),
  `export const LOGO_B64 = "${dataUrl}";\n`
);
console.log('logoBase64.ts written, length:', dataUrl.length);
