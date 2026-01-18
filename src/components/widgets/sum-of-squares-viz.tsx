import React, { useState, useEffect } from 'react';

export default function LinearRegressionAnimation() {
  const [animationStage, setAnimationStage] = useState(0);
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(70);
  const [isAnimating, setIsAnimating] = useState(true);

  // Scattered data points (Norepi dose, MAP blood pressure)
  const dataPoints = [
    { x: 3, y: 51 },
    { x: 5, y: 48 },
    { x: 8, y: 55 },
    { x: 11, y: 58 },
    { x: 14, y: 54 },
    { x: 17, y: 62 },
    { x: 19, y: 59 },
    { x: 23, y: 67 },
    { x: 27, y: 63 },
    { x: 30, y: 70 },
    { x: 33, y: 68 },
    { x: 37, y: 74 },
    { x: 39, y: 71 },
    { x: 42, y: 77 },
    { x: 46, y: 75 }
  ];

  const targetSlope = 0.6;
  const targetIntercept = 50;

  // Calculate predicted y value for a given x
  const predictY = (x) => intercept + slope * x;

  // Calculate sum of squares
  const calculateSumOfSquares = () => {
    return dataPoints.reduce((sum, point) => {
      const predicted = predictY(point.x);
      const residual = point.y - predicted;
      return sum + residual * residual;
    }, 0);
  };

  const sumOfSquares = calculateSumOfSquares();

  // Animation sequence
  useEffect(() => {
    if (!isAnimating) return;

    const timers = [];

    // Stage 0: Show data points (1.5s)
    timers.push(setTimeout(() => setAnimationStage(1), 1500));

    // Stage 1: Show line (1.5s)
    timers.push(setTimeout(() => setAnimationStage(2), 3000));

    // Stage 2: Show error boxes (1.5s)
    timers.push(setTimeout(() => setAnimationStage(3), 4500));

    // Stage 3: Start optimizing line (animate for 3s)
    timers.push(setTimeout(() => {
      const optimizationInterval = setInterval(() => {
        setSlope(prev => {
          const diff = targetSlope - prev;
          if (Math.abs(diff) < 0.01) return targetSlope;
          return prev + diff * 0.1;
        });
        setIntercept(prev => {
          const diff = targetIntercept - prev;
          if (Math.abs(diff) < 0.1) return targetIntercept;
          return prev + diff * 0.1;
        });
      }, 50);

      timers.push(setTimeout(() => {
        clearInterval(optimizationInterval);
        setSlope(targetSlope);
        setIntercept(targetIntercept);
        setAnimationStage(4);
      }, 3000));
    }, 4500));

    // Stage 4: Remove error boxes and stop
    timers.push(setTimeout(() => {
      setIsAnimating(false);
    }, 8000));

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [isAnimating]);

  const handleReplay = () => {
    setAnimationStage(0);
    setSlope(0);
    setIntercept(70);
    setIsAnimating(true);
  };

  // Convert coordinate system for SVG
  const toSVG = (x, y) => {
    const scaleX = 8;
    const scaleY = 4;
    const offsetX = 60;
    const offsetY = 340;
    return {
      x: x * scaleX + offsetX,
      y: offsetY - (y - 40) * scaleY
    };
  };

  return (
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-xl p-4 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{textAlign: 'center'}}>Sum of Squares</h1>
          <div className="bg-gray-50 rounded-lg p-2 border-2 border-gray-200 mx-auto" style={{maxWidth: '100%'}}>
          <svg width="100%" height="320" viewBox="0 140 500 320" className="bg-white rounded">
            {/* Grid lines */}
            {[40, 50, 60, 70, 80].map(y => (
              <g key={`y${y}`}>
                <line
                  x1={toSVG(0, y).x}
                  y1={toSVG(0, y).y}
                  x2={toSVG(50, y).x}
                  y2={toSVG(50, y).y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text x={toSVG(0, y).x - 30} y={toSVG(0, y).y + 5} fontSize="12" fill="#6b7280">
                  {y}
                </text>
              </g>
            ))}
            
            {[0, 10, 20, 30, 40, 50].map(x => (
              <g key={`x${x}`}>
                <line
                  x1={toSVG(x, 40).x}
                  y1={toSVG(x, 40).y}
                  x2={toSVG(x, 80).x}
                  y2={toSVG(x, 80).y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text x={toSVG(x, 40).x - 8} y={toSVG(x, 40).y + 20} fontSize="12" fill="#6b7280">
                  {x}
                </text>
              </g>
            ))}
            
            {/* Axes */}
            <line 
              x1={toSVG(0, 40).x} 
              y1={toSVG(0, 40).y} 
              x2={toSVG(0, 80).x} 
              y2={toSVG(0, 80).y} 
              stroke="#374151" 
              strokeWidth="2" 
            />
            <line 
              x1={toSVG(0, 40).x} 
              y1={toSVG(0, 40).y} 
              x2={toSVG(50, 40).x} 
              y2={toSVG(50, 40).y} 
              stroke="#374151" 
              strokeWidth="2" 
            />
            
            {/* Axis labels */}
            <text x={toSVG(25, 40).x} y={toSVG(25, 40).y + 40} fontSize="14" fill="#374151" fontWeight="bold" textAnchor="middle">
              Norepinephrine (mcg/kg/min)
            </text>
            <text x={toSVG(0, 60).x - 50} y={toSVG(0, 60).y} fontSize="14" fill="#374151" fontWeight="bold" textAnchor="middle" transform={`rotate(-90, ${toSVG(0, 60).x - 50}, ${toSVG(0, 60).y})`}>
              MAP (mmHg)
            </text>
            <text x={toSVG(0, 60).x - 50} y={toSVG(0, 60).y} fontSize="14" fill="#374151" fontWeight="bold" textAnchor="middle" transform={`rotate(-90, ${toSVG(0, 60).x - 50}, ${toSVG(0, 60).y})`}>
              MAP (mmHg)
            </text>
            
            {/* Regression line (visible from stage 1) */}
            {animationStage >= 1 && (
              <line
                x1={toSVG(0, predictY(0)).x}
                y1={toSVG(0, predictY(0)).y}
                x2={toSVG(50, predictY(50)).x}
                y2={toSVG(50, predictY(50)).y}
                stroke="#3b82f6"
                strokeWidth="3"
              />
            )}
            
            {/* Residual squares and lines (visible in stages 2 and 3) */}
            {animationStage >= 2 && animationStage < 4 && dataPoints.map((point, i) => {
              const predicted = predictY(point.x);
              const residual = point.y - predicted;
              const pointPos = toSVG(point.x, point.y);
              const predPos = toSVG(point.x, predicted);
              const squareSize = Math.abs(residual) * 4;
              
              return (
                <g key={i}>
                  {/* Residual line */}
                  <line
                    x1={pointPos.x}
                    y1={pointPos.y}
                    x2={predPos.x}
                    y2={predPos.y}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  
                  {/* Square */}
                  <rect
                    x={predPos.x}
                    y={residual > 0 ? predPos.y - squareSize : predPos.y}
                    width={squareSize}
                    height={squareSize}
                    fill="#ef4444"
                    fillOpacity="0.2"
                    stroke="#ef4444"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
            
            {/* Data points (visible from stage 0) */}
            {animationStage >= 0 && dataPoints.map((point, i) => {
              const pos = toSVG(point.x, point.y);
              return (
                <circle
                  key={i}
                  cx={pos.x}
                  cy={pos.y}
                  r="5"
                  fill="#1e40af"
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        <div className="mt-4 space-y-2 w-full" style={{textAlign: 'center'}}>
          {animationStage >= 1 && (
            <p className="text-sm text-gray-600">
              Equation: MAP = {intercept.toFixed(2)} + {slope.toFixed(2)} × Norepi
            </p>
          )}
          {animationStage >= 2 && animationStage < 4 && (
            <p className="text-lg font-bold text-gray-800">
              Sum of Squares (SSE): <span className="text-red-600">{sumOfSquares.toFixed(2)}</span>
            </p>
          )}
          {animationStage === 4 && (
            <p className="text-lg font-bold text-green-600">
              Optimal fit achieved! SSE = {sumOfSquares.toFixed(2)}
            </p>
          )}
        </div>

        <div className="mt-6 w-full" style={{textAlign: 'center'}}>
          <button
            onClick={handleReplay}
            disabled={isAnimating}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Replay Animation
          </button>
        </div>
      </div>
    </div>
  );
}