import { S3Client } from "@aws-sdk/client-s3";

const hasS3Config =
    !!process.env.S3_REGION &&
    !!process.env.S3_ENDPOINT &&
    !!process.env.S3_ACCESS_KEY_ID &&
    !!process.env.S3_SECRET_ACCESS_KEY &&
    !!process.env.S3_BUCKET_NAME;

export const s3Client = hasS3Config ? new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
}) : null;

export const isS3Enabled = hasS3Config;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
export const S3_PUBLIC_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "";
