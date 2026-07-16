export { getR2S3Client, resetR2S3ClientForTests } from './client';
export { bestEffortDeleteR2Object, bestEffortDeleteReplacedR2Object } from './delete-object';
export { getR2Config, isR2Configured } from './get-r2-config';
export { buildMediaObjectKey, buildUploadObjectKey, type UploadObjectScope } from './object-key';
export {
  createMediaPresign,
  createUploadPresign,
  type CreateMediaPresignResult,
  type CreateUploadPresignResult,
} from './presign';
export {
  buildPublicObjectUrl,
  objectKeyFromPublicUrl,
  resolveR2Config,
  type R2Config,
  type R2EnvFields,
} from './r2-config';
