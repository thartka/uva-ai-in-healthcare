import React, { useState } from 'react';

interface ImagePairProps {
  originalImage: string;
  heatmapImage: string;
  caption: string;
  revealPercentage: number;
  onRevealChange: (value: number) => void;
}

const ImagePair: React.FC<ImagePairProps> = ({
  originalImage,
  heatmapImage,
  caption,
  revealPercentage,
  onRevealChange
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '350px'
      }}>
        {/* Image container */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '300px',
          aspectRatio: '1',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          flex: 1
        }}>
          {/* Original image */}
          <img
            src={originalImage}
            alt={`${caption} original`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          
          {/* Heatmap overlay with reveal effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            clipPath: `inset(0 ${100 - revealPercentage}% 0 0)`,
            transition: 'clip-path 0.1s ease-out'
          }}>
            <img
              src={heatmapImage}
              alt={`${caption} heatmap`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.5,
                display: 'block'
              }}
            />
          </div>
        </div>
        
        {/* Caption */}
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#374151',
          textTransform: 'capitalize',
          minWidth: '80px'
        }}>
          {caption}
        </div>
      </div>
      
      {/* Slider */}
      <div style={{
        width: '100%',
        maxWidth: '300px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transform: 'translateX(-15%)'
      }}>
        <span style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          minWidth: '60px'
        }}>
          Original
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={revealPercentage}
          onChange={(e) => onRevealChange(Number(e.target.value))}
          style={{
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            background: '#e5e7eb',
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
          className="slider"
        />
        <span style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          minWidth: '60px',
          textAlign: 'right'
        }}>
          Heatmap
        </span>
      </div>
    </div>
  );
};

const SaliencyMapReveal: React.FC = () => {
  const [lionReveal, setLionReveal] = useState(0);
  const [dogReveal, setDogReveal] = useState(0);
  const [birdReveal, setBirdReveal] = useState(0);

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
        marginBottom: '2rem',
        fontSize: '1.5rem',
        textAlign: 'center'
      }}>
        Saliency Map Visualization
      </h3>
      
      <ImagePair
        originalImage="/img/lion-original.jpg"
        heatmapImage="/img/lion-heatmap.jpg"
        caption="lion"
        revealPercentage={lionReveal}
        onRevealChange={setLionReveal}
      />
      
      <ImagePair
        originalImage="/img/dog-original.jpg"
        heatmapImage="/img/dog-heatmap.jpg"
        caption="dog"
        revealPercentage={dogReveal}
        onRevealChange={setDogReveal}
      />
      
      <ImagePair
        originalImage="/img/bird-original.jpg"
        heatmapImage="/img/bird-heatmap.jpg"
        caption="bird"
        revealPercentage={birdReveal}
        onRevealChange={setBirdReveal}
      />
    </div>
  );
};

export default SaliencyMapReveal;
