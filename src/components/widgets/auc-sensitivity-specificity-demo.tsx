import React, { useMemo, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const PlotComponent = ({ data, layout, config }) => {
  const Plot = require('react-plotly.js').default;
  return <Plot data={data} layout={layout} config={config} />;
};

// Generate imbalanced data (10:1) with AUC ~0.75
// Uses normal distributions on logit scale, then transforms to probabilities
function generateData() {
  const nNegative = 1000; // Majority class
  const nPositive = 100;  // Minority class (10:1 ratio)
  const data: Array<{ predicted: number; actual: number }> = [];

  // Helper: Box-Muller transform for normal random numbers
  const normalRandom = () => {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  // Generate negative class: logit ~ N(-1.5, 0.8), then transform to probability
  // This gives probabilities centered around ~0.18 with good spread
  for (let i = 0; i < nNegative; i++) {
    const logit = -1.5 + normalRandom() * 0.8;
    const prob = 1 / (1 + Math.exp(-logit));
    data.push({ predicted: Math.max(0.01, Math.min(0.99, prob)), actual: 0 });
  }

  // Generate positive class: logit ~ N(-0.5, 0.9), then transform to probability
  // This gives probabilities centered around ~0.38 with more overlap with negative class
  // The reduced separation gives AUC approximately 0.75
  for (let i = 0; i < nPositive; i++) {
    const logit = -0.5 + normalRandom() * 0.9;
    const prob = 1 / (1 + Math.exp(-logit));
    data.push({ predicted: Math.max(0.01, Math.min(0.99, prob)), actual: 1 });
  }

  // Shuffle the data
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }

  return data;
}

// Calculate ROC curve points
function calculateROC(data: Array<{ predicted: number; actual: number }>) {
  // Sort by predicted probability (descending)
  const sorted = [...data].sort((a, b) => b.predicted - a.predicted);
  
  const totalPositive = data.filter(d => d.actual === 1).length;
  const totalNegative = data.filter(d => d.actual === 0).length;
  
  let tp = 0;
  let fp = 0;
  const rocPoints: Array<{ fpr: number; tpr: number; threshold: number }> = [];
  
  // Add point at (0,0)
  rocPoints.push({ fpr: 0, tpr: 0, threshold: 1.01 });
  
  for (const point of sorted) {
    if (point.actual === 1) {
      tp++;
    } else {
      fp++;
    }
    rocPoints.push({
      fpr: fp / totalNegative,
      tpr: tp / totalPositive,
      threshold: point.predicted
    });
  }
  
  // Calculate AUC using trapezoidal rule
  let auc = 0;
  for (let i = 1; i < rocPoints.length; i++) {
    const width = rocPoints[i].fpr - rocPoints[i - 1].fpr;
    const avgHeight = (rocPoints[i].tpr + rocPoints[i - 1].tpr) / 2;
    auc += width * avgHeight;
  }
  
  return { rocPoints, auc };
}

// Calculate confusion matrix and metrics for a given threshold
function calculateMetrics(
  data: Array<{ predicted: number; actual: number }>,
  threshold: number
) {
  let tp = 0; // True Positives
  let fp = 0; // False Positives
  let tn = 0; // True Negatives
  let fn = 0; // False Negatives

  for (const point of data) {
    const predicted = point.predicted >= threshold ? 1 : 0;
    if (predicted === 1 && point.actual === 1) tp++;
    else if (predicted === 1 && point.actual === 0) fp++;
    else if (predicted === 0 && point.actual === 0) tn++;
    else if (predicted === 0 && point.actual === 1) fn++;
  }

  const accuracy = (tp + tn) / data.length;
  const sensitivity = tp / (tp + fn) || 0; // TPR, Recall
  const specificity = tn / (tn + fp) || 0; // TNR
  const ppv = tp / (tp + fp) || 0; // Positive Predictive Value, Precision
  const npv = tn / (tn + fn) || 0; // Negative Predictive Value

  return { tp, fp, tn, fn, accuracy, sensitivity, specificity, ppv, npv };
}

export default function AUCSensitivitySpecificityDemo() {
  // Generate data once on mount
  const data = useMemo(() => generateData(), []);
  const { rocPoints, auc } = useMemo(() => calculateROC(data), [data]);
  
  const [threshold, setThreshold] = useState(0.5);
  
  const metrics = useMemo(
    () => calculateMetrics(data, threshold),
    [data, threshold]
  );

  // Find the point on ROC curve closest to current threshold
  const currentROCPoint = useMemo(() => {
    let closest = rocPoints[0];
    let minDist = Math.abs(closest.threshold - threshold);
    for (const point of rocPoints) {
      const dist = Math.abs(point.threshold - threshold);
      if (dist < minDist) {
        minDist = dist;
        closest = point;
      }
    }
    return closest;
  }, [rocPoints, threshold]);

  // Prepare ROC curve plot data
  const rocPlotData = [
    {
      x: rocPoints.map(p => p.fpr),
      y: rocPoints.map(p => p.tpr),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'ROC Curve',
      line: { color: '#2563eb', width: 2 }
    },
    {
      x: [0, 1],
      y: [0, 1],
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'Random (AUC = 0.5)',
      line: { color: '#9ca3af', width: 1, dash: 'dash' }
    },
    {
      x: [currentROCPoint.fpr],
      y: [currentROCPoint.tpr],
      type: 'scatter' as const,
      mode: 'markers' as const,
      name: `Threshold = ${threshold.toFixed(2)}`,
      marker: { color: '#ef4444', size: 12, symbol: 'circle' }
    }
  ];

  const rocLayout = {
    width: 313,
    height: 313,
    title: {
      text: `ROC Curve (AUC = ${auc.toFixed(3)})`,
      font: { size: 16, color: '#1f2937' }
    },
    xaxis: {
      title: 'False Positive Rate (1 - Specificity)',
      range: [0, 1],
      tickformat: '.2f',
      titlefont: { size: 12 }
    },
    yaxis: {
      title: 'True Positive Rate (Sensitivity)',
      range: [0, 1],
      tickformat: '.2f',
      titlefont: { size: 12 }
    },
    margin: { l: 70, r: 30, t: 60, b: 60 },
    showlegend: false
  };

  return (
    <div
      style={{
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 12,
        padding: 20,
        marginTop: 16,
        marginBottom: 16,
        background: 'var(--ifm-background-color)'
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 18,
          marginBottom: 16,
          color: 'var(--ifm-heading-color)',
          textAlign: 'center'
        }}
      >
        ROC Curve and Classification Metrics
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 20
        }}
      >
        {/* Left: ROC Curve */}
        <div>
          <BrowserOnly>
            {() => (
              <PlotComponent
                data={rocPlotData}
                layout={rocLayout}
                config={{ responsive: true, displayModeBar: false }}
              />
            )}
          </BrowserOnly>
          
          {/* Threshold Slider */}
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}
            >
              <label
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'var(--ifm-heading-color)'
                }}
              >
                Classification Threshold
              </label>
              <span
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                  fontSize: 16,
                  color: 'var(--ifm-color-primary)'
                }}
              >
                {threshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                background: 'var(--ifm-color-emphasis-200)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--ifm-color-emphasis-700)',
                marginTop: 4
              }}
            >
              <span>0.00</span>
              <span>0.50</span>
              <span>1.00</span>
            </div>
          </div>
        </div>

        {/* Right: Confusion Matrix and Metrics */}
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 16,
              textAlign: 'center',
              color: 'var(--ifm-heading-color)'
            }}
          >
            Confusion Matrix
          </div>

          {/* Confusion Matrix */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr 1fr',
              gap: 8,
              marginBottom: 24,
              fontSize: 14
            }}
          >
            {/* Empty corner */}
            <div></div>
            <div
              style={{
                textAlign: 'center',
                fontWeight: 700,
                padding: 8,
                color: 'var(--ifm-heading-color)'
              }}
            >
              Predicted: Positive
            </div>
            <div
              style={{
                textAlign: 'center',
                fontWeight: 700,
                padding: 8,
                color: 'var(--ifm-heading-color)'
              }}
            >
              Predicted: Negative
            </div>

            {/* Actual: Positive row */}
            <div
              style={{
                textAlign: 'right',
                fontWeight: 700,
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                color: 'var(--ifm-heading-color)'
              }}
            >
              Actual: Positive
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: 16,
                backgroundColor: '#dcfce7',
                border: '2px solid #22c55e',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                color: '#166534'
              }}
            >
              {metrics.tp}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  marginTop: 4,
                  color: '#166534'
                }}
              >
                True Positive
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: 16,
                backgroundColor: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                color: '#991b1b'
              }}
            >
              {metrics.fn}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  marginTop: 4,
                  color: '#991b1b'
                }}
              >
                False Negative
              </div>
            </div>

            {/* Actual: Negative row */}
            <div
              style={{
                textAlign: 'right',
                fontWeight: 700,
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                color: 'var(--ifm-heading-color)'
              }}
            >
              Actual: Negative
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: 16,
                backgroundColor: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                color: '#991b1b'
              }}
            >
              {metrics.fp}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  marginTop: 4,
                  color: '#991b1b'
                }}
              >
                False Positive
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: 16,
                backgroundColor: '#dcfce7',
                border: '2px solid #22c55e',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                color: '#166534'
              }}
            >
              {metrics.tn}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  marginTop: 4,
                  color: '#166534'
                }}
              >
                True Negative
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12
            }}
          >
            <div
              style={{
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: 8,
                padding: 12,
                textAlign: 'center',
                backgroundColor: 'var(--ifm-color-emphasis-50)'
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ifm-color-emphasis-700)',
                  marginBottom: 4,
                  fontWeight: 600
                }}
              >
                Accuracy
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--ifm-color-primary)',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div
              style={{
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: 8,
                padding: 12,
                textAlign: 'center',
                backgroundColor: 'var(--ifm-color-emphasis-50)'
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ifm-color-emphasis-700)',
                  marginBottom: 4,
                  fontWeight: 600
                }}
              >
                Sensitivity
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#22c55e',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {(metrics.sensitivity * 100).toFixed(1)}%
              </div>
            </div>
            <div
              style={{
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: 8,
                padding: 12,
                textAlign: 'center',
                backgroundColor: 'var(--ifm-color-emphasis-50)'
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ifm-color-emphasis-700)',
                  marginBottom: 4,
                  fontWeight: 600
                }}
              >
                Specificity
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#22c55e',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {(metrics.specificity * 100).toFixed(1)}%
              </div>
            </div>
            <div
              style={{
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: 8,
                padding: 12,
                textAlign: 'center',
                backgroundColor: 'var(--ifm-color-emphasis-50)'
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ifm-color-emphasis-700)',
                  marginBottom: 4,
                  fontWeight: 600
                }}
              >
                PPV
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#3b82f6',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {(metrics.ppv * 100).toFixed(1)}%
              </div>
            </div>
            <div
              style={{
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: 8,
                padding: 12,
                textAlign: 'center',
                backgroundColor: 'var(--ifm-color-emphasis-50)'
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ifm-color-emphasis-700)',
                  marginBottom: 4,
                  fontWeight: 600
                }}
              >
                NPV
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#3b82f6',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {(metrics.npv * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Metric definitions */}
          <div
            style={{
              marginTop: 16,
              fontSize: 12,
              color: 'var(--ifm-color-emphasis-700)',
              lineHeight: 1.6
            }}
          >
            <div>
              <strong>Accuracy:</strong> (TP + TN) / Total ={' '}
              {metrics.tp + metrics.tn} / {data.length}
            </div>
            <div>
              <strong>Sensitivity (Recall):</strong> TP / (TP + FN) = {metrics.tp} /{' '}
              {metrics.tp + metrics.fn}
            </div>
            <div>
              <strong>Specificity:</strong> TN / (TN + FP) = {metrics.tn} /{' '}
              {metrics.tn + metrics.fp}
            </div>
            <div>
              <strong>PPV (Positive Predictive Value):</strong> TP / (TP + FP) = {metrics.tp} /{' '}
              {metrics.tp + metrics.fp}
            </div>
            <div>
              <strong>NPV (Negative Predictive Value):</strong> TN / (TN + FN) = {metrics.tn} /{' '}
              {metrics.tn + metrics.fn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
