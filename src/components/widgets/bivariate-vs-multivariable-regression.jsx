import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';

const RegressionPlot = () => {
  const [norepiDose, setNorepiDose] = useState(10);

  const handleSliderChange = (event) => {
    setNorepiDose(parseFloat(event.target.value));
  };

  // --- Univariable Data ---
  // Generate stable random data using useMemo so it doesn't change on every render
  const { norepi_simple, map_simple, map_data_simple } = useMemo(() => {
    const norepi = Array.from({ length: 100 }, (_, i) => i * (20 / 99));
    const map = norepi.map(x => 45 + 0.6 * x);
    // Add some noise for scatter - generate once and keep it stable
    const map_data = map.map(y => y + (Math.random() - 0.5) * 4);
    return { norepi_simple: norepi, map_simple: map, map_data_simple: map_data };
  }, []); // Empty dependency array means this only runs once on mount

  const current_map_simple = 45 + 0.6 * norepiDose;

  // --- Multivariable Data (Surface) ---
  const norepi_range = Array.from({ length: 20 }, (_, i) => i * (20 / 19));
  const ph_range = Array.from({ length: 20 }, (_, i) => 6.9 + i * (0.6 / 19));
  const z_data = [];
  for (let i = 0; i < ph_range.length; i++) {
    const row = [];
    for (let j = 0; j < norepi_range.length; j++) {
      row.push(45 + 0.6 * norepi_range[j] - (7.3 - ph_range[i]) * 30);
    }
    z_data.push(row);
  }

  // --- Multivariable Data (Line) ---
  // Line at current norepiDose across all pH values
  const x_line = Array(ph_range.length).fill(norepiDose);
  const y_line = ph_range;
  const z_line = ph_range.map(ph => 45 + 0.6 * norepiDose - (7.3 - ph) * 30);

  // --- Top Plot: Univariable Layout and Data ---
  const univariableLayout = {
    width: 800,
    height: 450,
    title: 'Univariable Regression',
    xaxis: { 
      title: { text: 'Norepinephrine (mcg/kg/min)', standoff: 10 },
      range: [0, 20]
    },
    yaxis: { 
      title: { text: 'MAP (mmHg)', standoff: 10 }
    },
    showlegend: false
  };

  const univariableData = [
    {
      x: norepi_simple,
      y: map_data_simple,
      mode: 'markers',
      type: 'scatter',
      name: 'Data',
      marker: { color: 'blue', opacity: 0.5 }
    },
    {
      x: norepi_simple,
      y: map_simple,
      mode: 'lines',
      type: 'scatter',
      name: 'Model',
      line: { color: 'red', width: 2 }
    },
    {
      x: [norepiDose],
      y: [current_map_simple],
      mode: 'markers',
      type: 'scatter',
      name: 'Current Dose',
      marker: { color: 'green', size: 12, symbol: 'circle' }
    }
  ];

  // --- Bottom Plot: Multivariable Layout and Data ---
  const multivariableLayout = {
    width: 800,
    height: 450,
    title: 'Multivariable Regression',
    scene: {
      xaxis: { 
        title: { text: 'Norepinephrine (mcg/kg/min)', font: { size: 12 } },
        range: [0, 20]
      },
      yaxis: { 
        title: { text: 'pH', font: { size: 12 } },
        range: [7.5, 6.9] // Reversed pH axis
      },
      zaxis: { 
        title: { text: 'MAP (mmHg)', font: { size: 12 } }
      },
      camera: { eye: { x: -1.5, y: -1.5, z: 0.5 } }
    },
    showlegend: false
  };

  const multivariableData = [
    {
      type: 'surface',
      x: norepi_range,
      y: ph_range,
      z: z_data,
      colorscale: 'Viridis',
      opacity: 0.8,
      showscale: false,
      name: 'Model'
    },
    {
      type: 'scatter3d',
      mode: 'lines',
      x: x_line,
      y: y_line,
      z: z_line,
      line: { color: 'red', width: 5 },
      name: 'Current Dose Line'
    }
  ];

  return (
    <div>
      <Plot
        data={univariableData}
        layout={univariableLayout}
        config={{ responsive: true }}
      />
      <div style={{ margin: '20px', textAlign: 'center' }}>
        <label htmlFor="norepi-slider" style={{ marginRight: '10px' }}>
          Norepinephrine Dose (mcg/kg/min): {norepiDose.toFixed(1)}
        </label>
        <input
          id="norepi-slider"
          type="range"
          min="0"
          max="20"
          step="0.1"
          value={norepiDose}
          onChange={handleSliderChange}
          style={{ width: '300px' }}
        />
      </div>
      <Plot
        data={multivariableData}
        layout={multivariableLayout}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default RegressionPlot;