import React, { useState, useEffect, useRef } from 'react';

const CNNConvolutionDemo: React.FC = () => {
  const sentence = "ALL YOUR BASE";
  const filterSize = 7;
  const [filterPosition, setFilterPosition] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crossCorrelation, setCrossCorrelation] = useState<number>(0);

  // Default filter to "S" pattern
  const getDefaultFilter = (): number[][] => {
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

  const [filter, setFilter] = useState<number[][]>(getDefaultFilter());

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

  // Calculate cross-correlation for all positions
  const calculateAllCorrelations = (grid: number[][], filter: number[][]): number[] => {
    const gridWidth = grid[0]?.length || 0;
    const correlations: number[] = [];
    
    for (let pos = 0; pos <= gridWidth - filterSize; pos++) {
      correlations.push(calculateCrossCorrelation(grid, filter, pos));
    }
    
    return correlations;
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

  const drawPlot = (): void => {
    const canvas = plotCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = sentenceToGrid();
    const correlations = calculateAllCorrelations(grid, filter);
    
    if (correlations.length === 0) return;

    // Match the sentence canvas width
    const sentenceCellSize = 6;
    const sentencePadding = 20;
    const gridWidth = grid[0]?.length || 0;
    const sentenceCanvasWidth = gridWidth * sentenceCellSize + 2 * sentencePadding;
    
    const padding = 40;
    const plotHeight = 150;
    
    // Use the same width as the sentence canvas
    canvas.width = sentenceCanvasWidth;
    canvas.height = plotHeight + 2 * padding;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const maxCorrelation = Math.max(...correlations, 1);
    const minCorrelation = Math.min(...correlations, 0);
    const range = maxCorrelation - minCorrelation || 1;

    // Draw axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * (canvas.height - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw correlation line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const stepX = (canvas.width - 2 * padding) / Math.max(1, correlations.length - 1);
    
    for (let i = 0; i < correlations.length; i++) {
      const x = padding + i * stepX;
      const normalizedValue = (correlations[i] - minCorrelation) / range;
      const y = canvas.height - padding - normalizedValue * (canvas.height - 2 * padding);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#667eea';
    for (let i = 0; i < correlations.length; i++) {
      const x = padding + i * stepX;
      const normalizedValue = (correlations[i] - minCorrelation) / range;
      const y = canvas.height - padding - normalizedValue * (canvas.height - 2 * padding);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Highlight current position
    if (filterPosition < correlations.length) {
      const x = padding + filterPosition * stepX;
      const normalizedValue = (correlations[filterPosition] - minCorrelation) / range;
      const y = canvas.height - padding - normalizedValue * (canvas.height - 2 * padding);
      
      ctx.fillStyle = '#ea4c89';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Position', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Cross-Correlation', 0, 0);
    ctx.restore();

    // Draw Y-axis labels
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    for (let i = 0; i <= 5; i++) {
      const value = minCorrelation + (i / 5) * range;
      const y = padding + (1 - i / 5) * (canvas.height - 2 * padding);
      ctx.fillText(value.toFixed(0), padding - 5, y + 3);
    }
  };

  const toggleFilterCell = (row: number, col: number): void => {
    const newFilter = filter.map((r, i) => 
      r.map((cell, j) => (i === row && j === col) ? (cell === 1 ? 0 : 1) : cell)
    );
    setFilter(newFilter);
  };

  useEffect(() => {
    drawSentence();
    drawPlot();
    
    const grid = sentenceToGrid();
    const correlation = calculateCrossCorrelation(grid, filter, filterPosition);
    setCrossCorrelation(correlation);
  }, [filterPosition, filter]);

  const moveFilter = (direction: 'left' | 'right'): void => {
    const grid = sentenceToGrid();
    const gridWidth = grid[0]?.length || 0;
    
    if (direction === 'left' && filterPosition > 0) {
      setFilterPosition(filterPosition - 1);
    } else if (direction === 'right' && filterPosition + filterSize < gridWidth) {
      setFilterPosition(filterPosition + 1);
    }
  };

  const resetFilter = (): void => {
    setFilter(getDefaultFilter());
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
        {/* Filter display - clickable */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${filterSize}, 1fr)`,
            gap: '2px',
            padding: '10px',
            backgroundColor: '#f9fafb',
            borderRadius: '0.375rem',
            border: '2px solid #e5e7eb'
          }}>
            {filter.map((row, rowIdx) =>
              row.map((cell, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => toggleFilterCell(rowIdx, colIdx)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: cell === 1 ? '#10b981' : '#ffffff',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderRadius: '2px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              ))
            )}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: 600
            }}>
              Filter (Click boxes to edit)
            </span>
            <button
              onClick={resetFilter}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6b7280';
              }}
            >
              Reset to "S"
            </button>
          </div>
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

        {/* Cross-correlation plot */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          marginTop: '1rem'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#374151',
            margin: 0
          }}>
            Cross-Correlation Plot
          </h4>
          <canvas ref={plotCanvasRef} />
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
            <strong>How it works:</strong> Click on the filter boxes above to modify the filter pattern. 
            The filter slides across the sentence "ALL YOUR BASE". At each position, we calculate the 
            cross-correlation by multiplying overlapping values and summing them. The plot below shows 
            the cross-correlation value at every position. Higher values indicate a better match with 
            the filter pattern.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CNNConvolutionDemo;
