import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { FILTERS } from '../lib/filters.js';
import { FRAMES } from '../lib/frames.js';
import { captureComposite, assembleStrip, SHOTS_NEEDED } from '../lib/compositor.js';
import { useLocalCamera } from '../hooks/useLocalCamera.js';
import { usePeerSession } from '../hooks/usePeerSession.js';

const TILTS = ['-2.4deg', '1.6deg', '-1.1deg'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BoothContext = createContext(null);

// NOTE: handlers below are plain functions (recreated every render) rather
// than useCallback-wrapped. Nothing downstream needs referential stability
// (no memoized children), and these handlers form a chain of dependencies
// on each other (chooseMode -> setDuoTab -> peer.startHost -> ... ), so
// useCallback with partial dep arrays would risk freezing stale closures.
export function BoothProvider({ children }) {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState(null);
  const [duoTab, setDuoTabState] = useState('create');
  const [joinCodeValue, setJoinCodeValue] = useState('');
  const [shots, setShots] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [selectedFrame, setSelectedFrame] = useState('brass');
  const [resultImage, setResultImage] = useState(null);
  const [countdown, setCountdown] = useState({ visible: false, num: 3 });
  const [sessionCaption, setSessionCaption] = useState("press start when you're ready");
  const [startEnabled, setStartEnabled] = useState(false);

  const videoLocalRef = useRef(null);
  const videoRemoteRef = useRef(null);
  const workCanvasRef = useRef(null);
  const stripCanvasRef = useRef(null);
  const flashRef = useRef(null);

  const { streamRef: localStreamRef, start: startLocalCamera, error: cameraError } = useLocalCamera();

  function proceedToStage() {
    setScreen('stage');
    setSessionCaption("when you're both ready, either of you can start");
    setStartEnabled(true);
  }

  const peer = usePeerSession({
    onBegin: (startAt) => runCountdownTo(startAt),
    onConnected: proceedToStage,
  });

  // Keep the <video> elements' srcObject in sync with the streams.
  // `startEnabled` is included because getUserMedia resolves asynchronously,
  // after the screen has already switched to 'stage' — without it, this
  // effect fires while localStreamRef.current is still null and never
  // re-runs once the stream actually arrives.
  useEffect(() => {
    if (videoLocalRef.current && localStreamRef.current) {
      videoLocalRef.current.srcObject = localStreamRef.current;
    }
  }, [screen, mode, startEnabled]);

  useEffect(() => {
    if (videoRemoteRef.current) {
      videoRemoteRef.current.srcObject = peer.remoteStream || null;
    }
  }, [peer.remoteStream]);

  async function chooseMode(m) {
    setMode(m);
    setShots([]);
    setResultImage(null);
    setStartEnabled(false);
    if (m === 'solo') {
      setScreen('stage');
      try {
        await startLocalCamera(false);
        setSessionCaption("press start when you're ready");
        setStartEnabled(true);
      } catch (err) {
        setSessionCaption('the lens is shy — camera access was not granted. allow camera access and reload.');
      }
    } else {
      setScreen('duo-setup');
      try {
        await startLocalCamera(true);
        const params = new URLSearchParams(location.search);
        setDuoTab(params.get('join') ? 'join' : 'create');
      } catch (err) {
        // surfaced via cameraError on the duo-setup status line
      }
    }
  }

  function setDuoTab(which) {
    setDuoTabState(which);
    if (which === 'join') {
      const params = new URLSearchParams(location.search);
      const j = params.get('join');
      if (j) setJoinCodeValue(j.toUpperCase());
      if (peer.duoRoleRef.current === 'host' && !peer.remoteStream) {
        peer.teardown();
      }
    } else {
      if (peer.duoRoleRef.current !== 'host') {
        peer.teardown();
        peer.startHost(localStreamRef.current);
      }
    }
  }

  function joinRoom() {
    peer.joinRoom(joinCodeValue, localStreamRef.current);
  }

  function copyRoomLink() {
    const url = location.origin + location.pathname + '?join=' + encodeURIComponent(peer.sessionCode.replace('-', ''));
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => peer.setStatusText('link copied — send it to the other booth'))
        .catch(() => peer.setStatusText('room code: ' + peer.sessionCode));
    } else {
      peer.setStatusText('room code: ' + peer.sessionCode);
    }
  }

  function selectFilter(id) {
    setSelectedFilter(id);
  }

  function selectFrame(id) {
    setSelectedFrame(id);
  }

  function doFlash() {
    const f = flashRef.current;
    if (!f) return;
    f.classList.remove('go');
    void f.offsetWidth;
    f.classList.add('go');
  }

  async function runShotSequence() {
    const filterCss = (FILTERS.find((f) => f.id === selectedFilter) || {}).css || 'none';
    const collected = [];
    for (let i = 0; i < SHOTS_NEEDED; i++) {
      await sleep(i === 0 ? 250 : 1300);
      doFlash();
      const dataUrl = captureComposite({
        mode,
        videoLocal: videoLocalRef.current,
        videoRemote: videoRemoteRef.current,
        workCanvas: workCanvasRef.current,
        filterCss,
      });
      collected.push(dataUrl);
      setShots([...collected]);
    }
    setCapturing(false);
    setSessionCaption('developing…');
    await sleep(600);
    setScreen('developing');
    await sleep(1100);
    const frame = FRAMES.find((f) => f.id === selectedFrame) || FRAMES[0];
    const dataUrl = await assembleStrip({
      shots: collected,
      frame,
      mode,
      sessionCode: peer.sessionCode,
      stripCanvas: stripCanvasRef.current,
    });
    setResultImage(dataUrl);
    setScreen('result');
  }

  function runCountdownTo(startAt) {
    setCountdown({ visible: true, num: 3 });
    setSessionCaption('get ready…');

    const tick = () => {
      const remaining = startAt - Date.now();
      const secs = Math.ceil(remaining / 1000);
      if (remaining <= 0) {
        setCountdown({ visible: false, num: 3 });
        runShotSequence();
        return;
      }
      setCountdown({ visible: true, num: secs > 0 ? secs : '•' });
      requestAnimationFrame(tick);
    };
    tick();
  }

  function beginSession() {
    if (capturing) return;
    setCapturing(true);
    setShots([]);
    setResultImage(null);

    const startAt = Date.now() + 1800;
    if (mode === 'duo') {
      peer.sendBegin(startAt);
    }
    runCountdownTo(startAt);
  }

  // Re-render the strip whenever the chosen frame changes on the result screen.
  const skipFirstFrameEffect = useRef(true);
  useEffect(() => {
    if (skipFirstFrameEffect.current) {
      skipFirstFrameEffect.current = false;
      return;
    }
    if (!resultImage) return;
    const frame = FRAMES.find((f) => f.id === selectedFrame) || FRAMES[0];
    assembleStrip({ shots, frame, mode, sessionCode: peer.sessionCode, stripCanvas: stripCanvasRef.current })
      .then(setResultImage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFrame]);

  function downloadStrip() {
    const canvas = stripCanvasRef.current;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'pix55-strip-' + Date.now() + '.png';
    a.click();
  }

  function resetAll() {
    setShots([]);
    setCapturing(false);
    setResultImage(null);
    setStartEnabled(false);
    peer.teardown();
    setMode(null);
    setScreen('home');
  }

  const value = {
    screen, setScreen, mode, duoTab, joinCodeValue, setJoinCodeValue,
    shots, capturing, selectedFilter, selectedFrame, resultImage, countdown, sessionCaption, startEnabled,
    videoLocalRef, videoRemoteRef, workCanvasRef, stripCanvasRef, flashRef,
    cameraError, status: peer.status, remoteStream: peer.remoteStream, sessionCode: peer.sessionCode,
    duoRoleRef: peer.duoRoleRef,
    chooseMode, setDuoTab, joinRoom, copyRoomLink, selectFilter, selectFrame,
    beginSession, downloadStrip, resetAll,
    TILTS, FILTERS, FRAMES,
  };

  return <BoothContext.Provider value={value}>{children}</BoothContext.Provider>;
}

export function useBooth() {
  const ctx = useContext(BoothContext);
  if (!ctx) throw new Error('useBooth must be used within BoothProvider');
  return ctx;
}
