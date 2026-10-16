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

/**
 * Starts the permission prompt from the scan click, before the sheet mounts.
 */
export const primeCameraAccess = (): void => {
  primedAccess = requestCameraAccess();
};

/** Takes the in-flight request started by the scan click. */
export const consumePrimedCameraAccess = (): Promise<CameraAccessResult> | null => {
  const pending = primedAccess;
  primedAccess = null;
  return pending;
};

/** `granted` when the user already allowed the camera for this site. */
export const readCameraPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'prompt';
  }
  try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
    if (status.state === 'granted' || status.state === 'denied') {
      return status.state;
    }
    return 'prompt';
  } catch {
    return 'prompt';
  }
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
