import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { csvParse } from 'd3-dsv';
import * as THREE from 'three';
import TextPressure from './TextPressure'; // ✅ Make sure this file exists in /src

function App() {
  const [pointsData, setPointsData] = useState([]);
  const globeRef = useRef();

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
      globeRef.current.controls().autoRotateSpeed = 4.7;
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
  };

  const getColor = (pop) => {
    if (pop > 1e7) return '#7851A9';
    if (pop > 1e6) return '#FF0000';
    if (pop > 1e5) return '#FFD700';
    return '#12db00';
  };

  const getHeight = (pop) => {
    if (pop > 1e7) return Math.cbrt(pop) * 0.004;
    if (pop > 1e6) return Math.cbrt(pop) * 0.0015;
    if (pop > 1e5) return Math.cbrt(pop) * 0.0011;
    return Math.cbrt(pop) * 0.0009;
  };

  return (
    <div style={{ position: 'fixed', width: '100vw', height: '100vh' }}>
      {/* ✅ Welcome TextPressure Animation */}
      <div style={{
        position: 'absolute',
        top: '30%',
        width: '100%',
        height: '300px',
        zIndex: 10
      }}>
        <TextPressure
          text="Welcome!"
          flex={true}
          alpha={false}
          stroke={false}
          width={true}
          weight={true}
          italic={true}
          textColor="#ffffff"
          strokeColor="#ff0000"
          minFontSize={36}
        />
      </div>

      {/* ✅ 3D Globe */}
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
  );
}

export default App;
