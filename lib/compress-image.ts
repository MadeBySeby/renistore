const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.85;

async function decode(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some browsers can't decode certain formats via createImageBitmap but can via <img>.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Downscales a photo to at most 1280px and re-encodes it as JPEG, so uploads stay far below
 * the hosting request limit (~6 MB) and formats like HEIC become JPEG when the browser can read them.
 * Falls back to the original file if the browser can't decode it.
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const source = await decode(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(source.width, source.height));
    const width = Math.round(source.width * scale);
    const height = Math.round(source.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(source, 0, 0, width, height);
    if ("close" in source && typeof source.close === "function") source.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
