import { BoothProvider, useBooth } from './context/BoothContext.jsx';
import Marquee from './components/layout/Marquee.jsx';
import Footer from './components/layout/Footer.jsx';
import UserBadge from './components/layout/UserBadge.jsx';
import HomeScreen from './components/home/HomeScreen.jsx';
import DuoSetupScreen from './components/duo/DuoSetupScreen.jsx';
import StageScreen from './components/stage/StageScreen.jsx';
import DevelopingScreen from './components/result/DevelopingScreen.jsx';
import ResultScreen from './components/result/ResultScreen.jsx';

function ActiveScreen() {
  const { screen } = useBooth();
  switch (screen) {
    case 'duo-setup': return <DuoSetupScreen />;
    case 'stage': return <StageScreen />;
    case 'developing': return <DevelopingScreen />;
    case 'result': return <ResultScreen />;
    case 'home':
    default: return <HomeScreen />;
  }
}

function BoothLayout() {
  const { workCanvasRef, stripCanvasRef, flashRef } = useBooth();

  return (
    <>
      <div className="flash" ref={flashRef}></div>
      <div className="wrap">
        <UserBadge />
        <Marquee />
        <ActiveScreen />
        <Footer />
      </div>
      <canvas ref={workCanvasRef} style={{ display: 'none' }}></canvas>
      <canvas ref={stripCanvasRef} style={{ display: 'none' }}></canvas>
    </>
  );
}

export default function BoothApp() {
  return (
    <BoothProvider>
      <BoothLayout />
    </BoothProvider>
  );
}
