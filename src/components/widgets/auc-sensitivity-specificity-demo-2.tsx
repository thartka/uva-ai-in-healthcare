import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const AUCDemo = () => {
  const [threshold, setThreshold] = useState(0.5);

  // Generate imbalanced dataset (10:1 ratio) with AUC ~0.8
  const data = useMemo(() => {
    const samples = [];
    const totalSamples = 1100;
    const positiveCount = 100;
    const negativeCount = 1000;

    // Generate positive samples (actual = 1) with higher predicted probabilities
    for (let i = 0; i < positiveCount; i++) {
      // Beta distribution for positives: higher probabilities
      const u1 = Math.random();
      const u2 = Math.random();
      const randNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      let prob = 0.65 + randNormal * 0.22;
      prob = Math.max(0.01, Math.min(0.99, prob));
      samples.push({ predicted: prob, actual: 1 });
    }

    // Generate negative samples (actual = 0) with lower predicted probabilities
    for (let i = 0; i < negativeCount; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const randNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      let prob = 0.35 + randNormal * 0.22;
      prob = Math.max(0.01, Math.min(0.99, prob));
      samples.push({ predicted: prob, actual: 0 });
    }

    return samples;
  }, []);

  // Calculate ROC curve points
  const rocData = useMemo(() => {
    const thresholds = [];
    for (let i = 0; i <= 100; i++) {
      thresholds.push(i / 100);
    }

    const points = thresholds.map(t => {
      const tp = data.filter(d => d.predicted >= t && d.actual === 1).length;
      const fn = data.filter(d => d.predicted < t && d.actual === 1).length;
      const fp = data.filter(d => d.predicted >= t && d.actual === 0).length;
      const tn = data.filter(d => d.predicted < t && d.actual === 0).length;

      const tpr = tp + fn > 0 ? tp / (tp + fn) : 0;
      const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;

      return { fpr, tpr, threshold: t };
    });

    return points.sort((a, b) => a.fpr - b.fpr);
  }, [data]);

  // Calculate AUC using trapezoidal rule
  const auc = useMemo(() => {
    let area = 0;
    for (let i = 1; i < rocData.length; i++) {
      const width = rocData[i].fpr - rocData[i - 1].fpr;
      const height = (rocData[i].tpr + rocData[i - 1].tpr) / 2;
      area += width * height;
    }
    return area;
  }, [rocData]);

  // Calculate confusion matrix at current threshold
  const confusionMatrix = useMemo(() => {
    const tp = data.filter(d => d.predicted >= threshold && d.actual === 1).length;
    const fn = data.filter(d => d.predicted < threshold && d.actual === 1).length;
    const fp = data.filter(d => d.predicted >= threshold && d.actual === 0).length;
    const tn = data.filter(d => d.predicted < threshold && d.actual === 0).length;

    const sensitivity = tp + fn > 0 ? tp / (tp + fn) : 0;
    const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;
    const accuracy = (tp + tn) / (tp + tn + fp + fn);

    return { tp, fn, fp, tn, sensitivity, specificity, accuracy };
  }, [data, threshold]);

  // Find current point on ROC curve
  const currentRocPoint = useMemo(() => {
    const { tp, fn, fp, tn } = confusionMatrix;
    const tpr = tp + fn > 0 ? tp / (tp + fn) : 0;
    const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
    return { fpr, tpr };
  }, [confusionMatrix]);

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex gap-4 mb-8 justify-center flex-wrap">
        {/* ROC Curve */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">ROC Curve (AUC = {auc.toFixed(3)})</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fpr" 
                type="number"
                label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
                domain={[0, 1]}
              />
              <YAxis 
                label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
                domain={[0, 1]}
              />
              <Tooltip formatter={(value) => value.toFixed(3)} />
              <Legend />
              <Line 
                data={rocData}
                type="monotone" 
                dataKey="tpr" 
                stroke="#2563eb" 
                name="ROC Curve"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line 
                data={[{fpr: 0, tpr: 0}, {fpr: 1, tpr: 1}]} 
                type="monotone" 
                dataKey="tpr"
                stroke="#9ca3af" 
                strokeDasharray="5 5"
                name="Random Classifier"
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceLine 
                x={currentRocPoint.fpr} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <ReferenceLine 
                y={currentRocPoint.tpr} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classification Threshold: {threshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.00</span>
              <span>0.50</span>
              <span>1.00</span>
            </div>
          </div>
        </div>

        {/* Confusion Matrix and Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Confusion Matrix</h2>
          
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
              <div></div>
              <div className="text-center font-semibold text-xs text-gray-600">Pred Pos</div>
              <div className="text-center font-semibold text-xs text-gray-600">Pred Neg</div>
              
              <div className="text-right font-semibold text-xs text-gray-600 flex items-center justify-end pr-1">
                Act Pos
              </div>
              <div className="bg-green-100 border-2 border-green-500 p-3 text-center rounded">
                <div className="text-lg font-bold text-green-700">{confusionMatrix.tp}</div>
                <div className="text-xs text-green-600 mt-0.5">TP</div>
              </div>
              <div className="bg-red-100 border-2 border-red-500 p-3 text-center rounded">
                <div className="text-lg font-bold text-red-700">{confusionMatrix.fn}</div>
                <div className="text-xs text-red-600 mt-0.5">FN</div>
              </div>
              
              <div className="text-right font-semibold text-xs text-gray-600 flex items-center justify-end pr-1">
                Act Neg
              </div>
              <div className="bg-red-100 border-2 border-red-500 p-3 text-center rounded">
                <div className="text-lg font-bold text-red-700">{confusionMatrix.fp}</div>
                <div className="text-xs text-red-600 mt-0.5">FP</div>
              </div>
              <div className="bg-green-100 border-2 border-green-500 p-3 text-center rounded">
                <div className="text-lg font-bold text-green-700">{confusionMatrix.tn}</div>
                <div className="text-xs text-green-600 mt-0.5">TN</div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-sm">Sensitivity (TPR):</span>
                <span className="text-lg font-bold text-blue-600">
                  {(confusionMatrix.sensitivity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                TP / (TP + FN) = {confusionMatrix.tp} / {confusionMatrix.tp + confusionMatrix.fn}
              </div>
            </div>

            <div className="bg-purple-50 p-2 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-sm">Specificity (TNR):</span>
                <span className="text-lg font-bold text-purple-600">
                  {(confusionMatrix.specificity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                TN / (TN + FP) = {confusionMatrix.tn} / {confusionMatrix.tn + confusionMatrix.fp}
              </div>
            </div>

            <div className="bg-green-50 p-2 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-sm">Accuracy:</span>
                <span className="text-lg font-bold text-green-600">
                  {(confusionMatrix.accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                (TP + TN) / Total = {confusionMatrix.tp + confusionMatrix.tn} / {confusionMatrix.tp + confusionMatrix.tn + confusionMatrix.fp + confusionMatrix.fn}
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="text-xs text-gray-600">
                <strong>Dataset:</strong> 1,100 samples (100 pos, 1,000 neg), Ratio: 10:1
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden">
        <pre id="tsx-code">{`import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const AUCDemo = () => {
  const [threshold, setThreshold] = useState(0.5);

  // Generate imbalanced dataset (10:1 ratio) with AUC ~0.8
  const data = useMemo(() => {
    const samples = [];
    const totalSamples = 1100;
    const positiveCount = 100;
    const negativeCount = 1000;

    // Generate positive samples (actual = 1) with higher predicted probabilities
    for (let i = 0; i < positiveCount; i++) {
      // Beta distribution for positives: higher probabilities
      const u1 = Math.random();
      const u2 = Math.random();
      const randNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      let prob = 0.65 + randNormal * 0.22;
      prob = Math.max(0.01, Math.min(0.99, prob));
      samples.push({ predicted: prob, actual: 1 });
    }

    // Generate negative samples (actual = 0) with lower predicted probabilities
    for (let i = 0; i < negativeCount; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const randNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      let prob = 0.35 + randNormal * 0.22;
      prob = Math.max(0.01, Math.min(0.99, prob));
      samples.push({ predicted: prob, actual: 0 });
    }

    return samples;
  }, []);

  // Calculate ROC curve points
  const rocData = useMemo(() => {
    const thresholds = [];
    for (let i = 0; i <= 100; i++) {
      thresholds.push(i / 100);
    }

    const points = thresholds.map(t => {
      const tp = data.filter(d => d.predicted >= t && d.actual === 1).length;
      const fn = data.filter(d => d.predicted < t && d.actual === 1).length;
      const fp = data.filter(d => d.predicted >= t && d.actual === 0).length;
      const tn = data.filter(d => d.predicted < t && d.actual === 0).length;

      const tpr = tp + fn > 0 ? tp / (tp + fn) : 0;
      const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;

      return { fpr, tpr, threshold: t };
    });

    return points.sort((a, b) => a.fpr - b.fpr);
  }, [data]);

  // Calculate AUC using trapezoidal rule
  const auc = useMemo(() => {
    let area = 0;
    for (let i = 1; i < rocData.length; i++) {
      const width = rocData[i].fpr - rocData[i - 1].fpr;
      const height = (rocData[i].tpr + rocData[i - 1].tpr) / 2;
      area += width * height;
    }
    return area;
  }, [rocData]);

  // Calculate confusion matrix at current threshold
  const confusionMatrix = useMemo(() => {
    const tp = data.filter(d => d.predicted >= threshold && d.actual === 1).length;
    const fn = data.filter(d => d.predicted < threshold && d.actual === 1).length;
    const fp = data.filter(d => d.predicted >= threshold && d.actual === 0).length;
    const tn = data.filter(d => d.predicted < threshold && d.actual === 0).length;

    const sensitivity = tp + fn > 0 ? tp / (tp + fn) : 0;
    const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;

    return { tp, fn, fp, tn, sensitivity, specificity };
  }, [data, threshold]);

  // Find current point on ROC curve
  const currentRocPoint = useMemo(() => {
    const { tp, fn, fp, tn } = confusionMatrix;
    const tpr = tp + fn > 0 ? tp / (tp + fn) : 0;
    const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
    return { fpr, tpr };
  }, [confusionMatrix]);

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AUC and Classification Metrics Demo</h1>
        <p className="text-gray-600">Interactive demonstration of ROC curve, AUC, and confusion matrix metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* ROC Curve */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">ROC Curve (AUC = {auc.toFixed(3)})</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fpr" 
                label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
                domain={[0, 1]}
              />
              <YAxis 
                label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
                domain={[0, 1]}
              />
              <Tooltip formatter={(value) => value.toFixed(3)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="tpr" 
                stroke="#2563eb" 
                name="ROC Curve"
                dot={false}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                data={[{fpr: 0, tpr: 0}, {fpr: 1, tpr: 1}]} 
                dataKey="tpr"
                stroke="#9ca3af" 
                strokeDasharray="5 5"
                name="Random Classifier"
                dot={false}
              />
              <ReferenceLine 
                x={currentRocPoint.fpr} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <ReferenceLine 
                y={currentRocPoint.tpr} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classification Threshold: {threshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.00</span>
              <span>0.50</span>
              <span>1.00</span>
            </div>
          </div>
        </div>

        {/* Confusion Matrix and Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Confusion Matrix</h2>
          
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
              <div></div>
              <div className="text-center font-semibold text-sm text-gray-600">Predicted Positive</div>
              <div className="text-center font-semibold text-sm text-gray-600">Predicted Negative</div>
              
              <div className="text-right font-semibold text-sm text-gray-600 flex items-center justify-end">
                Actual Positive
              </div>
              <div className="bg-green-100 border-2 border-green-500 p-6 text-center rounded">
                <div className="text-2xl font-bold text-green-700">{confusionMatrix.tp}</div>
                <div className="text-xs text-green-600 mt-1">True Positive</div>
              </div>
              <div className="bg-red-100 border-2 border-red-500 p-6 text-center rounded">
                <div className="text-2xl font-bold text-red-700">{confusionMatrix.fn}</div>
                <div className="text-xs text-red-600 mt-1">False Negative</div>
              </div>
              
              <div className="text-right font-semibold text-sm text-gray-600 flex items-center justify-end">
                Actual Negative
              </div>
              <div className="bg-red-100 border-2 border-red-500 p-6 text-center rounded">
                <div className="text-2xl font-bold text-red-700">{confusionMatrix.fp}</div>
                <div className="text-xs text-red-600 mt-1">False Positive</div>
              </div>
              <div className="bg-green-100 border-2 border-green-500 p-6 text-center rounded">
                <div className="text-2xl font-bold text-green-700">{confusionMatrix.tn}</div>
                <div className="text-xs text-green-600 mt-1">True Negative</div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Sensitivity (Recall / TPR):</span>
                <span className="text-2xl font-bold text-blue-600">
                  {(confusionMatrix.sensitivity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                TP / (TP + FN) = {confusionMatrix.tp} / {confusionMatrix.tp + confusionMatrix.fn}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Specificity (TNR):</span>
                <span className="text-2xl font-bold text-purple-600">
                  {(confusionMatrix.specificity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                TN / (TN + FP) = {confusionMatrix.tn} / {confusionMatrix.tn + confusionMatrix.fp}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <strong>Dataset:</strong> 1,100 samples (100 positive, 1,000 negative)
                <br />
                <strong>Imbalance ratio:</strong> 10:1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AUCDemo;`}</pre>
      </div>
    </div>
  );
};

export default AUCDemo;