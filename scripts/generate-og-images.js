const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const sharp = require('sharp');
const { buildOgTemplate, FONT_FAMILY, OG_HEIGHT, OG_WIDTH } = require('./og-template');
const {
  collectOgPages,
  extractPageTitle,
  getOgImageContent,
  getOgImagePath,
  getOgImageUrl,
  patchOgImageTag,
} = require('./og-utils');

const FONT_PATH = path.join(__dirname, 'fonts', 'NotoSerif-Regular.ttf');

async function renderOgImage(content) {
  const fontData = fs.readFileSync(FONT_PATH);
  const template = buildOgTemplate(content);

  const svg = await satori(template, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      {
        name: FONT_FAMILY,
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function main() {
  if (!fs.existsSync(FONT_PATH)) {
    console.error(`Error: Font not found at ${FONT_PATH}`);
    process.exit(1);
  }

  const pages = collectOgPages();
  let generated = 0;
  let patched = 0;

  for (const htmlFile of pages) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const rawTitle = extractPageTitle(html);
    const content = getOgImageContent(htmlFile, rawTitle);
    const outputPath = getOgImagePath(htmlFile);
    const ogImageUrl = getOgImageUrl(htmlFile);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const png = await renderOgImage(content);
    fs.writeFileSync(outputPath, png);
    generated += 1;

    if (patchOgImageTag(htmlFile, ogImageUrl)) {
      patched += 1;
    }

    const rel = path.relative(path.join(__dirname, '..'), outputPath).replace(/\\/g, '/');
    const label = content.subtitle ? `${content.title} / ${content.subtitle}` : content.title;
    console.log(`✓ ${rel} — ${label}`);
  }

  console.log(`\nGenerated ${generated} OG images (${patched} HTML files patched).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
