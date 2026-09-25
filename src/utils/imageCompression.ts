const MAX_LONG_EDGE = 1600;
const JPEG_QUALITY = 0.85;
const SKIP_COMPRESS_BELOW_BYTES = 1.5 * 1024 * 1024;

async function loadImageSource(
  file: File,
): Promise<HTMLImageElement | ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to Image element
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image file is corrupted or not readable."));
    };
    image.src = url;
  });
}

function getDimensions(source: HTMLImageElement | ImageBitmap): {
  width: number;
  height: number;
} {
  if (source instanceof ImageBitmap) {
    return { width: source.width, height: source.height };
  }
  return { width: source.naturalWidth, height: source.naturalHeight };
}

function closeSource(source: HTMLImageElement | ImageBitmap): void {
  if (source instanceof ImageBitmap && typeof source.close === "function") {
    source.close();
  }
}

/**
 * Resize and compress tag photos before OCR upload to reduce wait time.
 * Returns the original file when compression would not help.
 */
export async function compressImageForOCR(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const source = await loadImageSource(file);
  const { width, height } = getDimensions(source);
  const longEdge = Math.max(width, height);

  if (longEdge <= MAX_LONG_EDGE && file.size <= SKIP_COMPRESS_BELOW_BYTES) {
    closeSource(source);
    return file;
  }

  const scale = MAX_LONG_EDGE / longEdge;
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    closeSource(source);
    return file;
  }

  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  closeSource(source);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "sample-tag";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
