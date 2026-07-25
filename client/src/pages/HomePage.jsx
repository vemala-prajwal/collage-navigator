import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Hero from '../components/Hero';
import MarqueeStrip from '../components/home/MarqueeStrip';
import ProcessSection from '../components/home/ProcessSection';
import FeatureGrid from '../components/home/FeatureGrid';
import ShowcaseSection from '../components/home/ShowcaseSection';
import FaqSection from '../components/home/FaqSection';

export default function HomePage() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations');
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.locations)
          ? data.locations
          : [];
        setLocations(list);
      } catch (error) {
        console.error(error);
        setLocations([]);
      }
    };

    fetchLocations();
    const subscription = api.subscribe('locations', () => {
      fetchLocations();
    });

    return () => subscription.unsubscribe();
  }, []);

  const marqueeData = useMemo(() => {
    const safeLocations = Array.isArray(locations) ? locations : [];
    const buildings = new Set(safeLocations.map((l) => l?.building).filter(Boolean));
    const types = new Set(safeLocations.map((l) => l?.type).filter(Boolean));
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

  return (
    <div>
      <Hero />
      <MarqueeStrip items={marqueeData.items} stats={marqueeData.stats} />
      <ProcessSection />
      <FeatureGrid />
      <ShowcaseSection locations={locations} />
      <FaqSection />
    </div>
  );
}
