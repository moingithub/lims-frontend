import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { authService } from "../services/authService";

/**
 * Turn a stored upload reference into a request URL.
 *
 * DB values from ocr_ai look like: /api/uploads/ocr/<filename>
 * Backend serves files at:        {API origin}/api/uploads/ocr/<filename>
 * GET requires Authorization: Bearer <token> — use fetchAuthenticatedUploadAsset
 * (or useAuthenticatedUploadUrl) instead of a bare <img src>.
 *
 * In dev, VITE_API_BASE_URL=/api so a relative /api/... path is proxied by Vite.
 * In production, VITE_API_BASE_URL is the full backend URL — requests must be absolute.
 */
export function resolveUploadAssetUrl(
  storedPath: string | null | undefined,
  filename?: string | null,
): string {
  let path = storedPath?.trim() ?? "";

  if (
    path &&
    !path.startsWith("http://") &&
    !path.startsWith("https://") &&
    !path.startsWith("/")
  ) {
    const lastSlash = Math.max(path.lastIndexOf("\\"), path.lastIndexOf("/"));
    if (lastSlash >= 0) {
      const uploadDir = path.substring(0, lastSlash);
      const file = path.substring(lastSlash + 1);
      if (uploadDir.includes("uploads")) {
        const uploadsIndex = uploadDir.lastIndexOf("uploads");
        path = `/api/${uploadDir.substring(uploadsIndex)}/${file}`;
      }
    }
  }

  if (!path && filename) {
    path = `/api/uploads/ocr/${filename}`;
  }

  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path.startsWith("/uploads/")) {
    path = `/api${path}`;
  }

  const apiBase = API_BASE_URL.replace(/\/$/, "");

  if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
    const origin = apiBase.replace(/\/api$/, "");
    return `${origin}${path}`;
  }

  return path;
}

/**
 * Fetch an OCR upload with auth and return a blob URL for <img src>.
 */
export async function fetchAuthenticatedUploadAsset(
  storedPath: string | null | undefined,
  filename?: string | null,
): Promise<string> {
  const url = resolveUploadAssetUrl(storedPath, filename);
  if (!url) {
    return "";
  }

  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  const token = authService.getAuthState().token;
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to load upload asset (${response.status})`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Load a protected OCR upload for display; revokes blob URLs on change/unmount.
 */
export function useAuthenticatedUploadUrl(
  storedPath: string | null | undefined,
  filename?: string | null,
  enabled = true,
) {
  const [objectUrl, setObjectUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const revokeBlob = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    if (!enabled || (!storedPath?.trim() && !filename?.trim())) {
      revokeBlob();
      setObjectUrl("");
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchAuthenticatedUploadAsset(storedPath, filename)
      .then((url) => {
        if (cancelled) {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
          return;
        }
        revokeBlob();
        if (url.startsWith("blob:")) {
          blobUrlRef.current = url;
        }
        setObjectUrl(url);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          revokeBlob();
          setObjectUrl("");
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      revokeBlob();
    };
  }, [storedPath, filename, enabled]);

  return { objectUrl, loading, error };
}
