import React, { useState } from "react";
import axios from "axios";
import { db } from "./firebase"; // your firebase config
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first!");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "alumni-association"); // your unsigned preset

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dikfkmd10/image/upload`,
        formData
      );

      const imageUrl = res.data.secure_url;

      await addDoc(collection(db, "announcements"), {
        title: "New Announcement",
        imageUrl,
        createdAt: serverTimestamp()
      });

      alert("Image uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default ImageUpload;
