import multer from 'multer';

<<<<<<< HEAD
=======

// Node.js (Express) by default cannot handle file uploads, so we use Multer to:
// Accept files from the frontend (like profile pictures, documents).
// Store them on disk or in memory.
// Access file metadata easily in the backend.


>>>>>>> e525419 (access and refresh token)
const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'./public/temp')
    },
    filename:function (req,file,cb){
        cb(null,file.originalname)
    }
}
)

export const upload = multer({ storage: storage })