import { Inject, Injectable } from "@nestjs/common";
import { v2 as Cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject("CLOUDINARY")
    private cloudinary: typeof Cloudinary,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        {
          folder: "lavender-customizations",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }
}