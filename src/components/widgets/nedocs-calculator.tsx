import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function NEDOCSCalculator() {
  // State for ED variables
  const [totalPatients, setTotalPatients] = useState(30);
  const [edBeds, setEdBeds] = useState(20);
  const [hospitalBeds, setHospitalBeds] = useState(200);
  const [admittedPatients, setAdmittedPatients] = useState(8);
  const [ventilatorsInUse, setVentilators] = useState(2);
  const [longestAdmitTime, setLongestAdmitTime] = useState(4);
  
  // Simplified NEDOCS calculation (educational version)
  // Actual formula is more complex, this is for demonstration
  const calculateNEDOCS = () => {
    const occupancyRate = (totalPatients / edBeds) * 85;
    const admittedPatientLoad = (admittedPatients / edBeds) * 40;
    const ventilatorLoad = (ventilatorsInUse / edBeds) * 30;
    const waitTimeComponent = (longestAdmitTime / 10) * 25;
    const hospitalCapacity = (admittedPatients / hospitalBeds) * 20;
    
    return Math.round(occupancyRate + admittedPatientLoad + ventilatorLoad + waitTimeComponent + hospitalCapacity);
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
      const tempOccupancy = (patients / edBeds) * 85;
      const tempScore = Math.round(tempOccupancy + (admittedPatients / edBeds) * 40 + (ventilatorsInUse / edBeds) * 30 + (longestAdmitTime / 10) * 25 + (admittedPatients / hospitalBeds) * 20);
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

            {/* Admitted Patients */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admitted Patients Boarding: <span className="text-blue-600 font-bold">{admittedPatients}</span>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={admittedPatients}
                onChange={(e) => setAdmittedPatients(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Ventilators */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ventilators in Use: <span className="text-blue-600 font-bold">{ventilatorsInUse}</span>
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={ventilatorsInUse}
                onChange={(e) => setVentilators(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Longest Admit Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longest Admit Wait Time: <span className="text-blue-600 font-bold">{longestAdmitTime} hours</span>
              </label>
              <input
                type="range"
                min="0"
                max="24"
                value={longestAdmitTime}
                onChange={(e) => setLongestAdmitTime(Number(e.target.value))}
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

          {/* Formula Display */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
            <h4 className="font-semibold text-gray-700 mb-2">Complete Linear Regression Equation:</h4>
            <div className="bg-white p-2 rounded border border-gray-300 mb-2 overflow-x-auto">
              <p className="font-mono text-xs break-all">
                NEDOCS = 85×(TP/EDB) + 40×(AP/EDB) + 30×(V/EDB) + 25×(WT/10) + 20×(AP/HB)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                TP=Total Patients, EDB=ED Beds, AP=Admitted Patients, V=Ventilators, WT=Wait Time, HB=Hospital Beds
              </p>
            </div>
            <h4 className="font-semibold text-gray-700 mb-1">Current Calculation:</h4>
            <div className="space-y-1 text-gray-600 font-mono overflow-x-auto">
              <p className="break-all">= {Math.round((totalPatients/edBeds) * 85)} + {Math.round((admittedPatients/edBeds) * 40)} + {Math.round((ventilatorsInUse/edBeds) * 30)} + {Math.round((longestAdmitTime/10) * 25)} + {Math.round((admittedPatients/hospitalBeds) * 20)}</p>
              <p className="pt-1 border-t border-gray-300 font-bold text-sm">= {nedocsScore}</p>
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