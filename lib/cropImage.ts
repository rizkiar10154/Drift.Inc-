/**
 * Loads an image reliably for canvas usage
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Accepts pixel crop (croppedAreaPixels) — NOT percentage crop.
 * Returns a valid JPEG Blob.
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  zoom: number
): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Must set canvas size to crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx!.drawImage(
    image,
    pixelCrop.x,               // crop start X
    pixelCrop.y,               // crop start Y
    pixelCrop.width,           // crop width
    pixelCrop.height,          // crop height
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas returned null blob — crop failed"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  });
}
