import multer from 'multer';


// Node.js (Express) by default cannot handle file uploads, so we use Multer to:
// Accept files from the frontend (like profile pictures, documents).
// Store them on disk or in memory.
// Access file metadata easily in the backend.


const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'./public/temp')
    },
    filename:function (req,file,cb){
        cb(null,file.originalname)
    }
}
);
//EXPLANATION
//🔹 multer.diskStorage({...})
// Tells Multer to store uploaded files on disk (your server’s file system).
// Accepts an object with two required functions: destination and filename.

export const upload = multer({ storage: storage });
// | Code Part                   | What It Does                                          |
// | --------------------------- | ----------------------------------------------------- |
// | `multer({...})`             | Creates Multer upload middleware                      |
// | `{ storage: storage }`      | Uses custom disk storage strategy (folder & filename) |
