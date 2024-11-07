import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { S3_BUCKET, s3Client } from "../config/s3Config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/handlers/apiError";

export async function uploadFileToS3(
  file: Express.Multer.File,
  folder: string
) {
  const filename = `${folder}/${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: S3_BUCKET,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);

    return {
      imageName: filename,
      etag: result.ETag,
    };
  } catch (error) {
    throw new ApiError(500, "Failed to Upload Category Image to AWS");
  }
}

export async function getSignedForImage(imageName: string) {
  const getObjectParams = {
    Bucket: S3_BUCKET,
    Key: imageName,
  };

  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 });

  return url;
}

export async function deleteImageFromS3(imageName: string) {
  const deleteObjectParams = {
    Bucket: S3_BUCKET,
    Key: imageName,
  };

  const command = new DeleteObjectCommand(deleteObjectParams);
  await s3Client.send(command);

  return true;
}
