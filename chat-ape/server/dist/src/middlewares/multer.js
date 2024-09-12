import multer from 'multer';
import path from "path";
const currentWorkingDirectory = process.cwd();
// creating a storage instance which will store the images based on the type of the image added to the reques body and also
// generates the random names that dont clash.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        let absolutePath;
        if (req.chatImage) {
            absolutePath = path.join(currentWorkingDirectory, "./src/uploads/chat-images");
        }
        if (req.profileImage) {
            absolutePath = path.join(currentWorkingDirectory, "./src/uploads/profile-images");
        }
        if (req.groupImage) {
            absolutePath = path.join(currentWorkingDirectory, "./src/uploads/group-images");
        }
        if (!absolutePath)
            return callback(new Error, file.filename);
        return callback(null, absolutePath);
    },
    filename: (_req, file, callback) => {
        const suffix = `${Date.now()}${Math.round(Math.random() * 1E9)}.jpg`;
        callback(null, file.fieldname + "-" + suffix);
    }
});
export const upload = multer({ storage: storage });
