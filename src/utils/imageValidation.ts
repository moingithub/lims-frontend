export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  quality_score: number;
  metadata?: {
    width?: number;
    height?: number;
    fileType: string;
    isPdf?: boolean;
  };
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_FILE_SIZE = 50 * 1024;
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 800;

function getFileType(file: File): string {
  if (file.type) {
    return file.type.toLowerCase();
  }

  const filename = file.name.toLowerCase();
  const ext = filename.split(".").pop() || "";
  return ext === "pdf" ? "application/pdf" : `image/${ext}`;
}

function isAllowedFile(file: File): boolean {
  const fileType = getFileType(file);
  if (ALLOWED_MIME_TYPES.includes(fileType)) {
    return true;
  }

  const filename = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => filename.endsWith(`.${ext}`));
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
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

async function createBitmapFromFile(file: File): Promise<ImageBitmap | null> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      return null;
    }
  }

  return null;
}

function drawImageToCanvas(
  imageSource: HTMLImageElement | ImageBitmap,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.drawImage(imageSource, 0, 0, width, height);
  return { canvas, context };
}

function computeGrayscale(imageData: ImageData) {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const gray = new Float32Array(totalPixels);

  let sum = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const value = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[p] = value;
    sum += value;
  }

  const mean = sum / totalPixels;
  let variance = 0;
  for (let i = 0; i < totalPixels; i += 1) {
    const diff = gray[i] - mean;
    variance += diff * diff;
  }

  return {
    gray,
    mean,
    stdDev: Math.sqrt(variance / totalPixels),
    width,
    height,
  };
}

function analyzeImageQuality(grayData: {
  gray: Float32Array;
  width: number;
  height: number;
}) {
  const { gray, width, height } = grayData;
  const totalPixels = width * height;
  let edgeCount = 0;
  let horizontalEdges = 0;
  let verticalEdges = 0;
  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let borderEdgeCount = 0;

  const edgeThreshold = 40;
  const borderSize = Math.max(2, Math.floor(Math.min(width, height) * 0.05));

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const centerIndex = y * width + x;
      const topIndex = centerIndex - width;
      const bottomIndex = centerIndex + width;
      const leftIndex = centerIndex - 1;
      const rightIndex = centerIndex + 1;

      const dx =
        gray[leftIndex] +
        2 * gray[leftIndex + width] +
        gray[leftIndex + 2 * width] -
        (gray[rightIndex] +
          2 * gray[rightIndex + width] +
          gray[rightIndex + 2 * width]);
      const dy =
        gray[topIndex - 1] +
        2 * gray[topIndex] +
        gray[topIndex + 1] -
        (gray[bottomIndex - 1] + 2 * gray[bottomIndex] + gray[bottomIndex + 1]);
      const magnitude = Math.sqrt(dx * dx + dy * dy);

      const laplacian =
        gray[centerIndex - width] +
        gray[leftIndex] +
        gray[rightIndex] +
        gray[centerIndex + width] -
        4 * gray[centerIndex];

      laplacianSum += laplacian;
      laplacianSqSum += laplacian * laplacian;

      if (magnitude > edgeThreshold) {
        edgeCount += 1;
        if (Math.abs(dy) > Math.abs(dx)) {
          horizontalEdges += 1;
        } else {
          verticalEdges += 1;
        }

        if (
          x < borderSize ||
          x >= width - borderSize ||
          y < borderSize ||
          y >= height - borderSize
        ) {
          borderEdgeCount += 1;
        }
      }
    }
  }

  const laplacianMean = laplacianSum / totalPixels;
  const laplacianVariance =
    laplacianSqSum / totalPixels - laplacianMean * laplacianMean;

  return {
    edgeDensity: edgeCount / totalPixels,
    horizontalEdges,
    verticalEdges,
    borderEdgeRatio: edgeCount > 0 ? borderEdgeCount / edgeCount : 0,
    laplacianVariance: Math.max(0, laplacianVariance),
  };
}

function analyzeShadowAndContrast(imageData: ImageData) {
  const { data, width, height } = imageData;
  const tileRows = 3;
  const tileCols = 3;
  const tileWidth = Math.floor(width / tileCols);
  const tileHeight = Math.floor(height / tileRows);
  const tileMeans: number[] = [];

  const allLuminance: number[] = [];
  for (let row = 0; row < tileRows; row += 1) {
    for (let col = 0; col < tileCols; col += 1) {
      let tileSum = 0;
      let tileCount = 0;
      for (
        let y = row * tileHeight;
        y < Math.min(height, (row + 1) * tileHeight);
        y += 1
      ) {
        for (
          let x = col * tileWidth;
          x < Math.min(width, (col + 1) * tileWidth);
          x += 1
        ) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          tileSum += lum;
          tileCount += 1;
          allLuminance.push(lum);
        }
      }
      tileMeans.push(tileCount ? tileSum / tileCount : 0);
    }
  }

  const globalMean =
    allLuminance.reduce((sum, value) => sum + value, 0) /
    Math.max(1, allLuminance.length);

  return {
    globalMean,
    tileMeans,
    tileContrast: Math.max(...tileMeans) - Math.min(...tileMeans),
  };
}

