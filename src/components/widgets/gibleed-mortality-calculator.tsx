// File: src/components/widgets/gibleed-mortality-calculator.tsx
//
// Interactive demo for Vizient-like GI Bleed Mortality Prediction Model
// This is a simplified, educational example (not the actual proprietary Vizient model).
//
// Everything runs client-side (no backend), suitable for free static hosting.

import React, { useMemo, useState } from "react";

function round(x: number, digits: number = 2): number {
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
}

function formatSigned(x: number, digits: number = 2): string {
  const v = round(x, digits);
  return v >= 0 ? `+${v}` : `${v}`;
}

interface SliderRowProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  help?: string;
}

function SliderRow({
  label,
  value,
  setValue,
  min,
  max,
  step,
  unit,
  help,
}: SliderRowProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 600 }}>
          {label}
          {help ? (
            <span style={{ fontWeight: 400, color: "var(--ifm-color-emphasis-600)" }}>
              {" "}
              — {help}
            </span>
          ) : null}
        </div>
        <div style={{ fontVariantNumeric: "tabular-nums" }}>
          <strong>{value}</strong>
          {unit ? <span style={{ color: "var(--ifm-color-emphasis-700)" }}> {unit}</span> : null}
        </div>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: "100%" }}
        aria-label={label}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--ifm-color-emphasis-700)",
          marginTop: 2,
        }}
      >
        <span>
          {min}
          {unit ? ` ${unit}` : ""}
        </span>
        <span>
          {max}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
    </div>
  );
}

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
  help?: string;
}

function CheckboxRow({ label, checked, setChecked, help }: CheckboxRowProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
        <div style={{ fontWeight: 600 }}>
          {label}
          {help ? (
            <span style={{ fontWeight: 400, color: "var(--ifm-color-emphasis-600)" }}>
              {" "}
              — {help}
            </span>
          ) : null}
        </div>
      </label>
    </div>
  );
}

interface ContributionBarProps {
  label: string;
  value: number;
  maxAbs: number;
}

function ContributionBar({ label, value, maxAbs }: ContributionBarProps) {
  const widthPct = maxAbs === 0 ? 0 : (Math.abs(value) / maxAbs) * 100;
  const isNeg = value < 0;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ fontVariantNumeric: "tabular-nums" }}>{formatSigned(value, 2)}</div>
      </div>

      <div
        style={{
          position: "relative",
          height: 12,
          borderRadius: 6,
          background: "var(--ifm-color-emphasis-200)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            [isNeg ? "right" : "left"]: "50%",
            width: `${widthPct}%`,
            height: "100%",
            background: isNeg
              ? "var(--ifm-color-danger)"
              : "var(--ifm-color-primary)",
            borderRadius: 6,
          }}
        />
      </div>
    </div>
  );
}

