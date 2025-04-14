const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD}/upload`;

const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "RealTime-chat-file");

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload file");
        }

        const responseData = await response.json();

        return responseData;

    } catch (error) {
        console.error("Upload error:", error);
        return null;
    }
};

export default uploadFile;

