export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  mimeType = "image/png" // default PNG biar support transparansi
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const MAX_WIDTH = 400;
  const scale = MAX_WIDTH / pixelCrop.width;

  const outputWidth = MAX_WIDTH;
  const outputHeight = pixelCrop.height * scale;

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background putih hanya untuk JPG
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // COMPRESS (PNG ignore quality, tapi tetap kita set)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }

        const fileName =
          mimeType === "image/png"
            ? "cropped-photo.png"
            : "cropped-photo.jpg";

        const file = new File([blob], fileName, { type: mimeType });
        resolve(file);
      },
      mimeType,
      mimeType === "image/jpeg" ? 0.9 : 1 // JPG bisa compress, PNG ignore
    );
  });
}