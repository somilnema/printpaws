const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dne09ixb',
  api_key: '874848616571293',
  api_secret: 'L-_lM-4c8GuKwtHs5orn6DqTKmU'
});

async function run() {
  console.log('Fetching existing resources to delete...');
  try {
    let result = await cloudinary.api.delete_all_resources({ resource_type: 'image' });
    console.log('Deleted images:', result);
    result = await cloudinary.api.delete_all_resources({ resource_type: 'video' });
    console.log('Deleted videos:', result);
  } catch (e) {
    console.log('Error deleting (maybe none exist):', e.message);
  }

  const results = {};

  const imagesDir = path.join(__dirname, '../public/new images');
  const videosDir = path.join(__dirname, '../public/new videos');

  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        console.log('Uploading image:', file);
        const res = await cloudinary.uploader.upload(path.join(imagesDir, file), {
          folder: 'new_images',
          resource_type: 'image'
        });
        results[file] = res.public_id;
      }
    }
  }

  if (fs.existsSync(videosDir)) {
    const files = fs.readdirSync(videosDir);
    for (const file of files) {
      if (file.endsWith('.mov') || file.endsWith('.mp4') || file.endsWith('.MOV')) {
        console.log('Uploading video:', file);
        const res = await cloudinary.uploader.upload(path.join(videosDir, file), {
          folder: 'new_videos',
          resource_type: 'video'
        });
        results[file] = res.public_id;
      }
    }
  }

  fs.writeFileSync(path.join(__dirname, 'cloudinary_mapping.json'), JSON.stringify(results, null, 2));
  console.log('Done! Mapping saved to cloudinary_mapping.json');
}

run();
