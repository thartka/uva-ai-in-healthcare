import React, { useState } from 'react';
import { Download } from 'lucide-react';

const NeuralNetworkViz = () => {
  const [inputs, setInputs] = useState([1, 0]);
  const [weightsIH, setWeightsIH] = useState([[0.5, -0.3], [0.8, 0.2]]);
  const [weightsHO, setWeightsHO] = useState([0.6, -0.4]);
  const [biasH, setBiasH] = useState([0.1, -0.1]);
  const [biasO, setBiasO] = useState(0.2);
  const [activation, setActivation] = useState('sigmoid');

  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const relu = (x) => Math.max(0, x);

  const activationFn = activation === 'sigmoid' ? sigmoid : relu;

  const hiddenRaw = [
    inputs[0] * weightsIH[0][0] + inputs[1] * weightsIH[1][0] + biasH[0],
    inputs[0] * weightsIH[0][1] + inputs[1] * weightsIH[1][1] + biasH[1]
  ];
  const hidden = hiddenRaw.map(activationFn);
  const outputRaw = hidden[0] * weightsHO[0] + hidden[1] * weightsHO[1] + biasO;
  const output = activationFn(outputRaw);

  const nodeRadius = 25;

  const inputPositions = [
    { x: 100, y: 150 },
    { x: 100, y: 250 }
  ];
  const hiddenPositions = [
    { x: 300, y: 150 },
    { x: 300, y: 250 }
  ];
  const outputPosition = { x: 500, y: 200 };

  const downloadComponent = () => {
    const componentCode = `import React, { useState } from 'react';

const NeuralNetworkViz = () => {
  const [inputs, setInputs] = useState([1, 0]);
  const [weightsIH, setWeightsIH] = useState([[0.5, -0.3], [0.8, 0.2]]);
  const [weightsHO, setWeightsHO] = useState([0.6, -0.4]);
  const [biasH, setBiasH] = useState([0.1, -0.1]);
  const [biasO, setBiasO] = useState(0.2);
  const [activation, setActivation] = useState('sigmoid');

  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const relu = (x) => Math.max(0, x);

  const activationFn = activation === 'sigmoid' ? sigmoid : relu;

  const hiddenRaw = [
    inputs[0] * weightsIH[0][0] + inputs[1] * weightsIH[1][0] + biasH[0],
    inputs[0] * weightsIH[0][1] + inputs[1] * weightsIH[1][1] + biasH[1]
  ];
  const hidden = hiddenRaw.map(activationFn);
  const outputRaw = hidden[0] * weightsHO[0] + hidden[1] * weightsHO[1] + biasO;
  const output = activationFn(outputRaw);

  const nodeRadius = 25;

  const inputPositions = [
    { x: 100, y: 150 },
    { x: 100, y: 250 }
  ];
  const hiddenPositions = [
    { x: 300, y: 150 },
    { x: 300, y: 250 }
  ];
  const outputPosition = { x: 500, y: 200 };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-slate-800">Neural Network Visualizer</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <svg width="600" height="400" className="mx-auto">
          {inputPositions.map((pos1, i) => 
            hiddenPositions.map((pos2, j) => {
              const weight = weightsIH[i][j];
              const color = weight >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
              const width = Math.abs(weight) * 3;
              return (
                <line
                  key={'ih-' + i + '-' + j}
                  x1={pos1.x + nodeRadius}
                  y1={pos1.y}
                  x2={pos2.x - nodeRadius}
                  y2={pos2.y}
                  stroke={color}
                  strokeWidth={width}
                  opacity={0.6}
                />
              );
            })
          )}
          
          {hiddenPositions.map((pos1, i) => {
            const weight = weightsHO[i];
            const color = weight >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
            const width = Math.abs(weight) * 3;
            return (
              <line
                key={'ho-' + i}
                x1={pos1.x + nodeRadius}
                y1={pos1.y}
                x2={outputPosition.x - nodeRadius}
                y2={outputPosition.y}
                stroke={color}
                strokeWidth={width}
                opacity={0.6}
              />
            );
          })}

          {inputPositions.map((pos, i) => (
            <g key={'input-' + i}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill="rgb(59, 130, 246)"
                stroke="rgb(30, 64, 175)"
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                {inputs[i]}
              </text>
              <text
                x={pos.x - 40}
                y={pos.y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill="rgb(51, 65, 85)"
              >
                I{i + 1}
              </text>
            </g>
          ))}

          {hiddenPositions.map((pos, i) => (
            <g key={'hidden-' + i}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill="rgb(168, 85, 247)"
                stroke="rgb(109, 40, 217)"
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {hidden[i].toFixed(2)}
              </text>
              <text
                x={pos.x}
                y={pos.y + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
              >
                ({hiddenRaw[i].toFixed(2)})
              </text>
              <text
                x={pos.x}
                y={pos.y - 45}
                textAnchor="middle"
                fontSize="12"
                fill="rgb(51, 65, 85)"
              >
                H{i + 1}
              </text>
            </g>
          ))}

          <g>
            <circle
              cx={outputPosition.x}
              cy={outputPosition.y}
              r={nodeRadius}
              fill="rgb(34, 197, 94)"
              stroke="rgb(22, 163, 74)"
              strokeWidth={2}
            />
            <text
              x={outputPosition.x}
              y={outputPosition.y - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              {output.toFixed(2)}
            </text>
            <text
              x={outputPosition.x}
              y={outputPosition.y + 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="8"
            >
              ({outputRaw.toFixed(2)})
            </text>
            <text
              x={outputPosition.x}
              y={outputPosition.y - 45}
              textAnchor="middle"
              fontSize="12"
              fill="rgb(51, 65, 85)"
            >
              Output
            </text>
          </g>

          <text x={100} y={30} fontSize="14" fill="rgb(71, 85, 105)" fontWeight="bold">Input Layer</text>
          <text x={280} y={30} fontSize="14" fill="rgb(71, 85, 105)" fontWeight="bold">Hidden Layer</text>
          <text x={470} y={30} fontSize="14" fill="rgb(71, 85, 105)" fontWeight="bold">Output Layer</text>
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Inputs</h2>
          <div className="space-y-3">
            {inputs.map((val, i) => (
              <div key={i} className="flex items-center justify-between">
                <label className="text-sm font-medium">Input {i + 1}</label>
                <button
                  onClick={() => {
                    const newInputs = [...inputs];
                    newInputs[i] = newInputs[i] === 0 ? 1 : 0;
                    setInputs(newInputs);
                  }}
                  className={'px-4 py-2 rounded-lg font-semibold transition ' + (val === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700')}
                >
                  {val}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Weights</h2>
          <div className="grid grid-cols-2 gap-4">
            {weightsIH.map((weights, i) => (
              <div key={'ih-' + i}>
                {weights.map((w, j) => (
                  <div key={j} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium">I{i+1}→H{j+1}</label>
                      <span className="text-xs text-slate-600">{w.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={w}
                      onChange={(e) => {
                        const newWeights = weightsIH.map(row => [...row]);
                        newWeights[i][j] = Number(e.target.value);
                        setWeightsIH(newWeights);
                      }}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            ))}
            {weightsHO.map((w, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">H{i+1}→O</label>
                  <span className="text-xs text-slate-600">{w.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={w}
                  onChange={(e) => {
                    const newWeights = [...weightsHO];
                    newWeights[i] = Number(e.target.value);
                    setWeightsHO(newWeights);
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Activation Function</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setActivation('sigmoid')}
              className={'flex-1 py-2 px-4 rounded-lg font-medium transition ' + (activation === 'sigmoid' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}
            >
              Sigmoid
            </button>
            <button
              onClick={() => setActivation('relu')}
              className={'flex-1 py-2 px-4 rounded-lg font-medium transition ' + (activation === 'relu' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}
            >
              ReLU
            </button>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg text-center">
            <h3 className="text-sm font-semibold mb-2 text-slate-700">Network Output</h3>
            <p className="text-4xl font-bold text-blue-600">{output.toFixed(4)}</p>
            <p className="text-xs text-slate-600 mt-2">Final prediction value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkViz;`;

    const blob = new Blob([componentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NeuralNetworkViz.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Neural Network Visualizer</h1>
        <button
          onClick={downloadComponent}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download size={20} />
          Download .tsx
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <svg width="600" height="400" className="mx-auto">
          {inputPositions.map((pos1, i) => 
            hiddenPositions.map((pos2, j) => {
              const weight = weightsIH[i][j];
              const color = weight >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
              const width = Math.abs(weight) * 3;
              return (
                <line
                  key={`ih-${i}-${j}`}
                  x1={pos1.x + nodeRadius}
                  y1={pos1.y}
                  x2={pos2.x - nodeRadius}
                  y2={pos2.y}
                  stroke={color}
                  strokeWidth={width}
                  opacity={0.6}
                />
              );
            })
          )}
          
          {hiddenPositions.map((pos1, i) => {
            const weight = weightsHO[i];
            const color = weight >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
            const width = Math.abs(weight) * 3;
            return (
              <line
                key={`ho-${i}`}
                x1={pos1.x + nodeRadius}
                y1={pos1.y}
                x2={outputPosition.x - nodeRadius}
                y2={outputPosition.y}
                stroke={color}
                strokeWidth={width}
                opacity={0.6}
              />
            );
          })}

          {inputPositions.map((pos, i) => (
            <g 
              key={`input-${i}`}
              onClick={() => {
                const newInputs = [...inputs];
                newInputs[i] = newInputs[i] === 0 ? 1 : 0;
                setInputs(newInputs);
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill="rgb(59, 130, 246)"
                stroke="rgb(30, 64, 175)"
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {inputs[i]}
              </text>
              <text
                x={pos.x - 40}
                y={pos.y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill="rgb(51, 65, 85)"
                style={{ pointerEvents: 'none' }}
              >
                I{i + 1}
              </text>
            </g>
          ))}

          {hiddenPositions.map((pos, i) => (
            <g key={`hidden-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill="rgb(168, 85, 247)"
                stroke="rgb(109, 40, 217)"
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {hidden[i].toFixed(2)}
              </text>
              <text
                x={pos.x}
                y={pos.y + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
              >
                ({hiddenRaw[i].toFixed(2)})
              </text>
              <text
                x={pos.x}
                y={pos.y - 45}
                textAnchor="middle"
                fontSize="12"
                fill="rgb(51, 65, 85)"
              >
                H{i + 1}
              </text>
            </g>
          ))}

          <g>
            <circle
              cx={outputPosition.x}
              cy={outputPosition.y}
              r={nodeRadius}
              fill="rgb(34, 197, 94)"
              stroke="rgb(22, 163, 74)"
              strokeWidth={2}
            />
            <text
              x={outputPosition.x}
              y={outputPosition.y - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              {output.toFixed(2)}
            </text>
            <text
              x={outputPosition.x}
              y={outputPosition.y + 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="8"
            >
              ({outputRaw.toFixed(2)})
            </text>
            <text
              x={outputPosition.x}
              y={outputPosition.y - 45}
              textAnchor="middle"
              fontSize="12"
              fill="rgb(51, 65, 85)"
            >
              Output
            </text>
          </g>

          <text x={100} y={30} fontSize="14" fill="rgb(71, 85, 105)" fontWeight="bold">Input Layer</text>
          <text x={280} y={30} fontSize="14" fill="rgb(71, 85, 105)" fontWeight="bold">Hidden Layer</text>
          <text x={470} y={30} fontSize="14" fill="rgb(71, 85, 105)" fontWeight="bold">Output Layer</text>
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Weights</h2>
          <div className="grid grid-cols-2 gap-3">
            {weightsIH.map((weights, i) => (
              <div key={`ih-${i}`}>
                {weights.map((w, j) => (
                  <div key={j} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium">I{i+1}→H{j+1}</label>
                      <span className="text-xs text-slate-600">{w.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={w}
                      onChange={(e) => {
                        const newWeights = weightsIH.map(row => [...row]);
                        newWeights[i][j] = Number(e.target.value);
                        setWeightsIH(newWeights);
                      }}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            ))}
            {weightsHO.map((w, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">H{i+1}→O</label>
                  <span className="text-xs text-slate-600">{w.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={w}
                  onChange={(e) => {
                    const newWeights = [...weightsHO];
                    newWeights[i] = Number(e.target.value);
                    setWeightsHO(newWeights);
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Activation Function</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setActivation('sigmoid')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                activation === 'sigmoid'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sigmoid
            </button>
            <button
              onClick={() => setActivation('relu')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                activation === 'relu'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ReLU
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Network Output</h2>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg text-center">
            <p className="text-4xl font-bold text-blue-600">{output.toFixed(4)}</p>
            <p className="text-xs text-slate-600 mt-2">Final prediction value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkViz;