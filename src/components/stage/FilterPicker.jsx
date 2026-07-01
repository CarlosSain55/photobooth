import { useBooth } from '../../context/BoothContext.jsx';

export default function FilterPicker() {
  const { FILTERS, selectedFilter, selectFilter } = useBooth();

  return (
    <div className="picker-block">
      <div className="picker-label">choose a mood</div>
      <div className="picker-row">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={'filter-swatch' + (f.id === selectedFilter ? ' active' : '')}
            onClick={() => selectFilter(f.id)}
            type="button"
          >
            <span className="swatch-preview" style={{ filter: f.css }}></span>
            <span className="swatch-label">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
