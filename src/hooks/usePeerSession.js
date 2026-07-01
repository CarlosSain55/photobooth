import { useCallback, useRef, useState } from 'react';
import Peer from 'peerjs';
import { generateCode } from '../lib/roomCode.js';

/**
 * Wraps the PeerJS host/join/data-channel plumbing from the original duo flow.
 * `peer`/`dataConn`/`mediaCall` are imperative objects kept in refs (not state)
 * since they don't need to trigger re-renders themselves — only the derived
 * status text/kind and the remote stream do.
 */
export function usePeerSession({ onBegin, onConnected }) {
  const peerRef = useRef(null);
  const dataConnRef = useRef(null);
  const mediaCallRef = useRef(null);
  const duoRoleRef = useRef(null);
  const sessionCodeRef = useRef('');

  const [status, setStatus] = useState({ text: 'standby — allow camera access to begin', kind: '' });
  const [remoteStream, setRemoteStream] = useState(null);
  const [sessionCode, setSessionCode] = useState('');

  const setStatusText = useCallback((text, kind = '') => setStatus({ text, kind }), []);

  const wireDataConn = useCallback(() => {
    dataConnRef.current.on('data', (msg) => {
      if (msg && msg.type === 'begin') {
        onBegin?.(msg.startAt);
      }
    });
  }, [onBegin]);

  const teardown = useCallback(() => {
    if (dataConnRef.current) { try { dataConnRef.current.close(); } catch (e) {} dataConnRef.current = null; }
    if (mediaCallRef.current) { try { mediaCallRef.current.close(); } catch (e) {} mediaCallRef.current = null; }
    if (peerRef.current) { try { peerRef.current.destroy(); } catch (e) {} peerRef.current = null; }
    duoRoleRef.current = null;
    setRemoteStream(null);
  }, []);

  const startHost = useCallback((localStream) => {
    duoRoleRef.current = 'host';
    const code = generateCode();
    sessionCodeRef.current = code;
    setSessionCode(code);
    setStatusText('opening the room…');

    const peer = new Peer(code.replace('-', ''), { debug: 0 });
    peerRef.current = peer;

    peer.on('open', () => {
      setStatusText('room is open — share the code, waiting for someone to ring in…');
    });

    peer.on('call', (call) => {
      call.answer(localStream);
      mediaCallRef.current = call;
      call.on('stream', (stream) => {
        setRemoteStream(stream);
        setStatusText('connected — say hello', 'live');
        onConnected?.();
      });
      call.on('close', () => setStatusText('the other side stepped away', 'err'));
      call.on('error', () => setStatusText('the call dropped — try again', 'err'));
    });

    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      wireDataConn();
    });

    peer.on('error', (err) => {
      setStatusText('could not open a room right now (' + err.type + ') — try again', 'err');
    });
  }, [onConnected, setStatusText, wireDataConn]);

  const joinRoom = useCallback((rawCode, localStream) => {
    const raw = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!raw) { setStatusText('enter a room code first', 'err'); return; }
    duoRoleRef.current = 'guest';
    sessionCodeRef.current = raw;
    setSessionCode(raw);
    setStatusText('ringing the booth…');

    const peer = new Peer(undefined, { debug: 0 });
    peerRef.current = peer;

    peer.on('open', () => {
      const call = peer.call(raw, localStream);
      mediaCallRef.current = call;
      call.on('stream', (stream) => {
        setRemoteStream(stream);
        setStatusText('connected — say hello', 'live');
        onConnected?.();
      });
      call.on('close', () => setStatusText('the other side stepped away', 'err'));
      call.on('error', () => setStatusText('the call dropped — try again', 'err'));

      dataConnRef.current = peer.connect(raw);
      wireDataConn();
    });

    peer.on('error', (err) => {
      if (err.type === 'peer-unavailable') {
        setStatusText('no room found with that code', 'err');
      } else {
        setStatusText('connection trouble (' + err.type + ') — try again', 'err');
      }
    });
  }, [onConnected, setStatusText, wireDataConn]);

  const sendBegin = useCallback((startAt) => {
    if (dataConnRef.current && dataConnRef.current.open) {
      dataConnRef.current.send({ type: 'begin', startAt });
    }
  }, []);

  return {
    duoRoleRef,
    sessionCode,
    status,
    remoteStream,
    startHost,
    joinRoom,
    teardown,
    sendBegin,
    setStatusText,
  };
}
