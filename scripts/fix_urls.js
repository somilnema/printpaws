const fs = require('fs');
const path = require('path');

const cloudinaryTsPath = path.join(__dirname, '../src/utils/cloudinary.ts');
let content = fs.readFileSync(cloudinaryTsPath, 'utf8');

// Replace new_images/... with full URL
content = content.replace(/"new_images\/([^"]+)"/g, '"https://res.cloudinary.com/dne09ixb/image/upload/f_auto,q_auto/v1/new_images/$1"');
content = content.replace(/"new_videos\/([^"]+)"/g, '"https://res.cloudinary.com/dne09ixb/video/upload/f_auto,q_auto/v1/new_videos/$1"');

fs.writeFileSync(cloudinaryTsPath, content);
console.log('Fixed URLs in cloudinary.ts');
