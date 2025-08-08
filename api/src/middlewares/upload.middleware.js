import multer from "multer";

const storage = multer.memoryStorage(); // guarda en memoria
const upload = multer({ storage });

export default upload;
