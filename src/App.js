import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { csvParse } from 'd3-dsv';
import * as THREE from 'three';
import { FontLoader } from 'three-stdlib';
import { TextGeometry } from 'three-stdlib';
import Loader from './Loader';
import './Loader.css';

function App() {
  const [pointsData, setPointsData] = useState([]);
  const globeRef = useRef();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/world_population.csv')
      .then(res => res.text())
      .then(csvText => {
        const data = csvParse(csvText, ({ lat, lng, pop }) => ({
          lat: +lat,
          lng: +lng,
          size: +pop,
          color: getColor(+pop)
        }));
        setPointsData(data);
      });
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const handleGlobeReady = () => {
    const globe = globeRef.current;
    if (!globe) return;

    const scene = globe.scene();

    // Remove default lights
    scene.children = scene.children.filter(obj => !obj.isLight);

    // Lights
    scene.add(new THREE.AmbientLight(0x888888));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Glow
    const glowTexture = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/glow.png'
    );
    const spriteMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x7851A9,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(20, 20, 1);
    scene.add(sprite);

    // Done loading
    setTimeout(() => setIsLoading(false), 1500);
  };

  const getColor = (pop) => {
    if (pop > 1e7) return '#7851A9';  // purple
    if (pop > 1e6) return '#FF0000';  // red
    if (pop > 1e5) return '#FFD700';  // gold
    return '#12db00';                // green
  };

  const getHeight = (pop) => {
    if (pop > 1e7) return Math.cbrt(pop) * 0.004;
    if (pop > 1e6) return Math.cbrt(pop) * 0.0015;
    if (pop > 1e5) return Math.cbrt(pop) * 0.0011;
    return Math.cbrt(pop) * 0.0009;
  };

  return (
    <>
      {isLoading && <Loader />}

      {/* Globe Visualization */}
      <div style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: -1 }}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={pointsData}
          pointLat={d => d.lat}
          pointLng={d => d.lng}
          pointAltitude={d => getHeight(d.size)}
          pointColor={d => d.color}
          pointRadius={0.2}
          atmosphereColor="#7851A9"
          atmosphereAltitude={0.3}
          onGlobeReady={handleGlobeReady}
          onPointClick={d =>
            alert(`Population: ${d.size.toLocaleString()}\nLat: ${d.lat}, Lng: ${d.lng}`)
          }
        />
      </div>
    </>
  );
}

export default App;
