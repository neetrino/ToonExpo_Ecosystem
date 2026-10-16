export type CameraAccessResult =
  { status: 'granted' } | { status: 'denied' } | { status: 'unavailable' };

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: { ideal: 'environment' } },
};

const stopTracks = (stream: MediaStream): void => {
  for (const track of stream.getTracks()) {
    track.stop();
  }
};

let primedAccess: Promise<CameraAccessResult> | null = null;

/** Takes the in-flight request started by the scan click. */
export const consumePrimedCameraAccess = (): Promise<CameraAccessResult> | null => {
  const pending = primedAccess;
  primedAccess = null;
  return pending;
};

export type CameraPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

/** `granted` when the user already allowed the camera for this site. */
export const readCameraPermission = async (): Promise<CameraPermissionState> => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unknown';
  }
  try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
    if (status.state === 'granted' || status.state === 'denied' || status.state === 'prompt') {
      return status.state;
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Starts the permission prompt from the scan click, before the sheet mounts.
 * An already-granted camera is not opened here — the scanner opens it once.
 */
export const primeCameraAccess = (): void => {
  primedAccess = (async () => {
    const state = await readCameraPermission();
    if (state === 'denied') {
      return { status: 'denied' };
    }
    if (state === 'prompt') {
      return requestCameraAccess();
    }
    return { status: 'granted' };
  })();
};

/**
 * Requests camera permission. Call only from a user gesture so the browser
 * can show the system permission prompt.
 */
export const requestCameraAccess = async (): Promise<CameraAccessResult> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { status: 'unavailable' };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
    stopTracks(stream);
    return { status: 'granted' };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return { status: 'denied' };
    }
    if (error instanceof DOMException && error.name === 'PermissionDeniedError') {
      return { status: 'denied' };
    }
    return { status: 'unavailable' };
  }
};
