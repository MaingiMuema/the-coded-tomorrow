import './App.css';
import HeroSection from './components/HeroSection';
import StorySection from './components/StorySection';
import EarthquakeSection from './components/EarthquakeSection';
import DestinySection from './components/DestinySection';

function App() {
  return (
    <div className="App">
      <HeroSection />
      <StorySection />
      <EarthquakeSection />
      <DestinySection />
      <section style={{ height: '100vh', background: '#0a0e27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <h2>Continue Your Journey...</h2>
      </section>
    </div>
  );
}

export default App;
