import { useRef, useState, useCallback } from 'react';

/** Wraps getUserMedia lifecycle — one shared stream for the whole session. */
export function useLocalCamera() {
  const streamRef = useRef(null);
  const [error, setError] = useState(null);

  const start = useCallback(async (withAudio) => {
    if (streamRef.current) return streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: !!withAudio,
      });
      streamRef.current = stream;
      setError(null);
      return stream;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  return { streamRef, start, stop, error };
}
