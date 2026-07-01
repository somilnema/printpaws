const fs = require('fs');
const path = require('path');

const cloudinaryTsPath = path.join(__dirname, '../src/utils/cloudinary.ts');
let content = fs.readFileSync(cloudinaryTsPath, 'utf8');

content = content.replace(/\/f_auto,q_auto\/v1\//g, '/v1/');

fs.writeFileSync(cloudinaryTsPath, content);
console.log('Removed duplicate f_auto,q_auto from cloudinary.ts');
