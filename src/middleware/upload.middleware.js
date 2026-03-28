import multer from "multer";

//checking if this file is loaded- console.log("UPLOAD MIDDLEWARE LOADED");

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;