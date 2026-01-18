// File: src/components/widgets/NedocsLinearDemo.jsx
//
// A lightweight, dependency-free interactive demo for teaching linear regression
// using a "NEDOCS-like" crowding score as the motivating example.
//
// Notes:
// - This is NOT the official NEDOCS formula. It is intentionally synthetic to teach concepts.
// - Everything runs client-side (no backend), suitable for free static hosting.

import React, { useMemo, useState } from "react";

function clamp(x, min, max) {
  return Math.min(max, Math.max(min, x));
}

function round(x, digits = 2) {
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
}

function formatSigned(x, digits = 2) {
  const v = round(x, digits);
  return v >= 0 ? `+${v}` : `${v}`;
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
  wide = false,
}) {
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
        style={{ width: wide ? "100%" : "100%" }}
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

function ContributionBar({ label, value, maxAbs }) {
  const widthPct = maxAbs === 0 ? 0 : (Math.abs(value) / maxAbs) * 100;
  const isNeg = value < 0;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ fontVariantNumeric: "tabular-nums" }}>{formatSigned(value, 1)}</div>
      </div>

      <div
        style={{
          position: "relative",
          height: 12,
          borderRadius: 8,
          background: "var(--ifm-color-emphasis-200)",
          overflow: "hidden",
          marginTop: 6,
        }}
        title="Magnitude of this term's contribution"
      >
        {/* Center line */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            background: "var(--ifm-color-emphasis-400)",
          }}
        />
        {/* Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: `${widthPct / 2}%`,
            left: isNeg ? `calc(50% - ${widthPct / 2}%)` : "50%",
            background: isNeg
              ? "var(--ifm-color-danger)"
              : "var(--ifm-color-success)",
            opacity: 0.85,
          }}
        />
      </div>

      <div style={{ fontSize: 12, color: "var(--ifm-color-emphasis-700)", marginTop: 4 }}>
        {isNeg ? "Decreases" : "Increases"} predicted crowding score
      </div>
    </div>
  );
}

function MiniResidualPlot({ predicted, observed }) {
  // A simple "residual" visualization without any chart library.
  // Residual = observed - predicted
  const residual = observed - predicted;
  const maxAbs = 80; // controls scaling of the "needle" display
  const scaled = clamp(residual, -maxAbs, maxAbs);
  const pct = ((scaled + maxAbs) / (2 * maxAbs)) * 100; // map [-maxAbs, +maxAbs] -> [0,100]

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 600 }}>Residual (Observed − Predicted)</div>
        <div style={{ fontVariantNumeric: "tabular-nums" }}>{formatSigned(residual, 1)}</div>
      </div>

      <div
        style={{
          position: "relative",
          height: 14,
          borderRadius: 8,
          background: "var(--ifm-color-emphasis-200)",
          marginTop: 8,
        }}
        title="Residual scale is capped for display"
      >
        {/* Zero marker */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            background: "var(--ifm-color-emphasis-500)",
          }}
        />
        {/* Needle */}
        <div
          style={{
            position: "absolute",
            left: `calc(${pct}% - 2px)`,
            top: 0,
            bottom: 0,
            width: 4,
            borderRadius: 4,
            background: "var(--ifm-color-primary)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--ifm-color-emphasis-700)",
          marginTop: 4,
        }}
      >
        <span>Observed &lt; Predicted</span>
        <span>Observed &gt; Predicted</span>
      </div>
    </div>
  );
}