export async function validateImageFileForOCR(
  file: File,
): Promise<ImageValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  const fileType = getFileType(file);
  const isPdf = fileType === "application/pdf";

  if (!isAllowedFile(file)) {
    errors.push("Unsupported format. Please upload JPG, JPEG, PNG, or PDF.");
  }

  if (file.size === 0) {
    errors.push("File is empty or corrupted.");
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push("File exceeds the maximum size of 10 MB.");
  }

  if (file.size < MIN_FILE_SIZE) {
    warnings.push("File is very small. The form may not be readable.");
    score -= 30;
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      quality_score: 0,
      metadata: { fileType, isPdf },
    };
  }

  if (isPdf) {
    warnings.push(
      "PDF validation is limited in the browser. Ensure the scanned form is clear, upright, and has legible text.",
    );
    score = Math.max(score - 20, 40);
    return {
      valid: true,
      warnings,
      errors,
      quality_score: clampScore(score),
      metadata: { fileType, isPdf },
    };
  }

  const bitmap = await createBitmapFromFile(file);
  let imageSource: HTMLImageElement | ImageBitmap;

  if (bitmap) {
    imageSource = bitmap;
  } else {
    imageSource = await loadImageElement(file);
  }

  const width =
    imageSource instanceof ImageBitmap
      ? imageSource.width
      : imageSource.naturalWidth;
  const height =
    imageSource instanceof ImageBitmap
      ? imageSource.height
      : imageSource.naturalHeight;

  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    errors.push(
      "Resolution too low. Please upload a larger image of the form.",
    );
    score -= 50;
  }

  const sampleScale = Math.min(1, 1200 / Math.max(width, height));
  const sampleWidth = Math.max(400, Math.round(width * sampleScale));
  const sampleHeight = Math.max(300, Math.round(height * sampleScale));

  const { canvas, context } = drawImageToCanvas(
    imageSource,
    sampleWidth,
    sampleHeight,
  );
  const imageData = context.getImageData(0, 0, sampleWidth, sampleHeight);
  const grayData = computeGrayscale(imageData);
  const quality = analyzeImageQuality(grayData);
  const contrast = analyzeShadowAndContrast(imageData);

  const isDark = contrast.globalMean < 60;
  const isOverexposed = contrast.globalMean > 235;
  const isLowContrast = grayData.stdDev < 30;
  const isExtremelyBlurry = quality.laplacianVariance < 70;
  const isMediumBlur = quality.laplacianVariance < 150 && !isExtremelyBlurry;
  const noTextDetected = quality.edgeDensity < 0.012;
  const documentMissing =
    quality.edgeDensity < 0.02 && contrast.globalMean > 15;
  const orientationRatio =
    quality.verticalEdges / Math.max(1, quality.horizontalEdges);
  const appearsRotated = width > height && orientationRatio > 1.5;
  const heavySkew =
    Math.abs(quality.borderEdgeRatio - 0.18) > 0.18 &&
    quality.edgeDensity > 0.03;
  const lightSkew =
    Math.abs(quality.borderEdgeRatio - 0.18) > 0.1 && !heavySkew;
  const borderCrop =
    quality.borderEdgeRatio > 0.22 && quality.edgeDensity > 0.035;
  const hasStrongShadow = contrast.tileContrast > 70;
  const hasMildShadow =
    contrast.tileContrast > 40 && contrast.tileContrast <= 70;

  if (isDark) {
    warnings.push("Image is very dark. Increase lighting or retake the photo.");
    score -= 20;
  }

  if (isOverexposed) {
    warnings.push("Image is overexposed. Avoid bright glare or reflections.");
    score -= 20;
  }

  if (isLowContrast) {
    warnings.push("Low contrast detected. Text may be hard to read.");
    score -= 15;
  }

  if (isExtremelyBlurry) {
    errors.push("Image is extremely blurry. Please retake the photo.");
    score -= 60;
  } else if (isMediumBlur) {
    warnings.push("Image is slightly blurry. OCR accuracy may be affected.");
    score -= 20;
  } else if (quality.edgeDensity < 0.04) {
    warnings.push(
      "Image has limited sharp edges. Make sure the form is in focus.",
    );
    score -= 10;
  }

  if (appearsRotated) {
    warnings.push("Rotate image upright before upload.");
    score -= 10;
  }

  if (heavySkew) {
    warnings.push(
      "Document appears heavily skewed. Try to align the phone with the form.",
    );
    score -= 20;
  } else if (lightSkew) {
    warnings.push(
      "Slight skew detected. Ensure the form is as flat as possible.",
    );
    score -= 10;
  }

  if (hasStrongShadow) {
    warnings.push("Strong shadows detected. Avoid shadows covering the form.");
    score -= 15;
  } else if (hasMildShadow) {
    warnings.push(
      "Mild shadow detected. Try to move the light source or change angle.",
    );
    score -= 8;
  }

  if (borderCrop) {
    warnings.push(
      "Document edges may be cut off. Ensure the full form is visible.",
    );
    score -= 15;
  }

  if (documentMissing) {
    errors.push("No document detected. Please upload a photo of the form.");
    score -= 50;
  }

  if (noTextDetected) {
    errors.push("No text detected. Please upload a clear image of the form.");
    score -= 50;
  }

  if (!errors.length && width >= MIN_WIDTH && height >= MIN_HEIGHT) {
    if (quality.edgeDensity < 0.03) {
      warnings.push(
        "Form edges are faint. Make sure the document is clearly visible.",
      );
      score -= 10;
    }
  }

  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    errors.push("Image resolution is too small for reliable OCR.");
  }

  if (
    imageSource instanceof ImageBitmap &&
    typeof imageSource.close === "function"
  ) {
    imageSource.close();
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    quality_score: clampScore(score),
    metadata: {
      width,
      height,
      fileType,
      isPdf,
    },
  };
}
