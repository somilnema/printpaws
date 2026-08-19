// Gallery media is served from /public. HEVC .MOV files are rewritten to H.264 .mp4
// siblings because Chrome on Linux cannot play HEVC.

const SITE_IMAGES = new Set([
  "10th Image.png",
  "2nd Image.png",
  "3rd Image.png",
  "4th Image (2).png",
  "5th Image (2).png",
  "5th Image.png",
  "6th Image.png",
  "7th Image.png",
  "8th Image.png",
  "9th Image.png",
  "Main Image (1).png",
  "Main Image.png",
]);

const SITE_VIDEOS = new Set([
  "IMG_3784 (1).mp4",
  "IMG_3784 (1).MOV",
  "IMG_4486.mp4",
  "IMG_4486.MOV",
  "IMG_5470.mp4",
  "IMG_5470.MOV",
  "IMG_5473.mp4",
  "IMG_5473.MOV",
  "IMG_5498.mp4",
  "IMG_5498.MOV",
  "IMG_5573.mp4",
  "IMG_5573.MOV",
  "IMG_5576.mp4",
  "IMG_5576.MOV",
  "IMG_6005.mp4",
  "IMG_6005.MOV",
  "IMG_6007.mp4",
  "IMG_6007.MOV",
  "IMG_6165.mp4",
  "IMG_6165.MOV",
  "IMG_6181.mp4",
  "IMG_6181.MOV",
  "IMG_6239.mp4",
  "IMG_6239.MOV",
]);

function playableFileName(fileName: string): string {
  // Chrome on Linux cannot play HEVC .MOV; serve the H.264 mp4 sibling.
  return fileName.replace(/\.MOV$/i, ".mp4");
}

function rewriteFolder(cleanKey: string): string {
  return playableFileName(cleanKey)
    .replace(/^new images\//, "new-images/")
    .replace(/^new videos\//, "new-videos/")
    .replace(/^new review\//, "new-review/");
}

/**
 * Resolves a gallery/media key to a public URL under /public.
 */
export const getCloudinaryUrl = (key: string): string => {
  if (key.startsWith("http")) return key;

  const cleanKey = key.startsWith("/") ? key.substring(1) : key;
  const fileName = playableFileName(cleanKey.split("/").pop() || cleanKey);

  if (SITE_IMAGES.has(cleanKey) || SITE_IMAGES.has(fileName)) {
    return `/new-images/${fileName}`;
  }

  if (SITE_VIDEOS.has(cleanKey) || SITE_VIDEOS.has(fileName)) {
    return `/new-videos/${fileName}`;
  }

  return "/" + rewriteFolder(cleanKey);
};
