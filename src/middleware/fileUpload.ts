import multer, { FileFilterCallback, MulterError } from "multer";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/handlers/apiError";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("File type not allowed. Only image files are permitted"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const singleFileUpload =
  (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (error: any) => {
      if (error) {
        return next(new ApiError(400, error.message));
      }

      next();
    });
  };

export const multipleFileUpload =
  (fieldName: string, maxCount: number) =>
  (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (error: any) => {
      if (error) {
        return next(new ApiError(400, error.message));
      }

      next();
    });
  };

export default upload;
