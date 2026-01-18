import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function NEDOCSCalculator() {
  // State for ED variables
  const [totalPatients, setTotalPatients] = useState(30);
  const [edBeds, setEdBeds] = useState(20);
  const [hospitalBeds, setHospitalBeds] = useState(200);
  const [admits, setAdmits] = useState(8);
  const [ventilatorPatients, setVentilatorPatients] = useState(2);
  const [waitTimeToBed, setWaitTimeToBed] = useState(2);
  const [longestAdmitWait, setLongestAdmitWait] = useState(4);
  
  // NEDOCS calculation using the official formula
  const calculateNEDOCS = () => {
    const term1 = (totalPatients / edBeds) * 85.8;
    const term2 = (admits / hospitalBeds) * 600;
    const term3 = waitTimeToBed * 5.64;
    const term4 = longestAdmitWait * 0.93;
    const term5 = ventilatorPatients * 13.4;
    
    return Math.round(term1 + term2 + term3 + term4 + term5);
  };
  
  const nedocsScore = calculateNEDOCS();
  
  // Determine crowding level
  const getCrowdingLevel = (score) => {
    if (score < 50) return { level: 'Not Busy', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < 100) return { level: 'Busy', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score < 150) return { level: 'Overcrowded', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (score < 200) return { level: 'Severely Overcrowded', color: 'text-red-600', bg: 'bg-red-100' };
    return { level: 'Dangerously Overcrowded', color: 'text-red-800', bg: 'bg-red-200' };
  };
  
  const crowdingStatus = getCrowdingLevel(nedocsScore);
  
  // Generate data for visualization
  const generateTrendData = () => {
    const data = [];
    for (let patients = 0; patients <= 150; patients += 5) {
      const term1 = (patients / edBeds) * 85.8;
      const term2 = (admits / hospitalBeds) * 600;
      const term3 = waitTimeToBed * 5.64;
      const term4 = longestAdmitWait * 0.93;
      const term5 = ventilatorPatients * 13.4;
      const tempScore = Math.round(term1 + term2 + term3 + term4 + term5);
      data.push({
        patients,
        nedocs: tempScore,
        current: Math.abs(patients - totalPatients) < 3 // Match within range for visibility
      });
    }
    return data;
  };
  
  const chartData = generateTrendData();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">NEDOCS Score Calculator</h2>
        <p className="text-gray-600">National Emergency Department Overcrowding Scale - Linear Regression Model</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold text-gray-700 mb-3">Emergency Department Parameters</h3>
            
            {/* ED Beds */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of ED Beds: <span className="text-blue-600 font-bold">{edBeds}</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={edBeds}
                onChange={(e) => setEdBeds(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Hospital Beds */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Hospital Beds: <span className="text-blue-600 font-bold">{hospitalBeds}</span>
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={hospitalBeds}
                onChange={(e) => setHospitalBeds(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Admits */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admits (Boarders): <span className="text-blue-600 font-bold">{admits}</span>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={admits}
                onChange={(e) => setAdmits(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Ventilator Patients */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ventilator Patients: <span className="text-blue-600 font-bold">{ventilatorPatients}</span>
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={ventilatorPatients}
                onChange={(e) => setVentilatorPatients(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Wait Time to Bed */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wait Time to Bed: <span className="text-blue-600 font-bold">{waitTimeToBed} hours</span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={waitTimeToBed}
                onChange={(e) => setWaitTimeToBed(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Longest Admit Wait */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longest Admit Wait: <span className="text-blue-600 font-bold">{longestAdmitWait} hours</span>
              </label>
              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={longestAdmitWait}
                onChange={(e) => setLongestAdmitWait(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Total Patients */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Patients in ED: <span className="text-blue-600 font-bold">{totalPatients}</span>
              </label>
              <input
                type="range"
                min="0"
                max="150"
                value={totalPatients}
                onChange={(e) => setTotalPatients(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* NEDOCS Score Display */}
          <div className={`${crowdingStatus.bg} p-4 rounded-lg border-2 border-gray-300`}>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">NEDOCS Score</p>
              <p className="text-4xl font-bold text-gray-800 mb-1">{nedocsScore}</p>
              <p className={`text-lg font-semibold ${crowdingStatus.color}`}>
                {crowdingStatus.level}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Visualization */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold text-gray-700 mb-3">NEDOCS vs Total Patients</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="patients" 
                  label={{ value: 'Total Patients', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'NEDOCS Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="3 3" label="Busy" />
                <ReferenceLine y={100} stroke="#eab308" strokeDasharray="3 3" label="Overcrowded" />
                <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" label="Severe" />
                <ReferenceLine y={200} stroke="#dc2626" strokeDasharray="3 3" label="Dangerous" />
                <Line 
                  type="monotone" 
                  dataKey="nedocs" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (payload.current) {
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={6} 
                          fill="#ef4444" 
                          stroke="#fff" 
                          strokeWidth={2}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Red dot shows current configuration
            </p>
          </div>

          {/* Formula Display */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
            <h4 className="font-semibold text-gray-700 mb-2">Complete Linear Regression Equation:</h4>
            <div className="bg-white p-2 rounded border border-gray-300 mb-2 overflow-x-auto">
              <p className="font-mono text-xs break-all">
                NEDOCS = 85.8×(TP/EDB) + 600×(A/HB) + 5.64×(WTB) + 0.93×(LAW) + 13.4×(VP)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                TP=Total ED Patients, EDB=ED Beds, A=Admits, HB=Hospital Beds, WTB=Wait Time to Bed, LAW=Longest Admit Wait, VP=Ventilator Patients
              </p>
            </div>
            <h4 className="font-semibold text-gray-700 mb-1">Current Calculation:</h4>
            <div className="space-y-1 text-gray-600 font-mono overflow-x-auto">
              <p className="break-all">= {((totalPatients/edBeds) * 85.8).toFixed(1)} + {((admits/hospitalBeds) * 600).toFixed(1)} + {(waitTimeToBed * 5.64).toFixed(1)} + {(longestAdmitWait * 0.93).toFixed(1)} + {(ventilatorPatients * 13.4).toFixed(1)}</p>
              <p className="pt-1 border-t border-gray-300 font-bold text-sm">= {nedocsScore}</p>
            </div>
          </div>

          {/* Learning Points */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold text-gray-700 mb-2">Key Concepts:</h3>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Linear Relationship:</strong> NEDOCS increases linearly as ED parameters worsen</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Weighted Components:</strong> Each variable has a different coefficient (weight)</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Predictive Value:</strong> The model helps predict crowding levels for staffing decisions</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Clinical Utility:</strong> Scores guide interventions like diversion protocols</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}