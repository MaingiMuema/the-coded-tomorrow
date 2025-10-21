import './App.css';
import HeroSection from './components/HeroSection';
import StorySection from './components/StorySection';
import EarthquakeSection from './components/EarthquakeSection';
import DestinySection from './components/DestinySection';
import CreatorSection from './components/CreatorSection';
import CultureSection from './components/CultureSection';

function App() {
  return (
    <div className="App">
      <HeroSection />
      <StorySection />
      <EarthquakeSection />
      <CultureSection />
      <CreatorSection />
      {/*<DestinySection />*/}
    </div>
  );
}

export default App;
