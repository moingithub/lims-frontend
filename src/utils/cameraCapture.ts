export async function capturePhotoFileFromVideo(
  video: HTMLVideoElement,
  filenamePrefix = "sample-tag",
): Promise<File> {
  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    throw new Error("Camera is not ready. Please wait a moment and try again.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not capture photo from camera.");
  }

  context.drawImage(video, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("Could not capture photo from camera."));
      },
      "image/jpeg",
      0.92,
    );
  });

  return new File([blob], `${filenamePrefix}-${Date.now()}.jpg`, {
    type: "image/jpeg",
  });
}

export function stopMediaStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export async function requestCameraStream(): Promise<MediaStream> {
  const isSecureContext =
    window.isSecureContext ||
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  if (!isSecureContext) {
    throw new Error(
      "Camera access requires a secure HTTPS connection. Please use HTTPS or localhost, or choose Upload Image instead.",
    );
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "Camera is not supported in this browser. Use Upload Image instead.",
    );
  }

  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });
}
