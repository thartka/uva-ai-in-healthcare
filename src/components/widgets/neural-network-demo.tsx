import React, { useState, useEffect, useRef } from 'react';

type ActivationType = 'sigmoid' | 'relu';

interface WeightConfig {
  label: string;
  index: number;
}

const NeuralNetworkVisualizer: React.FC = () => {
  const [inputs, setInputs] = useState<[number, number]>([0, 0]);
  const [weights, setWeights] = useState<number[]>([0.5, 0.3, 0.4, 0.6, 0.7, 0.5]);
  const [activation, setActivation] = useState<ActivationType>('sigmoid');
  const [hidden, setHidden] = useState<[number, number]>([0, 0]);
  const [output, setOutput] = useState<number>(0);
  
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const activation1Ref = useRef<HTMLCanvasElement>(null);
  const activation2Ref = useRef<HTMLCanvasElement>(null);

  const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
  const relu = (x: number): number => Math.max(0, x);
  const activate = (x: number): number => activation === 'sigmoid' ? sigmoid(x) : relu(x);

  const forwardPass = (): void => {
    const h1 = activate(inputs[0] * weights[0] + inputs[1] * weights[2]);
    const h2 = activate(inputs[0] * weights[1] + inputs[1] * weights[3]);
    const o = activate(h1 * weights[4] + h2 * weights[5]);
    setHidden([h1, h2]);
    setOutput(o);
  };

  useEffect(() => {
    forwardPass();
  }, [inputs, weights, activation]);

  useEffect(() => {
    drawMainNetwork();
    drawActivationGraph(activation1Ref.current, 0);
    drawActivationGraph(activation2Ref.current, 1);
  }, [inputs, weights, activation, hidden, output]);

  const drawMainNetwork = (): void => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodeRadius = 25;
    const inputX = 100;
    const hiddenX = 400;
    const outputX = 700;
    const inputY: [number, number] = [120, 280];
    const hiddenY: [number, number] = [120, 280];
    const outputY = 200;

    const drawConnection = (
      x1: number, 
      y1: number, 
      x2: number, 
      y2: number, 
      weight: number, 
      activationVal: number
    ): void => {
      const alpha = Math.min(Math.abs(activationVal) * 0.8 + 0.2, 1);
      ctx.strokeStyle = weight >= 0 ? 
        `rgba(102, 126, 234, ${alpha})` : 
        `rgba(234, 102, 102, ${alpha})`;
      ctx.lineWidth = Math.abs(weight) * 3 + 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      ctx.fillStyle = '#555';
      ctx.font = '11px Arial';
      // Position label at 40% along the connection to avoid overlap
      const labelX = x1 + (x2 - x1) * 0.4;
      const labelY = y1 + (y2 - y1) * 0.4;
      ctx.fillText(weight.toFixed(1), labelX, labelY - 5);
    };

    drawConnection(inputX, inputY[0], hiddenX, hiddenY[0], weights[0], inputs[0]);
    drawConnection(inputX, inputY[0], hiddenX, hiddenY[1], weights[1], inputs[0]);
    drawConnection(inputX, inputY[1], hiddenX, hiddenY[0], weights[2], inputs[1]);
    drawConnection(inputX, inputY[1], hiddenX, hiddenY[1], weights[3], inputs[1]);
    drawConnection(hiddenX, hiddenY[0], outputX, outputY, weights[4], hidden[0]);
    drawConnection(hiddenX, hiddenY[1], outputX, outputY, weights[5], hidden[1]);

    const drawNode = (x: number, y: number, value: number, label: string): void => {
      const intensity = Math.min(value, 1);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius);
      gradient.addColorStop(0, `rgba(102, 126, 234, ${intensity * 0.9 + 0.1})`);
      gradient.addColorStop(1, `rgba(102, 126, 234, ${intensity * 0.5 + 0.3})`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y - 8);
      ctx.font = '11px Arial';
      ctx.fillText(value.toFixed(2), x, y + 8);
    };

    drawNode(inputX, inputY[0], inputs[0], 'I1');
    drawNode(inputX, inputY[1], inputs[1], 'I2');
    drawNode(hiddenX, hiddenY[0], hidden[0], 'H1');
    drawNode(hiddenX, hiddenY[1], hidden[1], 'H2');
    drawNode(outputX, outputY, output, 'O');

    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Input Layer', inputX, 40);
    ctx.fillText('Hidden Layer', hiddenX, 40);
    ctx.fillText('Output Layer', outputX, 40);
  };

  const drawActivationGraph = (canvas: HTMLCanvasElement | null, hiddenIndex: number): void => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    const padding = 30;
    const graphW = w - 2 * padding;
    const graphH = h - 2 * padding;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // Correct weight mapping: H1 uses weights[0] and weights[2], H2 uses weights[1] and weights[3]
    const weightedSum = hiddenIndex === 0
      ? inputs[0] * weights[0] + inputs[1] * weights[2]
      : inputs[0] * weights[1] + inputs[1] * weights[3];

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const xMin = -3;
    const xMax = 3;
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      const y = activate(x);
      const yMax = activation === 'sigmoid' ? 1 : 3;
      
      const canvasX = padding + (x - xMin) / (xMax - xMin) * graphW;
      const canvasY = h - padding - (y / yMax) * graphH;

      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    const currentY = hidden[hiddenIndex];
    const yMax = activation === 'sigmoid' ? 1 : 3;
    const pointX = padding + (weightedSum - xMin) / (xMax - xMin) * graphW;
    const pointY = h - padding - (currentY / yMax) * graphH;

    ctx.strokeStyle = '#ea4c89';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pointX, h - padding);
    ctx.lineTo(pointX, pointY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ea4c89';
    ctx.beginPath();
    ctx.arc(pointX, pointY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Weighted Sum', w / 2, h - 8);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Activation', 0, 0);
    ctx.restore();

    ctx.font = '9px Arial';
    ctx.fillText('0', padding, h - padding + 12);
    ctx.textAlign = 'right';
    ctx.fillText(yMax.toFixed(1), padding - 4, padding + 4);
    ctx.fillText('0', padding - 4, h - padding + 4);

    ctx.fillStyle = '#ea4c89';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`x = ${weightedSum.toFixed(2)}`, pointX + 8, h - padding - 4);
    ctx.fillText(`y = ${currentY.toFixed(2)}`, pointX + 8, pointY - 8);

    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(activation.toUpperCase(), w - padding - 4, padding + 12);
  };

  const toggleInput = (index: 0 | 1): void => {
    const newInputs: [number, number] = [...inputs] as [number, number];
    newInputs[index] = newInputs[index] === 0 ? 1 : 0;
    setInputs(newInputs);
  };

  const updateWeight = (index: number, value: string): void => {
    const newWeights = [...weights];
    newWeights[index] = parseFloat(value);
    setWeights(newWeights);
  };

  const inputToHiddenWeights: WeightConfig[] = [
    { label: 'W1→H1:', index: 0 },
    { label: 'W1→H2:', index: 1 },
    { label: 'W2→H1:', index: 2 },
    { label: 'W2→H2:', index: 3 }
  ];

  const hiddenToOutputWeights: WeightConfig[] = [
    { label: 'H1→O:', index: 4 },
    { label: 'H2→O:', index: 5 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 p-5">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <canvas 
          ref={mainCanvasRef}
          width={800} 
          height={400}
          className="w-full bg-gray-50 rounded-lg shadow-inner mb-5"
        />
        
        <div className="text-center text-2xl font-bold text-purple-600 mb-5 p-4 bg-purple-50 rounded-lg">
          Output: <span>{output.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', flex: '1', maxWidth: '300px', minWidth: '250px' }}>
            <h3 style={{ color: '#9333ea', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Hidden Node 1 Activation</h3>
            <canvas ref={activation1Ref} width={250} height={150} style={{ width: '100%', backgroundColor: 'white', borderRadius: '0.25rem' }} />
          </div>
          <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', flex: '1', maxWidth: '300px', minWidth: '250px' }}>
            <h3 style={{ color: '#9333ea', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Hidden Node 2 Activation</h3>
            <canvas ref={activation2Ref} width={250} height={150} style={{ width: '100%', backgroundColor: 'white', borderRadius: '0.25rem' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', flex: '1', minWidth: '200px' }}>
            <h3 style={{ color: '#9333ea', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem' }}>Input Layer</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#4b5563' }}>Input 1:</label>
              <button 
                onClick={() => toggleInput(0)}
                style={{ backgroundColor: '#9333ea', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7e22ce'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
              >
                Toggle
              </button>
              <span style={{ fontWeight: 700, color: '#9333ea', minWidth: '40px', textAlign: 'right' }}>{inputs[0]}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.875rem', color: '#4b5563' }}>Input 2:</label>
              <button 
                onClick={() => toggleInput(1)}
                style={{ backgroundColor: '#9333ea', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7e22ce'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
              >
                Toggle
              </button>
              <span style={{ fontWeight: 700, color: '#9333ea', minWidth: '40px', textAlign: 'right' }}>{inputs[1]}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', flex: '1', minWidth: '200px' }}>
            <h3 style={{ color: '#9333ea', fontWeight: 600, marginBottom: '0.5625rem', fontSize: '0.875rem' }}>Weights: Input → Hidden</h3>
            {inputToHiddenWeights.map(({ label, index }) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#4b5563', width: '48px' }}>{label}</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={weights[index]}
                  onChange={(e) => updateWeight(index, e.target.value)}
                  style={{ flex: '1', transform: 'scale(0.75)', transformOrigin: 'center' }}
                />
                <span style={{ fontWeight: 700, color: '#9333ea', width: '30px', textAlign: 'right', fontSize: '0.75rem' }}>{weights[index].toFixed(1)}</span>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', flex: '1', minWidth: '200px' }}>
            <h3 style={{ color: '#9333ea', fontWeight: 600, marginBottom: '0.5625rem', fontSize: '0.875rem' }}>Weights: Hidden → Output</h3>
            {hiddenToOutputWeights.map(({ label, index }) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#4b5563', width: '48px' }}>{label}</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={weights[index]}
                  onChange={(e) => updateWeight(index, e.target.value)}
                  style={{ flex: '1', transform: 'scale(0.75)', transformOrigin: 'center' }}
                />
                <span style={{ fontWeight: 700, color: '#9333ea', width: '30px', textAlign: 'right', fontSize: '0.75rem' }}>{weights[index].toFixed(1)}</span>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', flex: '1', minWidth: '200px' }}>
            <h3 style={{ color: '#9333ea', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem' }}>Activation Function</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#4b5563' }}>Function:</label>
              <select 
                value={activation}
                onChange={(e) => setActivation(e.target.value as ActivationType)}
                style={{ flex: '1', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: 'white', fontSize: '0.875rem' }}
              >
                <option value="sigmoid">Sigmoid</option>
                <option value="relu">ReLU</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkVisualizer;