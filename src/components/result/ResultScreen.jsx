import { useBooth } from '../../context/BoothContext.jsx';
import FramePicker from './FramePicker.jsx';

export default function ResultScreen() {
  const { resultImage, downloadStrip, resetAll } = useBooth();

  return (
    <section className="screen active" id="screen-result">
      <div className="result-wrap">
        <div id="resultCanvasHolder">
          {resultImage && <img src={resultImage} alt="your photo strip" />}
        </div>
        <FramePicker />
        <div className="btn-row">
          <button className="btn" onClick={downloadStrip}>Download strip</button>
          <button className="btn ghost" onClick={resetAll}>New session</button>
        </div>
      </div>
    </section>
  );
}
