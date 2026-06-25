// Centralized Cloudinary Asset Mapping & Delivery System
// Configured automatically with optimized CDN transformation parameters (f_auto, q_auto)

const CLOUDINARY_MAPPING: Record<string, string> = {
  "10th Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/mfus15fslenvptkifdtu",
  "2nd Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/wmef8rhdgb5amt8fn59x",
  "3rd Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/jhhz4ryt1o5qxaxaao1u",
  "4th Image (2).png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/bna9oadezrozuhccvcqp",
  "5th Image (2).png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/br4uomndkvavos7vb0bo",
  "5th Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/csqgqyugtou11cjeq7w1",
  "6th Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/izmj2sfay2efo5zokwlt",
  "7th Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/wwmow2fvxmepym8nvt75",
  "8th Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/wunqzqn1qhw1itdj21v2",
  "9th Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/lbdkywytyvunx2nnyz2h",
  "Main Image (1).png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/cswbdyaogels9nfapafi",
  "Main Image.png": "https://res.cloudinary.com/dne09ixb/image/upload/v1/new_images/x4buh9rusknapldevxsw",
  "IMG_3784 (1).MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/tvmkmz6ewh6d2hwltmog",
  "IMG_4486.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/bb9pbjblog2avfhqrb4n",
  "IMG_5470.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/wfrr6wlolasw2ftxqkeg",
  "IMG_5473.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/rtzc67tvix7zorepewn2",
  "IMG_5498.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/d2oa3qz0x714q5mvwkzq",
  "IMG_5573.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/suyfmre2sa1hhfllswf9",
  "IMG_5576.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/yd6frtxbqidtyaxlh0h3",
  "IMG_6005.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/cobloubm1hedxmxmsawb",
  "IMG_6007.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/klht4seuo0h3uxokfrhg",
  "IMG_6165.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/p3mphjp45dzct8z9v2qy",
  "IMG_6181.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/bdzc0us0ayzwb8tmhpj8",
  "IMG_6239.MOV": "https://res.cloudinary.com/dne09ixb/video/upload/v1/new_videos/kkh2iucwg3o8ylnzccbg"
};

/**
 * Transforms a local asset path key into a high-performance Cloudinary delivery URL
 * with automatic image format shifting (AVIF/WebP), smart compression, and native video transcoding.
 */
export const getCloudinaryUrl = (key: string): string => {
  // Strip leading slash if present
  const cleanKey = key.startsWith('/') ? key.substring(1) : key;
  const url = CLOUDINARY_MAPPING[cleanKey] || key;
  
  if (url.includes('res.cloudinary.com')) {
    // 1. Inject automatic formatting and high-efficiency quality parameters
    let optimizedUrl = url
      .replace('/image/upload/', '/image/upload/f_auto,q_auto/')
      .replace('/video/upload/', '/video/upload/f_auto,q_auto/');
      
    // 2. Transcode heavy raw QuickTime .mov files to compressed streaming .mp4 dynamically
    if (optimizedUrl.toLowerCase().endsWith('.mov')) {
      optimizedUrl = optimizedUrl.slice(0, -4) + '.mp4';
    }
    
    return optimizedUrl;
  }
  
  if (!url.startsWith('http') && !url.startsWith('/')) {
    return '/' + url;
  }

  return url;
};
