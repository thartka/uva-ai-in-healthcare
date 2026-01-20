import React, { useState, useEffect, useRef } from 'react';

const CNNConvolutionDemo: React.FC = () => {
  const sentence = "ALL YOUR BASE";
  const filterSize = 7;
  const [filterPosition, setFilterPosition] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crossCorrelation, setCrossCorrelation] = useState<number>(0);

  // Create a higher resolution "S" pattern filter (7x7)
  const createFilter = (): number[][] => {
    return [
      [0, 0, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 0, 0]
    ];
  };

  // Convert sentence to a binary grid representation
  // Each character is represented as a 7x7 grid where 1 = character pixel, 0 = background
  const sentenceToGrid = (): number[][] => {
    const grid: number[][] = [];
    const charWidth = 7;
    const spacing = 1;
    
    for (let i = 0; i < sentence.length; i++) {
      const char = sentence[i];
      if (char === ' ') {
        // Add spacing
        for (let row = 0; row < 7; row++) {
          if (!grid[row]) grid[row] = [];
          for (let col = 0; col < spacing; col++) {
            grid[row].push(0);
          }
        }
      } else {
        // Create a higher resolution character representation
        const charPattern = getCharPattern(char);
        for (let row = 0; row < 7; row++) {
          if (!grid[row]) grid[row] = [];
          for (let col = 0; col < charWidth; col++) {
            grid[row].push(charPattern[row][col]);
          }
        }
      }
    }
    
    return grid;
  };

  // Get a higher resolution pattern for each character (7x7)
  const getCharPattern = (char: string): number[][] => {
    const patterns: { [key: string]: number[][] } = {
      'A': [
        [0,0,1,1,1,0,0],
        [0,1,0,0,0,1,0],
        [1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1]
      ],
      'L': [
        [1,0,0,0,0,0,0],
        [1,0,0,0,0,0,0],
        [1,0,0,0,0,0,0],
        [1,0,0,0,0,0,0],
        [1,0,0,0,0,0,0],
        [1,0,0,0,0,0,0],
        [1,1,1,1,1,1,1]
      ],
      'Y': [
        [1,0,0,0,0,0,1],
        [0,1,0,0,0,1,0],
        [0,0,1,0,1,0,0],
        [0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0]
      ],
      'O': [
        [0,0,1,1,1,0,0],
        [0,1,0,0,0,1,0],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1],
        [0,1,0,0,0,1,0],
        [0,0,1,1,1,0,0]
      ],
      'U': [
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1],
        [0,1,0,0,0,1,0],
        [0,0,1,1,1,0,0]
      ],
      'R': [
        [1,1,1,1,1,0,0],
        [1,0,0,0,0,1,0],
        [1,0,0,0,0,1,0],
        [1,1,1,1,1,0,0],
        [1,0,0,1,0,0,0],
        [1,0,0,0,1,0,0],
        [1,0,0,0,0,1,0]
      ],
      'B': [
        [1,1,1,1,1,0,0],
        [1,0,0,0,0,1,0],
        [1,0,0,0,0,1,0],
        [1,1,1,1,1,0,0],
        [1,0,0,0,0,1,0],
        [1,0,0,0,0,1,0],
        [1,1,1,1,1,0,0]
      ],
      'S': [
        [0,0,1,1,1,1,0],
        [0,1,0,0,0,0,0],
        [1,0,0,0,0,0,0],
        [0,1,1,1,1,0,0],
        [0,0,0,0,0,0,1],
        [0,0,0,0,0,1,0],
        [1,1,1,1,1,0,0]
      ],
      'E': [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0],
        [1,0,0,0,0,0,0],
        [1,1,1,1,1,0,0],
        [1,0,0,0,0,0,0],
        [1,0,0,0,0,0,0],
        [1,1,1,1,1,1,1]
      ]
    };
    
    return patterns[char] || [
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0]
    ];
  };

  // Calculate cross-correlation at current position
  const calculateCrossCorrelation = (grid: number[][], filter: number[][], position: number): number => {
    let sum = 0;
    const gridWidth = grid[0]?.length || 0;
    
    if (position + filterSize > gridWidth) {
      return 0;
    }
    
    for (let i = 0; i < filterSize; i++) {
      for (let j = 0; j < filterSize; j++) {
        const gridRow = i;
        const gridCol = position + j;
        if (gridRow < grid.length && gridCol < gridWidth) {
          sum += grid[gridRow][gridCol] * filter[i][j];
        }
      }
    }
    
    return sum;
  };

  const drawSentence = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = sentenceToGrid();
    const cellSize = 6;
    const padding = 20;
    const gridWidth = grid[0]?.length || 0;
    const gridHeight = grid.length;

    canvas.width = gridWidth * cellSize + 2 * padding;
    canvas.height = gridHeight * cellSize + 2 * padding;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const x = padding + col * cellSize;
        const y = padding + row * cellSize;
        
        // Draw cell background
        ctx.fillStyle = grid[row][col] === 1 ? '#667eea' : '#ffffff';
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // Draw border
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }

    // Highlight the filter position
    if (filterPosition + filterSize <= gridWidth) {
      ctx.strokeStyle = '#ea4c89';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        padding + filterPosition * cellSize - 2,
        padding - 2,
        filterSize * cellSize + 4,
        filterSize * cellSize + 4
      );
      ctx.setLineDash([]);
    }

    // Draw position indicator
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Position: ${filterPosition}`, canvas.width / 2, canvas.height - 5);
  };

  const drawFilter = (): void => {
    const canvas = filterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const filter = createFilter();
    const cellSize = 15;
    const padding = 10;
    const labelHeight = 25;
    const size = filterSize * cellSize + 2 * padding;

    canvas.width = size;
    canvas.height = size + labelHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw filter
    for (let row = 0; row < filterSize; row++) {
      for (let col = 0; col < filterSize; col++) {
        const x = padding + col * cellSize;
        const y = padding + row * cellSize;
        
        ctx.fillStyle = filter[row][col] === 1 ? '#10b981' : '#ffffff';
        ctx.fillRect(x, y, cellSize, cellSize);
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }

    // Draw label
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Filter (S)', canvas.width / 2, size + 18);
  };

  useEffect(() => {
    drawSentence();
    drawFilter();
    
    const grid = sentenceToGrid();
    const filter = createFilter();
    const correlation = calculateCrossCorrelation(grid, filter, filterPosition);
    setCrossCorrelation(correlation);
  }, [filterPosition]);

  const moveFilter = (direction: 'left' | 'right'): void => {
    const grid = sentenceToGrid();
    const gridWidth = grid[0]?.length || 0;
    
    if (direction === 'left' && filterPosition > 0) {
      setFilterPosition(filterPosition - 1);
    } else if (direction === 'right' && filterPosition + filterSize < gridWidth) {
      setFilterPosition(filterPosition + 1);
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginTop: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{
        color: '#667eea',
        fontWeight: 600,
        marginBottom: '1.5rem',
        fontSize: '1.25rem',
        textAlign: 'center'
      }}>
        CNN Convolution: Detecting the Letter "S"
      </h3>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {/* Filter display */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <canvas ref={filterCanvasRef} />
        </div>

        {/* Sentence with filter overlay */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <canvas ref={canvasRef} />
          
          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => moveFilter('left')}
              disabled={filterPosition === 0}
              style={{
                backgroundColor: filterPosition === 0 ? '#d1d5db' : '#667eea',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: filterPosition === 0 ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: filterPosition === 0 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (filterPosition > 0) {
                  e.currentTarget.style.backgroundColor = '#5568d3';
                }
              }}
              onMouseLeave={(e) => {
                if (filterPosition > 0) {
                  e.currentTarget.style.backgroundColor = '#667eea';
                }
              }}
            >
              ← Move Left
            </button>
            
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '1rem 2rem',
              borderRadius: '0.375rem',
              minWidth: '200px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>
                Cross-Correlation
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#667eea'
              }}>
                {crossCorrelation}
              </div>
            </div>
            
            <button
              onClick={() => moveFilter('right')}
              disabled={filterPosition + filterSize >= (sentenceToGrid()[0]?.length || 0)}
              style={{
                backgroundColor: filterPosition + filterSize >= (sentenceToGrid()[0]?.length || 0) ? '#d1d5db' : '#667eea',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: filterPosition + filterSize >= (sentenceToGrid()[0]?.length || 0) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: filterPosition + filterSize >= (sentenceToGrid()[0]?.length || 0) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                const grid = sentenceToGrid();
                if (filterPosition + filterSize < (grid[0]?.length || 0)) {
                  e.currentTarget.style.backgroundColor = '#5568d3';
                }
              }}
              onMouseLeave={(e) => {
                const grid = sentenceToGrid();
                if (filterPosition + filterSize < (grid[0]?.length || 0)) {
                  e.currentTarget.style.backgroundColor = '#667eea';
                }
              }}
            >
              Move Right →
            </button>
          </div>
        </div>

        {/* Explanation */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.375rem',
          border: '1px solid #bae6fd',
          maxWidth: '600px',
          marginTop: '0.5rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#1e40af',
            margin: 0,
            lineHeight: '1.6'
          }}>
            <strong>How it works:</strong> The filter (shown above) slides across the sentence. 
            At each position, we calculate the cross-correlation by multiplying overlapping values 
            and summing them. Higher values indicate a better match with the "S" pattern.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CNNConvolutionDemo;
