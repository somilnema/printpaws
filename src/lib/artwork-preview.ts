import sharp from "sharp";

const MAX_EDGE = 1200;
const JPEG_QUALITY = 75;

function escapeXml(value: string) {
  return value.replace(/[&<>"]/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    return "&quot;";
  });
}

function watermarkSvg(width: number, height: number, orderCode: string) {
  const title = "PETERNITY PREVIEW";
  const code = escapeXml(orderCode);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="wm" width="430" height="210" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
      <text x="16" y="78" fill="rgba(255,255,255,0.55)" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="1.2">${title}</text>
      <text x="18" y="80" fill="rgba(18,22,32,0.42)" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="1.2">${title}</text>
      <text x="16" y="112" fill="rgba(255,255,255,0.5)" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="2">${code}</text>
      <text x="18" y="114" fill="rgba(18,22,32,0.4)" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="2">${code}</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#wm)"/>
</svg>`;
}

export async function buildWatermarkedPreview(input: Buffer, orderId: string) {
  const shortId = orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const label = shortId || "PREVIEW";
  let resized: { data: Buffer; info: { width?: number; height?: number } };
  try {
    resized = await sharp(input, { failOn: "error", limitInputPixels: 48_000_000 })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new Error("This image could not be read. Upload a JPG, PNG, or WebP.");
  }

  const width = resized.info.width;
  const height = resized.info.height;
  if (!width || !height) {
    throw new Error("This image could not be read. Upload a JPG, PNG, or WebP.");
  }

  return sharp(resized.data)
    .composite([{ input: Buffer.from(watermarkSvg(width, height, label)), blend: "over" }])
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}
