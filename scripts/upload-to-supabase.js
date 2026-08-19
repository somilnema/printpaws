/**
 * One-time (re-runnable) upload of gallery images + videos to Supabase Storage.
 *
 * 1. In Supabase Dashboard → Storage → New bucket
 *    Name: site-media
 *    Public: ON
 *
 * 2. Pull env from Vercel (no need to create a local .env by hand):
 *      npx vercel env pull .env.local
 *
 * 3. Run:
 *      node scripts/upload-to-supabase.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const BUCKET = "site-media";
const ROOT = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";

function contentTypeFor(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  return "application/octet-stream";
}

async function uploadFolder(supabase, localDir, remoteFolder) {
  if (!fs.existsSync(localDir)) {
    console.log(`Skip missing folder: ${localDir}`);
    return 0;
  }

  const files = fs.readdirSync(localDir).filter((name) => {
    const ext = path.extname(name).toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp", ".mp4", ".mov"].includes(ext);
  });

  let uploaded = 0;
  for (const fileName of files) {
    const localPath = path.join(localDir, fileName);
    const remotePath = `${remoteFolder}/${fileName}`;
    const body = fs.readFileSync(localPath);
    process.stdout.write(`Uploading ${remotePath} (${(body.length / 1024 / 1024).toFixed(1)} MB)... `);

    const { error } = await supabase.storage.from(BUCKET).upload(remotePath, body, {
      contentType: contentTypeFor(fileName),
      upsert: true,
    });

    if (error) {
      console.log("FAILED");
      console.error(`  ${error.message}`);
    } else {
      console.log("ok");
      uploaded += 1;
    }
  }
  return uploaded;
}

async function run() {
  if (!supabaseUrl || !supabaseKey) {
    console.error(`
Missing Supabase credentials.

You do not need to create a .env by hand. From this folder run:

  npx vercel env pull .env.local
  node scripts/upload-to-supabase.js

Need these keys:
  SUPABASE_URL          (Project URL, e.g. https://xxxx.supabase.co)
  SUPABASE_SECRET_KEY   (sb_secret_...)

`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Could not list buckets:", listError.message);
    process.exit(1);
  }

  const exists = (buckets || []).some((b) => b.name === BUCKET);
  if (!exists) {
    console.log(`Creating public bucket "${BUCKET}"...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 104857600,
    });
    if (createError) {
      console.error(`Could not create bucket: ${createError.message}`);
      console.error(`
Create it once in the Supabase dashboard:
  Storage → New bucket → name "site-media" → Public ON
Then re-run this script.
`);
      process.exit(1);
    }
  }

  const images = await uploadFolder(
    supabase,
    path.join(ROOT, "public", "new-images"),
    "new_images"
  );
  const videos = await uploadFolder(
    supabase,
    path.join(ROOT, "public", "new-videos"),
    "new_videos"
  );

  const sample = supabase.storage.from(BUCKET).getPublicUrl("new_images/Main Image.png");
  console.log(`\nUploaded ${images} images and ${videos} videos.`);
  console.log("Sample public URL:", sample.data.publicUrl);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
