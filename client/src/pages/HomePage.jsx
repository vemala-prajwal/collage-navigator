import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Hero from '../components/Hero';
import MarqueeStrip from '../components/home/MarqueeStrip';
import ProcessSection from '../components/home/ProcessSection';
import FeatureGrid from '../components/home/FeatureGrid';
import StatsSection from '../components/home/StatsSection';
import ShowcaseSection from '../components/home/ShowcaseSection';
import FaqSection from '../components/home/FaqSection';
import CtaSection from '../components/home/CtaSection';

export default function HomePage() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations');
        setLocations(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLocations();
  }, []);

  const marqueeData = useMemo(() => {
    const buildings = new Set(locations.map((l) => l.building).filter(Boolean));
    const types = new Set(locations.map((l) => l.type).filter(Boolean));
    const labs = [...types].filter((t) => /lab/i.test(t)).length;

    return {
      items: [...buildings, ...types].filter(Boolean),
      stats: {
        buildings: buildings.size || 12,
        labs: labs || 8,
        departments: types.size || 15,
      },
    };
  }, [locations]);

  const locationCount = locations.length > 0 ? locations.length : 50;

  return (
    <div>
      <Hero />
      <MarqueeStrip items={marqueeData.items} stats={marqueeData.stats} />
      <ProcessSection />
      <FeatureGrid />
      <StatsSection locationCount={locationCount} />
      <ShowcaseSection locations={locations} />
      <CtaSection />
      <FaqSection />
    </div>
  );
}
