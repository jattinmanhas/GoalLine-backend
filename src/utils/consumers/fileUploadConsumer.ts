import { getChannel } from "../../config/rabbitmq";
import { uploadFileToS3 } from "../../services/s3Service";
import fs from "fs";
import path from "path";
import * as mime from "mime-types";
import { insertProductImageMetadata, updateCategoryImageDetails } from "../../services/shop.services";
import { ApiError } from "../handlers/apiError";
import { productImageMetadata } from "../../types/index.types";

const convertToMulterFile = (filePath: string): Express.Multer.File => {
  const fileBuffer = fs.readFileSync(filePath);
  return {
    buffer: fileBuffer,
    originalname: path.basename(filePath),
    mimetype: mime.lookup(filePath) || "application/octet-stream", // Adjust the MIME type as needed
    size: fileBuffer.length,
    fieldname: "",
    encoding: "",
    destination: "",
    filename: "",
    path: filePath,
    stream: fs.createReadStream(filePath),
  };
};

export const startFileUploadConsumer = async () => {
  const channel = getChannel();
  channel.consume("fileUploadQueue", async (msg) => {
    if (!msg) {
      return;
    }
    const { file, folder, folder_id } = JSON.parse(msg.content.toString());
    const multerFile = convertToMulterFile(file);

    const fileKey = await uploadFileToS3(multerFile, folder);

    if (fileKey.imageName) {
      if (folder === "category") {
        // Update file name in the db.
        const updateImage = await updateCategoryImageDetails(
          fileKey.imageName,
          fileKey.etag,
          folder_id
        );

        if (updateImage.flag) {
          throw new ApiError(400, updateImage.message);
        }
      } else if (folder === "products") {
        let productImage: productImageMetadata = {
            product_id: folder_id,
            imageName: fileKey.imageName,
            etag: fileKey.etag,
          };

        const imageMeta = await insertProductImageMetadata(productImage);

        if (imageMeta.flag) {
          throw new ApiError(400, imageMeta.message);
        }
      }
    }

    fs.unlinkSync(file);
    channel.ack(msg);
    console.log("File uploaded successfully");
  });
};
