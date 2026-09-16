import axios from "axios";

// Cloudinary config comes from the environment so the repo carries no
// account-specific values. Set these in frontend/.env:
//   REACT_APP_CLOUDINARY_CLOUD_NAME=...
//   REACT_APP_CLOUDINARY_UPLOAD_PRESET=...   (unsigned preset)
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "";
const UPLOAD_FOLDER = "talentforge";

// Upload a file to Cloudinary and return its public URL.
// `type` is "image" for profile photos and "raw" for PDF resumes.
const uploadToCloudinary = async (file, type = "image") => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set REACT_APP_CLOUDINARY_CLOUD_NAME and " +
        "REACT_APP_CLOUDINARY_UPLOAD_PRESET in frontend/.env"
    );
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);
  data.append("folder", UPLOAD_FOLDER);

  const resourcePath = type === "image" ? "image" : "raw";
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourcePath}/upload`;

  const res = await axios.post(url, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.secure_url;
};

export default uploadToCloudinary;
