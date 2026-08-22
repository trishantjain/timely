import multer from "multer";


// Store uploaded files temporarily in memory.
// The submission controller will validate the files
// and then upload them to Cloudinary.

const storage = multer.memoryStorage();


// Hard transport-level limits.
// Task-specific limits are enforced
// inside the submission controller.

const HARD_MAX_FILE_SIZE_MB = 50;

const HARD_MAX_FILES = 10;


export const upload = multer({

    storage,

    limits: {

        fileSize:
            HARD_MAX_FILE_SIZE_MB *
            1024 *
            1024,

        files:
            HARD_MAX_FILES

    }

});


export default upload;