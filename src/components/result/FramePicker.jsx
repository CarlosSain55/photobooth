import { useBooth } from '../../context/BoothContext.jsx';

export default function FramePicker() {
  const { FRAMES, selectedFrame, selectFrame } = useBooth();

  return (
    <div className="picker-block">
      <div className="picker-label">choose a frame</div>
      <div className="picker-row">
        {FRAMES.map((fr) => (
          <button
            key={fr.id}
            className={'frame-swatch' + (fr.id === selectedFrame ? ' active' : '')}
            onClick={() => selectFrame(fr.id)}
            type="button"
          >
            <span className="frame-swatch-box" style={{ background: fr.paper, border: `2px solid ${fr.border}` }}></span>
            <span className="swatch-label">{fr.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
