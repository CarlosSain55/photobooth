import { useBooth } from '../../context/BoothContext.jsx';

export default function FilmstripRail() {
  const { shots, TILTS } = useBooth();

  return (
    <div className="filmstrip-rail">
      <div className="clothespin">
        <svg viewBox="0 0 34 20"><rect x="12" y="0" width="10" height="20" rx="2" fill="#E8391F" /><circle cx="17" cy="5" r="3" fill="#14181C" /></svg>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className={'frame-slot' + (shots[i] ? ' filled' : '')} style={shots[i] ? { transform: `rotate(${TILTS[i] || '0deg'})` } : undefined}>
          {shots[i] ? (
            <img src={shots[i]} alt={`frame ${i + 1}`} />
          ) : (
            <span className="empty-mark">{i + 1}</span>
          )}
        </div>
      ))}
    </div>
  );
}
