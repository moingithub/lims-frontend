import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Camera, Loader2 } from "lucide-react";
import {
  capturePhotoFileFromVideo,
  requestCameraStream,
  stopMediaStream,
} from "../../utils/cameraCapture";

interface TagCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
}

export function TagCameraDialog({
  open,
  onOpenChange,
  onCapture,
}: TagCameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    stopCamera();

    try {
      const stream = await requestCameraStream();
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stopMediaStream(stream);
        throw new Error("Camera preview is not available.");
      }

      video.srcObject = stream;
      await video.play();
    } catch (cameraError) {
      const message =
        cameraError instanceof Error
          ? cameraError.message
          : "Could not access camera.";
      setError(message);
      stopCamera();
    } finally {
      setIsStarting(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setError(null);
      setIsCapturing(false);
      return;
    }

    void startCamera();

    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || error) {
      return;
    }

    setIsCapturing(true);
    try {
      const file = await capturePhotoFileFromVideo(video);
      stopCamera();
      onOpenChange(false);
      onCapture(file);
    } catch (captureError) {
      setError(
        captureError instanceof Error
          ? captureError.message
          : "Failed to capture photo.",
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      stopCamera();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Take Sample Tag Photo</DialogTitle>
          <DialogDescription>
            Position the sample tag in the frame, then capture the photo for OCR.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-md border bg-black min-h-[240px] flex items-center justify-center">
            {isStarting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            {error ? (
              <p className="px-4 text-center text-sm text-destructive">
                {error}
              </p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-[360px] w-full object-contain"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCapturing}
            >
              Cancel
            </Button>
            {error ? (
              <Button type="button" onClick={() => void startCamera()}>
                Retry
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => void handleCapture()}
                disabled={isStarting || isCapturing || Boolean(error)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Camera className="mr-2 h-4 w-4" />
                {isCapturing ? "Capturing..." : "Capture Photo"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
