import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";


function getResourceType(mimeType = "") {

    if (mimeType.startsWith("image/")) {
        return "image";
    }

    // PDF, DOCX, XLSX, ZIP and other files
    return "raw";

}


export const uploadFileToCloudinary = (
    file,
    options = {}
) => {

    return new Promise((resolve, reject) => {

        if (!file || !file.buffer) {

            return reject(
                new Error(
                    "Invalid file buffer for Cloudinary upload."
                )
            );

        }


        const resourceType =
            getResourceType(file.mimetype);


        const uploadOptions = {

            resource_type:
                resourceType,

            folder:
                options.folder ||
                "timely/submissions",

            public_id:
                options.publicId,

            use_filename: false,

            unique_filename: true,

            overwrite: false

        };


        const uploadStream =
            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {

                    if (error) {

                        console.error(
                            "[Cloudinary Upload Error]",
                            error
                        );

                        return reject(error);

                    }


                    resolve(result);

                }
            );


        streamifier
            .createReadStream(file.buffer)
            .pipe(uploadStream);

    });

};


export const deleteFileFromCloudinary = async (
    publicId,
    resourceType = "raw"
) => {

    if (!publicId) {
        return;
    }


    try {

        await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type:
                    resourceType
            }
        );

    }
    catch (err) {

        console.error(
            "[Cloudinary Delete Error]",
            err
        );

        throw err;

    }

};