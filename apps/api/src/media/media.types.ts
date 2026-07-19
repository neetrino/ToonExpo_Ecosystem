export const R2_STORAGE = Symbol("R2_STORAGE");

export type R2StorageClient = {
  uploadObject: (
    key: string,
    body: Buffer,
    contentType: string,
  ) => Promise<void>;
  deleteObject: (key: string) => Promise<void>;
};

export type UploadedMediaScope =
  | { kind: "company"; companyId: string }
  | { kind: "platform" };
