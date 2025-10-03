// src/components/PhotoUploadPopup/cropImage.js

/**
 * Fungsi untuk membuat elemen gambar dari URL
 * @param {string} url - URL dari gambar
 * @returns {Promise<HTMLImageElement>}
 */
const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues
      image.src = url;
    });
  
  /**
   * Fungsi utama untuk meng-crop gambar
   * @param {string} imageSrc - Sumber gambar (data URL)
   * @param {object} pixelCrop - Objek berisi dimensi crop (width, height, x, y)
   * @returns {Promise<File>} - File gambar yang sudah di-crop
   */
  export default async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    if (!ctx) {
      return null;
    }
  
    // Atur ukuran kanvas sesuai dengan ukuran area crop
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
  
    // Gambar gambar asli ke kanvas dengan posisi dan ukuran yang sudah di-crop
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  
    // Ubah isi kanvas menjadi Blob, lalu ubah Blob menjadi File
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return reject(new Error("Canvas is empty"));
        }
        const file = new File([blob], "cropped_photo.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg", 1); // Kualitas gambar 1 (terbaik)
    });
  }