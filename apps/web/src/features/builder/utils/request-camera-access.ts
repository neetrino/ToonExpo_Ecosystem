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
