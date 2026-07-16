export type R2EnvFields = {
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_URL?: string;
};

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

/** Returns R2 config when all five env fields are set; otherwise null. */
export function resolveR2Config(env: R2EnvFields): R2Config | null {
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucketName = env.R2_BUCKET_NAME;
  const publicUrl = env.R2_PUBLIC_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

export function buildPublicObjectUrl(publicUrlBase: string, objectKey: string): string {
  const base = publicUrlBase.replace(/\/+$/, '');
  return `${base}/${objectKey}`;
}

/**
 * When `url` is under the configured R2 public prefix, returns the object key;
 * otherwise null (external / pasted URLs are left alone).
 */
export function objectKeyFromPublicUrl(publicUrlBase: string, url: string): string | null {
  const prefix = `${publicUrlBase.replace(/\/+$/, '')}/`;
  if (!url.startsWith(prefix)) {
    return null;
  }
  const key = url.slice(prefix.length);
  return key.length > 0 ? key : null;
}