export default function GIBleedMortalityCalculator() {
  // Model coefficients (from the Vizient-like model)
  const INTERCEPT = -7.0;
  const COEFF_AGE = 0.055;
  const COEFF_MALE = 0.20;
  const COEFF_EMERGENCY = 0.60;
  const COEFF_ICU_24H = 0.90;
  const COEFF_ELIXSCORE = 0.08;
  const COEFF_CHF_POA = 0.70;
  const COEFF_CKD_POA = 0.55;
  const COEFF_SEPSIS_POA = 1.10;
  const COEFF_VENT_24H = 1.40;
  const COEFF_CREATININE_HIGH = 0.65;
  const COEFF_LACTATE_HIGH = 0.85;

  // Patient characteristics state
  const [age, setAge] = useState(75);
  const [male, setMale] = useState(true);
  const [emergency, setEmergency] = useState(true);
  const [icu24h, setIcu24h] = useState(false);
  const [elixScore, setElixScore] = useState(8);
  const [chfPOA, setChfPOA] = useState(true);
  const [ckdPOA, setCkdPOA] = useState(false);
  const [sepsisPOA, setSepsisPOA] = useState(true);
  const [vent24h, setVent24h] = useState(false);
  const [creatinineHigh, setCreatinineHigh] = useState(true);
  const [lactateHigh, setLactateHigh] = useState(false);

  // Calculate logit and probability
  const { logit, probability, contributions } = useMemo(() => {
    const ageTerm = COEFF_AGE * age;
    const maleTerm = COEFF_MALE * (male ? 1 : 0);
    const emergencyTerm = COEFF_EMERGENCY * (emergency ? 1 : 0);
    const icu24hTerm = COEFF_ICU_24H * (icu24h ? 1 : 0);
    const elixScoreTerm = COEFF_ELIXSCORE * elixScore;
    const chfPOATerm = COEFF_CHF_POA * (chfPOA ? 1 : 0);
    const ckdPOATerm = COEFF_CKD_POA * (ckdPOA ? 1 : 0);
    const sepsisPOATerm = COEFF_SEPSIS_POA * (sepsisPOA ? 1 : 0);
    const vent24hTerm = COEFF_VENT_24H * (vent24h ? 1 : 0);
    const creatinineHighTerm = COEFF_CREATININE_HIGH * (creatinineHigh ? 1 : 0);
    const lactateHighTerm = COEFF_LACTATE_HIGH * (lactateHigh ? 1 : 0);

    const logitValue =
      INTERCEPT +
      ageTerm +
      maleTerm +
      emergencyTerm +
      icu24hTerm +
      elixScoreTerm +
      chfPOATerm +
      ckdPOATerm +
      sepsisPOATerm +
      vent24hTerm +
      creatinineHighTerm +
      lactateHighTerm;

    const prob = 1 / (1 + Math.exp(-logitValue));

    const contribs = [
      { label: "Intercept", value: INTERCEPT },
      { label: "Age", value: ageTerm },
      { label: "Male", value: maleTerm },
      { label: "Emergency admission", value: emergencyTerm },
      { label: "ICU first 24h", value: icu24hTerm },
      { label: "Elixhauser score", value: elixScoreTerm },
      { label: "CHF (POA)", value: chfPOATerm },
      { label: "CKD (POA)", value: ckdPOATerm },
      { label: "Sepsis (POA)", value: sepsisPOATerm },
      { label: "Ventilation 24h", value: vent24hTerm },
      { label: "Creatinine high", value: creatinineHighTerm },
      { label: "Lactate high", value: lactateHighTerm },
    ];

    return {
      logit: logitValue,
      probability: prob,
      contributions: contribs,
    };
  }, [
    age,
    male,
    emergency,
    icu24h,
    elixScore,
    chfPOA,
    ckdPOA,
    sepsisPOA,
    vent24h,
    creatinineHigh,
    lactateHigh,
  ]);

  const maxAbsContribution = useMemo(() => {
    return Math.max(...contributions.map((c) => Math.abs(c.value)), 1);
  }, [contributions]);

  // Risk level categorization
  const riskLevel = useMemo(() => {
    const pct = probability * 100;
    if (pct < 5) return { label: "Very Low", color: "#22c55e", description: "Minimal risk" };
    if (pct < 15) return { label: "Low", color: "#84cc16", description: "Low risk" };
    if (pct < 30) return { label: "Moderate", color: "#eab308", description: "Moderate risk" };
    if (pct < 50) return { label: "High", color: "#f97316", description: "High risk" };
    return { label: "Very High", color: "#ef4444", description: "Very high risk - intensive monitoring needed" };
  }, [probability]);

  return (
    <div
      style={{
        border: "1px solid var(--ifm-color-emphasis-300)",
        borderRadius: 12,
        padding: 20,
        marginTop: 16,
        marginBottom: 16,
        background: "var(--ifm-background-color)",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 18,
          marginBottom: 16,
          color: "var(--ifm-heading-color)",
        }}
      >
        Interactive GI Bleed Mortality Calculator
      </div>

      <div style={{ fontSize: 14, color: "var(--ifm-color-emphasis-700)", marginBottom: 20 }}>
        Adjust patient characteristics to see how the model predicts in-hospital mortality risk.
        This is a <strong>simplified, educational example</strong> (not the actual proprietary Vizient model).
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {/* Left: Inputs */}
        <div>
          <div style={{ fontWeight: 800, marginBottom: 12, textAlign: "center" }}>Patient Characteristics</div>

          <SliderRow
            label="Age"
            value={age}
            setValue={setAge}
            min={18}
            max={100}
            step={1}
            unit="years"
            help="Patient age in years"
          />

          <CheckboxRow label="Male" checked={male} setChecked={setMale} help="Patient is male" />

          <CheckboxRow
            label="Emergency admission"
            checked={emergency}
            setChecked={setEmergency}
            help="ED/urgent admission (vs. elective)"
          />

          <CheckboxRow
            label="ICU first 24h"
            checked={icu24h}
            setChecked={setIcu24h}
            help="ICU admission in first 24 hours"
          />

          <SliderRow
            label="Elixhauser comorbidity score"
            value={elixScore}
            setValue={setElixScore}
            min={0}
            max={30}
            step={1}
            help="Overall comorbidity burden"
          />

          <CheckboxRow
            label="CHF (POA)"
            checked={chfPOA}
            setChecked={setChfPOA}
            help="Congestive heart failure present-on-admission"
          />

          <CheckboxRow
            label="CKD (POA)"
            checked={ckdPOA}
            setChecked={setCkdPOA}
            help="Chronic kidney disease present-on-admission"
          />

          <CheckboxRow
            label="Sepsis (POA)"
            checked={sepsisPOA}
            setChecked={setSepsisPOA}
            help="Sepsis present-on-admission"
          />

          <CheckboxRow
            label="Ventilation 24h"
            checked={vent24h}
            setChecked={setVent24h}
            help="Mechanical ventilation in first 24 hours"
          />

          <CheckboxRow
            label="Creatinine high (≥2.0 mg/dL)"
            checked={creatinineHigh}
            setChecked={setCreatinineHigh}
            help="First creatinine ≥ 2.0 mg/dL"
          />

          <CheckboxRow
            label="Lactate high (≥4 mmol/L)"
            checked={lactateHigh}
            setChecked={setLactateHigh}
            help="First lactate ≥ 4 mmol/L"
          />
        </div>

        {/* Right: Outputs */}
        <div>
          <div style={{ fontWeight: 800, marginBottom: 12, textAlign: "center" }}>Predicted Mortality</div>

          <div
            style={{
              border: "2px solid var(--ifm-color-emphasis-300)",
              borderRadius: 14,
              padding: 20,
              marginBottom: 16,
              background: "var(--ifm-color-emphasis-100)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  fontVariantNumeric: "tabular-nums",
                  color: riskLevel.color,
                  marginBottom: 8,
                }}
              >
                {round(probability * 100, 1)}%
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: riskLevel.color,
                  marginBottom: 4,
                }}
              >
                {riskLevel.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--ifm-color-emphasis-700)" }}>
                {riskLevel.description}
              </div>
            </div>

            {/* Probability bar */}
            <div
              style={{
                position: "relative",
                height: 24,
                borderRadius: 12,
                background: "var(--ifm-color-emphasis-200)",
                overflow: "hidden",
                marginTop: 12,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  width: `${probability * 100}%`,
                  height: "100%",
                  background: `linear-gradient(to right, ${riskLevel.color}, ${riskLevel.color}dd)`,
                  borderRadius: 12,
                  transition: "width 0.3s ease",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "var(--ifm-color-emphasis-600)",
                  opacity: 0.5,
                }}
              />
            </div>
          </div>

          <div style={{ fontWeight: 800, marginBottom: 12, textAlign: "center" }}>Model Details</div>

          <div
            style={{
              border: "1px solid var(--ifm-color-emphasis-200)",
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              fontSize: 13,
              fontFamily: "monospace",
              background: "var(--ifm-color-emphasis-50)",
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <strong>logit(p)</strong> = {round(logit, 3)}
            </div>
            <div>
              <strong>p</strong> = 1 / (1 + exp(-{round(logit, 3)})) = {round(probability, 3)} ={" "}
              {round(probability * 100, 1)}%
            </div>
          </div>

          <div style={{ fontWeight: 800, marginBottom: 12, textAlign: "center" }}>
            Term Contributions (log-odds)
          </div>
          {contributions.map((c) => (
            <ContributionBar key={c.label} label={c.label} value={c.value} maxAbs={maxAbsContribution} />
          ))}
        </div>
      </div>
    </div>
  );
}
