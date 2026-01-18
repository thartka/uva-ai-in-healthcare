import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const LogisticRegressionDemo = () => {
  const [step, setStep] = useState(0);

  // Generate data for plots
  const generateLinearData = () => {
    const data = [];
    for (let age = 0; age <= 100; age += 2) {
      const logit = -6 + 0.1 * age;
      data.push({ age, value: logit });
    }
    return data;
  };

  const generateLogisticData = () => {
    const data = [];
    for (let age = 0; age <= 100; age += 2) {
      const logit = -6 + 0.1 * age;
      const p = Math.exp(logit) / (1 + Math.exp(logit));
      data.push({ age, value: p });
    }
    return data;
  };

  const linearData = generateLinearData();
  const logisticData = generateLogisticData();

  const steps = [
    {
      title: "Step 1: The Logit Function",
      equation: "logit(p) = -6 + 0.1 × age",
      description: "We start with a linear equation for the logit (log-odds) of probability p.",
      plotData: linearData,
      yLabel: "logit(p)",
      yDomain: [-7, 8],
      showLogistic: false
    },
    {
      title: "Step 2: Expanding the Logit",
      equation: "log(p / (1-p)) = -6 + 0.1 × age",
      description: "The logit is defined as the natural log of the odds ratio p/(1-p).",
      plotData: linearData,
      yLabel: "log(p / (1-p))",
      yDomain: [-7, 8],
      showLogistic: false
    },
    {
      title: "Step 3: Solving for Probability",
      equation: "p = exp(-6 + 0.1 × age) / (1 + exp(-6 + 0.1 × age))",
      description: "Rearranging to solve for p gives us the logistic function, transforming the linear relationship into an S-shaped curve bounded between 0 and 1.",
      plotData: logisticData,
      yLabel: "Probability (p)",
      yDomain: [0, 1],
      showLogistic: true
    }
  ];

  const currentStep = steps[step];

  const plotData = [{
    x: currentStep.plotData.map(d => d.age),
    y: currentStep.plotData.map(d => d.value),
    type: 'scatter',
    mode: 'lines',
    line: {
      color: currentStep.showLogistic ? '#8b5cf6' : '#2563eb',
      width: 3
    },
    name: currentStep.showLogistic ? 'Logistic Function' : 'Logit'
  }];

  const plotLayout = {
    width: 800,
    height: 400,
    xaxis: {
      title: 'Age',
      range: [0, 100]
    },
    yaxis: {
      title: currentStep.yLabel,
      range: currentStep.yDomain
    },
    margin: { l: 60, r: 20, t: 20, b: 50 },
    showlegend: false
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '1.5rem',
      backgroundColor: 'white'
    }}>
      <div style={{
        backgroundColor: '#E3F2FD',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '0.75rem',
          color: '#0D47A1'
        }}>
          {currentStep.title}
        </h2>
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '4px',
          border: '2px solid #90CAF9',
          marginBottom: '0.75rem'
        }}>
          <p style={{
            fontSize: '1.5rem',
            textAlign: 'center',
            fontFamily: 'monospace',
            color: '#333',
            margin: 0
          }}>
            {currentStep.equation}
          </p>
        </div>
        <p style={{
          color: '#424242',
          margin: 0
        }}>
          {currentStep.description}
        </p>
      </div>

      <div style={{
        backgroundColor: '#FAFAFA',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <Plot
          data={plotData}
          layout={plotLayout}
          config={{ responsive: true, displayModeBar: false }}
        />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 600,
            border: 'none',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            backgroundColor: step === 0 ? '#E0E0E0' : '#2563eb',
            color: step === 0 ? '#9E9E9E' : 'white',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (step !== 0) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }
          }}
          onMouseLeave={(e) => {
            if (step !== 0) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
        >
          <span>←</span>
          Previous
        </button>

        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: idx === step ? '#2563eb' : '#D1D5DB'
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 600,
            border: 'none',
            cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer',
            backgroundColor: step === steps.length - 1 ? '#E0E0E0' : '#2563eb',
            color: step === steps.length - 1 ? '#9E9E9E' : 'white',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (step !== steps.length - 1) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }
          }}
          onMouseLeave={(e) => {
            if (step !== steps.length - 1) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
        >
          Next
          <span>→</span>
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        Step {step + 1} of {steps.length}
      </div>
    </div>
  );
};

export default LogisticRegressionDemo;
