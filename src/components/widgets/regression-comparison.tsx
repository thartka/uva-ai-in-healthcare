import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';

const RegressionComparison = () => {
  const [dose, setDose] = useState(10);

  // Generate sample data (stable across renders)
  const { linearData, logisticData, linearLine, logisticCurve } = useMemo(() => {
    // Linear regression data
    const linear = [];
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 20;
      const noise = (Math.random() - 0.5) * 15;
      const y = 50 + 0.6 * x + noise;
      linear.push({ x, y });
    }
    linear.sort((a, b) => a.x - b.x);

    // Logistic regression data
    const logistic = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 20;
      const prob = 1 / (1 + Math.exp(-0.2 * (x - 15)));
      const outcome = Math.random() < prob ? 1 : 0;
      logistic.push({ x, y: outcome });
    }
    logistic.sort((a, b) => a.x - b.x);

    // Linear regression line
    const linearLineData = [];
    for (let x = 0; x <= 20; x += 1) {
      linearLineData.push({ x, y: 50 + 0.6 * x });
    }

    // Logistic regression curve
    const logisticCurveData = [];
    for (let x = 0; x <= 20; x += 0.5) {
      const prob = 1 / (1 + Math.exp(-0.2 * (x - 15)));
      logisticCurveData.push({ x, y: prob });
    }

    return {
      linearData: linear,
      logisticData: logistic,
      linearLine: linearLineData,
      logisticCurve: logisticCurveData
    };
  }, []);

  // Calculate predictions for current dose
  const mapPrediction = 50 + 0.6 * dose;
  const probability = 1 / (1 + Math.exp(-0.2 * (dose - 15)));

  // Linear regression plot data
  const linearPlotData = [
    {
      x: linearData.map(d => d.x),
      y: linearData.map(d => d.y),
      type: 'scatter',
      mode: 'markers',
      name: 'Observed MAP',
      marker: { color: 'rgba(33, 150, 243, 0.6)', size: 8 }
    },
    {
      x: linearLine.map(d => d.x),
      y: linearLine.map(d => d.y),
      type: 'scatter',
      mode: 'lines',
      name: 'Linear Fit',
      line: { color: 'rgb(255, 99, 132)', width: 3 }
    },
    {
      x: [dose],
      y: [mapPrediction],
      type: 'scatter',
      mode: 'markers',
      name: 'Current Dose',
      marker: { color: 'rgb(76, 175, 80)', size: 15, symbol: 'star' }
    }
  ];

  // Logistic regression plot data
  const logisticPlotData = [
    {
      x: logisticData.map(d => d.x),
      y: logisticData.map(d => d.y),
      type: 'scatter',
      mode: 'markers',
      name: 'MAP > 65 (Yes=1, No=0)',
      marker: { color: 'rgba(33, 150, 243, 0.6)', size: 8 }
    },
    {
      x: logisticCurve.map(d => d.x),
      y: logisticCurve.map(d => d.y),
      type: 'scatter',
      mode: 'lines',
      name: 'Logistic Curve: P(MAP>65)',
      line: { color: 'rgb(255, 99, 132)', width: 3 }
    },
    {
      x: [dose],
      y: [probability],
      type: 'scatter',
      mode: 'markers',
      name: 'Current Dose',
      marker: { color: 'rgb(76, 175, 80)', size: 15, symbol: 'star' }
    }
  ];

  const linearLayout = {
    width: 500,
    height: 400,
    title: 'Linear Regression',
    xaxis: {
      title: 'Norepinephrine Dose (mcg/min)',
      range: [0, 20]
    },
    yaxis: {
      title: 'Mean Arterial Pressure (mmHg)',
      range: [40, 70]
    },
    margin: { l: 70, r: 20, t: 50, b: 60 },
    showlegend: false
  };

  const logisticLayout = {
    width: 500,
    height: 400,
    title: 'Logistic Regression',
    xaxis: {
      title: 'Norepinephrine Dose (mcg/min)',
      range: [0, 20]
    },
    yaxis: {
      title: 'Probability MAP > 60',
      range: [-0.05, 1.05],
      tickmode: 'linear',
      tick0: 0,
      dtick: 0.2
    },
    margin: { l: 70, r: 20, t: 50, b: 60 },
    showlegend: false
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '2rem auto',
      padding: '1.5rem',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          margin: '1.5rem 0',
          textAlign: 'center'
        }}>
          <label htmlFor="doseSlider" style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#555',
            fontSize: '1rem'
          }}>
            Norepinephrine Dose (mcg/min):
            <span style={{
              display: 'inline-block',
              marginLeft: '15px',
              fontSize: '1.125rem',
              color: '#2196F3',
              fontWeight: 'bold'
            }}>
              {dose}
            </span>
          </label>
          <input
            id="doseSlider"
            type="range"
            min="0"
            max="20"
            value={dose}
            step="0.5"
            onChange={(e) => setDose(parseFloat(e.target.value))}
            style={{
              width: '80%',
              height: '8px',
              background: '#ddd',
              borderRadius: '5px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {/* Linear Regression Chart */}
          <div style={{
            backgroundColor: '#fafafa',
            padding: '1.25rem',
            borderRadius: '8px',
            minHeight: '450px'
          }}>
            <h3 style={{
              textAlign: 'center',
              color: '#444',
              marginBottom: '1rem',
              fontSize: '1.125rem',
              fontWeight: 600
            }}>
              Linear Regression
            </h3>
            <Plot
              data={linearPlotData}
              layout={linearLayout}
              config={{ responsive: true, displayModeBar: false }}
            />
            <div style={{
              textAlign: 'center',
              marginTop: '0.5rem',
              fontSize: '1rem',
              color: '#666'
            }}>
              Predicted MAP: <strong style={{ color: '#2196F3' }}>{mapPrediction.toFixed(1)} mmHg</strong>
            </div>
          </div>

          {/* Logistic Regression Chart */}
          <div style={{
            backgroundColor: '#fafafa',
            padding: '1.25rem',
            borderRadius: '8px',
            minHeight: '450px'
          }}>
            <h3 style={{
              textAlign: 'center',
              color: '#444',
              marginBottom: '1rem',
              fontSize: '1.125rem',
              fontWeight: 600
            }}>
              Logistic Regression
            </h3>
            <Plot
              data={logisticPlotData}
              layout={logisticLayout}
              config={{ responsive: true, displayModeBar: false }}
            />
            <div style={{
              textAlign: 'center',
              marginTop: '0.5rem',
              fontSize: '1rem',
              color: '#666'
            }}>
              P(MAP > 60): <strong style={{ color: '#2196F3' }}>{(probability * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegressionComparison;
