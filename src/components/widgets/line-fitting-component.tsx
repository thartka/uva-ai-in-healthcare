import React, { useState, useEffect } from 'react';

export default function LineFittingGame() {
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const points = [
    { x: 2, y: 3 },
    { x: 4, y: 1 }
  ];

  // Check if the line passes through both points
  useEffect(() => {
    const tolerance = 0.05;
    const point1OnLine = Math.abs((slope * points[0].x + intercept) - points[0].y) < tolerance;
    const point2OnLine = Math.abs((slope * points[1].x + intercept) - points[1].y) < tolerance;
    
    if (point1OnLine && point2OnLine) {
      setShowSuccess(true);
    } else {
      setShowSuccess(false);
    }
  }, [slope, intercept]);

  // Convert coordinate system for SVG (flip y-axis)
  const toSVG = (x, y) => {
    const scale = 40;
    const offsetX = 50;
    const offsetY = 250;
    return {
      x: x * scale + offsetX,
      y: offsetY - y * scale
    };
  };

  // Calculate line endpoints
  const getLinePoints = () => {
    const x1 = -1;
    const y1 = slope * x1 + intercept;
    const x2 = 6;
    const y2 = slope * x2 + intercept;
    
    const start = toSVG(x1, y1);
    const end = toSVG(x2, y2);
    
    return { start, end };
  };

  const { start, end } = getLinePoints();

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{textAlign: 'center'}}>Line Fitting Challenge</h1>
        <p className="text-gray-600 mb-6" style={{textAlign: 'center'}}>Adjust the slope and intercept to make the line pass through both points!</p>

        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slope: <span className="font-bold text-indigo-600">{slope.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intercept: <span className="font-bold text-indigo-600">{intercept.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="-2"
              max="10"
              step="0.1"
              value={intercept}
              onChange={(e) => setIntercept(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <svg width="100%" height="300" viewBox="0 0 350 300" className="bg-white rounded">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <React.Fragment key={i}>
                <line
                  x1={toSVG(i, -1).x}
                  y1={toSVG(i, -1).y}
                  x2={toSVG(i, 6).x}
                  y2={toSVG(i, 6).y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <line
                  x1={toSVG(-1, i).x}
                  y1={toSVG(-1, i).y}
                  x2={toSVG(6, i).x}
                  y2={toSVG(6, i).y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              </React.Fragment>
            ))}
            
            {/* Axes */}
            <line x1={toSVG(0, -1).x} y1={toSVG(0, -1).y} x2={toSVG(0, 6).x} y2={toSVG(0, 6).y} stroke="#374151" strokeWidth="2" />
            <line x1={toSVG(-1, 0).x} y1={toSVG(-1, 0).y} x2={toSVG(6, 0).x} y2={toSVG(6, 0).y} stroke="#374151" strokeWidth="2" />
            
            {/* User's line */}
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#6366f1"
              strokeWidth="3"
            />
            
            {/* Target points */}
            {points.map((point, i) => {
              const pos = toSVG(point.x, point.y);
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r="8" fill="#ef4444" />
                  <text x={pos.x + 12} y={pos.y + 5} fontSize="14" fill="#374151" fontWeight="bold">
                    ({point.x}, {point.y})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 w-full" style={{textAlign: 'center'}}>
          <p className="text-sm text-gray-600">Equation: y = {intercept.toFixed(2)} + {slope.toFixed(2)}x</p>
        </div>

        {showSuccess && (
          <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-500 rounded-lg animate-pulse" style={{textAlign: 'center'}}>
            <p className="text-2xl font-bold text-yellow-700">🎉 Success! 🎉</p>
            <p className="text-yellow-600">The line passes through both points!</p>
          </div>
        )}
      </div>
    </div>
  );
}