export default function NedocsLinearDemo() {
  // Predictors (synthetic, NEDOCS-like operational features)
  const [bedsOccupiedPct, setBedsOccupiedPct] = useState(85); // %
  const [boarders, setBoarders] = useState(10); // patients admitted boarding
  const [waitingRoom, setWaitingRoom] = useState(18); // patients waiting
  const [longestWaitMin, setLongestWaitMin] = useState(120); // minutes

  // Coefficients (tunable to teach interpretation)
  const [intercept, setIntercept] = useState(20);
  const [bBedsOccupiedPct, setBBedsOccupiedPct] = useState(0.8);
  const [bBoarders, setBBoarders] = useState(3.0);
  const [bWaitingRoom, setBWaitingRoom] = useState(1.2);
  const [bLongestWaitMin, setBLongestWaitMin] = useState(0.15);

  // Optional "observed" value to illustrate residuals
  const [observedScore, setObservedScore] = useState(120);

  const terms = useMemo(() => {
    const t0 = intercept;
    const t1 = bBedsOccupiedPct * bedsOccupiedPct;
    const t2 = bBoarders * boarders;
    const t3 = bWaitingRoom * waitingRoom;
    const t4 = bLongestWaitMin * longestWaitMin;

    const predicted = t0 + t1 + t2 + t3 + t4;

    return {
      predicted,
      contributions: [
        { label: "Intercept", value: t0 },
        { label: "Beds occupied (%)", value: t1 },
        { label: "Admitted boarders", value: t2 },
        { label: "Waiting room", value: t3 },
        { label: "Longest wait (min)", value: t4 },
      ],
    };
  }, [
    intercept,
    bBedsOccupiedPct,
    bBoarders,
    bWaitingRoom,
    bLongestWaitMin,
    bedsOccupiedPct,
    boarders,
    waitingRoom,
    longestWaitMin,
  ]);

  const predictedScore = terms.predicted;

  const maxAbsContribution = useMemo(() => {
    return Math.max(...terms.contributions.map((c) => Math.abs(c.value)), 1);
  }, [terms.contributions]);

  // A simple qualitative banding for teaching
  const crowdingBand = useMemo(() => {
    if (predictedScore < 60) return { label: "Low", tone: "success" };
    if (predictedScore < 100) return { label: "Moderate", tone: "warning" };
    if (predictedScore < 140) return { label: "High", tone: "danger" };
    return { label: "Severe", tone: "danger" };
  }, [predictedScore]);

  const bandStyle = useMemo(() => {
    const map = {
      success: "var(--ifm-color-success)",
      warning: "var(--ifm-color-warning)",
      danger: "var(--ifm-color-danger)",
    };
    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      border: `1px solid ${map[crowdingBand.tone]}`,
      color: map[crowdingBand.tone],
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: 0.4,
      textTransform: "uppercase",
    };
  }, [crowdingBand]);

  function resetDefaults() {
    setBedsOccupiedPct(85);
    setBoarders(10);
    setWaitingRoom(18);
    setLongestWaitMin(120);

    setIntercept(20);
    setBBedsOccupiedPct(0.8);
    setBBoarders(3.0);
    setBWaitingRoom(1.2);
    setBLongestWaitMin(0.15);

    setObservedScore(120);
  }

  return (
    <div
      style={{
        border: "1px solid var(--ifm-color-emphasis-200)",
        borderRadius: 14,
        padding: 16,
        background: "var(--ifm-background-surface-color)",
        boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
        margin: "16px 0",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
          NEDOCS-like Linear Regression Demo
        </div>
        <div style={{ color: "var(--ifm-color-emphasis-700)", fontSize: 13 }}>
          Synthetic example for teaching linear regression:{" "}
          <code>score = β0 + Σ βi·xi</code>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <button
          onClick={resetDefaults}
          style={{
            border: "1px solid var(--ifm-color-emphasis-300)",
            background: "transparent",
            borderRadius: 10,
            padding: "8px 10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
          type="button"
        >
          Reset defaults
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {/* Left: Inputs */}
        <div>
          <div style={{ fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Inputs (x)</div>

          <SliderRow
            label="Beds occupied"
            value={bedsOccupiedPct}
            setValue={setBedsOccupiedPct}
            min={40}
            max={120}
            step={1}
            unit="%"
            help="Percent of staffed ED beds occupied"
          />

          <SliderRow
            label="Admitted boarders"
            value={boarders}
            setValue={setBoarders}
            min={0}
            max={40}
            step={1}
            unit="pts"
            help="Admitted patients still in ED"
          />

          <SliderRow
            label="Waiting room"
            value={waitingRoom}
            setValue={setWaitingRoom}
            min={0}
            max={80}
            step={1}
            unit="pts"
            help="Patients waiting to be roomed"
          />

          <SliderRow
            label="Longest wait"
            value={longestWaitMin}
            setValue={setLongestWaitMin}
            min={0}
            max={360}
            step={5}
            unit="min"
            help="Minutes for the longest-waiting patient"
          />
        </div>

        {/* Middle: Coefficients */}
        <div>
          <div style={{ fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Coefficients (β)</div>

          <SliderRow
            label="Intercept (β0)"
            value={intercept}
            setValue={setIntercept}
            min={-30}
            max={80}
            step={1}
            unit=""
            help="Baseline score when all x = 0"
          />

          <SliderRow
            label="β for Beds occupied (%)"
            value={bBedsOccupiedPct}
            setValue={setBBedsOccupiedPct}
            min={-2}
            max={2}
            step={0.05}
            unit=""
            help="Change in score per +1% occupied"
          />

          <SliderRow
            label="β for Boarders"
            value={bBoarders}
            setValue={setBBoarders}
            min={-5}
            max={8}
            step={0.1}
            unit=""
            help="Change in score per +1 boarder"
          />

          <SliderRow
            label="β for Waiting room"
            value={bWaitingRoom}
            setValue={setBWaitingRoom}
            min={-3}
            max={5}
            step={0.1}
            unit=""
            help="Change in score per +1 waiting"
          />

          <SliderRow
            label="β for Longest wait (min)"
            value={bLongestWaitMin}
            setValue={setBLongestWaitMin}
            min={-0.5}
            max={0.5}
            step={0.01}
            unit=""
            help="Change in score per +1 minute"
          />
        </div>

        {/* Right: Outputs */}
        <div>
          <div style={{ fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Output</div>

          <div
            style={{
              border: "1px solid var(--ifm-color-emphasis-200)",
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>Predicted crowding score</div>
              <div style={{ fontVariantNumeric: "tabular-nums", fontWeight: 900, fontSize: 20 }}>
                {round(predictedScore, 1)}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <span style={bandStyle}>{crowdingBand.label}</span>
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--ifm-color-emphasis-700)" }}>
                Teaching note: the banding is illustrative; real operational thresholds are site-specific.
              </div>
            </div>
          </div>

          <div style={{ fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Term-by-term contributions</div>
          {terms.contributions.map((c) => (
            <ContributionBar key={c.label} label={c.label} value={c.value} maxAbs={maxAbsContribution} />
          ))}

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--ifm-color-emphasis-200)" }}>
            <div style={{ fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Residual intuition (optional)</div>

            <SliderRow
              label="Observed score (y)"
              value={observedScore}
              setValue={setObservedScore}
              min={0}
              max={220}
              step={1}
              unit=""
              help="A hypothetical observed value for a given timepoint"
            />

            <div style={{ fontSize: 13, color: "var(--ifm-color-emphasis-700)" }}>
              Residuals summarize what the model <em>didn’t</em> explain at a given observation.
              Large residuals can signal outliers, missing predictors, or a misspecified model.
            </div>

            <MiniResidualPlot predicted={predictedScore} observed={observedScore} />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid var(--ifm-color-emphasis-200)",
          fontSize: 13,
          color: "var(--ifm-color-emphasis-700)",
        }}
      >
        <strong>How to use this demo in the lecture:</strong> First, hold β fixed and vary one input x at a time
        to see linear additivity. Then hold x fixed and vary a coefficient β to reinforce interpretation as
        “units of y per unit of x.” Finally, discuss what the residual represents and why it matters for model
        checking.
      </div>
    </div>
  );
}
