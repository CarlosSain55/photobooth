import { useBooth } from '../../context/BoothContext.jsx';

function activateOnKey(handler) {
  return (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
}

export default function HomeScreen() {
  const { chooseMode } = useBooth();

  return (
    <section className="screen active" id="screen-home">
      <div className="mode-grid">
        <div
          className="mode-card"
          role="button"
          tabIndex={0}
          onClick={() => chooseMode('solo')}
          onKeyDown={activateOnKey(() => chooseMode('solo'))}
        >
          <div className="num">I</div>
          <h2>Solo</h2>
          <p>Step in alone. Three exposures, one strip, developed right in your browser.</p>
        </div>
        <div
          className="mode-card"
          role="button"
          tabIndex={0}
          onClick={() => chooseMode('duo')}
          onKeyDown={activateOnKey(() => chooseMode('duo'))}
        >
          <div className="num">II</div>
          <h2>Duo</h2>
          <p>Open the booth from two places at once. Ring each other in, sit for the same three frames, together.</p>
        </div>
      </div>
    </section>
  );
}
