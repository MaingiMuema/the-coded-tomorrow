import { useState } from 'react';
import './App.css';
import LoadingScreen from './components/LoadingScreen';
import HeroSection from './components/HeroSection';
import StorySection from './components/StorySection';
import EarthquakeSection from './components/EarthquakeSection';
import DestinySection from './components/DestinySection';
import CreatorSection from './components/CreatorSection';
import CultureSection from './components/CultureSection';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}
      <div className="App" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s' }}>
        <HeroSection />
        <StorySection />
        <EarthquakeSection />
        <CultureSection />
        <CreatorSection />
        {/*<DestinySection />*/}
      </div>
    </>
  );
}

export default App;
