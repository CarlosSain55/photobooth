import { useBooth } from '../../context/BoothContext.jsx';

export default function DuoSetupScreen() {
  const {
    setScreen, duoTab, setDuoTab, sessionCode, copyRoomLink,
    joinCodeValue, setJoinCodeValue, joinRoom, status, cameraError,
  } = useBooth();

  const statusText = cameraError
    ? 'the lens is shy — camera access was not granted. allow camera access and reload.'
    : status.text;
  const statusKind = cameraError ? 'err' : status.kind;

  return (
    <section className="screen active" id="screen-duo-setup">
      <button type="button" className="back-link" onClick={() => setScreen('home')}>← back to the entrance</button>
      <div className="setup-panel">
        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={duoTab === 'create'}
            className={'tab' + (duoTab === 'create' ? ' active' : '')}
            onClick={() => setDuoTab('create')}
          >
            Open a Room
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={duoTab === 'join'}
            className={'tab' + (duoTab === 'join' ? ' active' : '')}
            onClick={() => setDuoTab('join')}
          >
            Join with a Code
          </button>
        </div>

        {duoTab === 'create' ? (
          <div>
            <div className="ticket">
              <div className="label">your room code</div>
              <div className="code-display">{sessionCode || '— — — —'}</div>
            </div>
            <div className="btn-row">
              <button className="btn" onClick={copyRoomLink}>Copy invite link</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="ticket">
              <div className="label">enter the room code</div>
              <input
                className="code-input mono"
                placeholder="e.g. AMBR-482"
                maxLength={12}
                value={joinCodeValue}
                onChange={(e) => setJoinCodeValue(e.target.value)}
              />
            </div>
            <div className="btn-row">
              <button className="btn" onClick={joinRoom}>Ring the booth</button>
            </div>
          </div>
        )}

        <div className={'status-line' + (statusKind ? ' ' + statusKind : '')}>{statusText}</div>
      </div>
    </section>
  );
}
