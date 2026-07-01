const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'cloudinary_mapping.json');
if (!fs.existsSync(mappingPath)) {
  console.log('Mapping not found, waiting...');
  process.exit(0);
}

const mapping = require(mappingPath);

// 1. Update src/utils/cloudinary.ts
// We'll replace CLOUDINARY_MAPPING with just the new URLs mapped to their names, so the old dead links are removed.
const newMappingStr = JSON.stringify(mapping, null, 2);
const cloudinaryTsPath = path.join(__dirname, '../src/utils/cloudinary.ts');
let cloudinaryTsContent = fs.readFileSync(cloudinaryTsPath, 'utf8');

// Replace the CLOUDINARY_MAPPING object content
cloudinaryTsContent = cloudinaryTsContent.replace(
  /const CLOUDINARY_MAPPING: Record<string, string> = \{[\s\S]*?\};/,
  `const CLOUDINARY_MAPPING: Record<string, string> = ${newMappingStr};`
);
fs.writeFileSync(cloudinaryTsPath, cloudinaryTsContent);
console.log('Updated cloudinary.ts');

// 2. Update ProductGallery.tsx (Main Carousel Images)
// We will replace GALLERY_IMAGES.one with the sorted new images.
const galleryImages = [
  'Main Image.png',
  '2nd Image.png',
  '3rd Image.png',
  '4th Image (2).png',
  '5th Image.png',
  '6th Image.png',
  '7th Image.png',
  '8th Image.png',
  '9th Image.png',
  '10th Image.png'
];

const productGalleryPath = path.join(__dirname, '../src/components/ProductGallery.tsx');
let productGalleryContent = fs.readFileSync(productGalleryPath, 'utf8');
const oneArrayStr = 'one: ' + JSON.stringify(galleryImages) + ',';
productGalleryContent = productGalleryContent.replace(
  /one: \[.*?\],/,
  oneArrayStr
);

// also for the main image in ProductGallery overlay, dog_portrait_closeup... 
// wait, we don't know which one is the portrait overlay. We'll leave it as is, but it might use a local image now.
fs.writeFileSync(productGalleryPath, productGalleryContent);
console.log('Updated ProductGallery.tsx');

// 3. Update UnboxingCarousel.tsx
const unboxingPath = path.join(__dirname, '../src/components/UnboxingCarousel.tsx');
let unboxingContent = fs.readFileSync(unboxingPath, 'utf8');
const unboxingVideos = [
  'IMG_6005.MOV',
  'IMG_6007.MOV',
  'IMG_6165.MOV',
  'IMG_6181.MOV',
  'IMG_6239.MOV'
];
unboxingContent = unboxingContent.replace(/"\/IMG_3777\.MOV"/, `"${unboxingVideos[0]}"`);
unboxingContent = unboxingContent.replace(/"\/IMG_3780\.MOV"/, `"${unboxingVideos[1]}"`);
unboxingContent = unboxingContent.replace(/"\/IMG_3784\.MOV"/, `"${unboxingVideos[2]}"`);
unboxingContent = unboxingContent.replace(/"\/IMG_3791\.MOV"/, `"${unboxingVideos[3]}"`);
unboxingContent = unboxingContent.replace(/"\/IMG_3825\.MOV"/, `"${unboxingVideos[4]}"`);
fs.writeFileSync(unboxingPath, unboxingContent);
console.log('Updated UnboxingCarousel.tsx');

// 4. Update FeatureSections.tsx
const featurePath = path.join(__dirname, '../src/components/FeatureSections.tsx');
let featureContent = fs.readFileSync(featurePath, 'utf8');
featureContent = featureContent.replace(/"\/we-dont-just-draw-them\.mp4"/, `"IMG_5576.MOV"`);
fs.writeFileSync(featurePath, featureContent);
console.log('Updated FeatureSections.tsx');

// 5. Update InstagramFeed.tsx
const instaPath = path.join(__dirname, '../src/components/InstagramFeed.tsx');
let instaContent = fs.readFileSync(instaPath, 'utf8');
instaContent = instaContent.replace(/"socialproof\/Social proof video -1\.mp4"/, `"IMG_3784 (1).MOV"`);
instaContent = instaContent.replace(/"socialproof\/Social proof video - 2\.mp4"/, `"IMG_4486.MOV"`);
fs.writeFileSync(instaPath, instaContent);
console.log('Updated InstagramFeed.tsx');

console.log('All files updated successfully!');
