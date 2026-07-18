import process from "node:process";

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPrismaClient } from "@toonexpo/db";

const mediaId = process.argv[2];
if (!mediaId) {
  throw new Error("Usage: node scripts/cleanup-media-asset.mjs <mediaAssetId>");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

const prisma = createPrismaClient({ connectionString });

const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
if (!asset) {
  await prisma.$disconnect();
  process.exit(0);
}

if (accountId && accessKeyId && secretAccessKey && bucketName) {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  await client.send(
    new DeleteObjectCommand({ Bucket: bucketName, Key: asset.storageKey }),
  );
}

await prisma.mediaAsset.delete({ where: { id: asset.id } });
await prisma.$disconnect();
