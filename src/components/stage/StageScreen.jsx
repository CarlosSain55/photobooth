import { useBooth } from '../../context/BoothContext.jsx';
import FilterPicker from './FilterPicker.jsx';
import FilmstripRail from './FilmstripRail.jsx';

export default function StageScreen() {
  const {
    mode, videoLocalRef, videoRemoteRef, countdown, sessionCaption,
    beginSession, capturing, resetAll, remoteStream, FILTERS, selectedFilter, startEnabled,
  } = useBooth();

  const filterCss = (FILTERS.find((f) => f.id === selectedFilter) || {}).css || 'none';
  const isDuo = mode === 'duo';

  return (
    <section className="screen active" id="screen-stage">
      <button type="button" className="back-link" onClick={resetAll}>← leave the booth</button>
      <div className={'stage-layout' + (isDuo ? ' duo' : '')}>
        <div className="camera-block">
          <div className="oval-pair">
            <div className="oval local">
              <video ref={videoLocalRef} autoPlay playsInline muted style={{ filter: filterCss }}></video>
              {countdown.visible && (
                <div className="countdown-overlay">
                  <span className="num">{countdown.num}</span>
                </div>
              )}
            </div>
            {isDuo && (
              <>
                <div className="hinge"></div>
                <div className="oval remote">
                  <video ref={videoRemoteRef} autoPlay playsInline style={{ filter: filterCss }}></video>
                  {!remoteStream && <div className="placeholder">waiting for the other booth…</div>}
                </div>
              </>
            )}
          </div>
          <FilterPicker />
          <div className="session-caption">{sessionCaption}</div>
          <div className="btn-row">
            <button className="btn" onClick={beginSession} disabled={!startEnabled || capturing}>Start Session</button>
          </div>
        </div>

        <FilmstripRail />
      </div>
    </section>
  );
}
