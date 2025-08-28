import * as THREE from "three";
import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./QuantumStateVisualizer.css"; // Import the stylesheet
import { Link } from "react-router-dom";
// ---------- Math helpers ----------
const toRad = (deg) => (deg * Math.PI) / 180;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

 const details = [
    "Measurement is being done in the Z-basis (σz): |0⟩ = [1,0], |1⟩ = [0,1]. This is the standard computational basis used in quantum computing.",
    "Shots: 200 → means the simulator repeated the measurement 200 times on identically prepared qubits (same quantum state).",
    "Observed 0: 146 (0.730) → Out of 200 shots, 146 times the result was |0⟩, i.e., probability ≈ 73%.",
    "Observed 1: 54 (0.270) → Out of 200 shots, 54 times the result was |1⟩, i.e., probability ≈ 27%.",
    "State formula: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)·sin(θ/2)|1⟩",
    "Probability of 0: P(0) = cos²(θ/2)",
    "Probability of 1: P(1) = sin²(θ/2)",
    "Example: Here, P(0) ≈ 0.73 and P(1) ≈ 0.27, which matches the simulated measurement results."
  ];


function blochFromAngles(thetaDeg, phiDeg) {
  const θ = toRad(thetaDeg);
  const φ = toRad(phiDeg);
  const x = Math.sin(θ) * Math.cos(φ);
  const y = Math.sin(θ) * Math.sin(φ);
  const z = Math.cos(θ);
  return { x, y, z };
}

function stateAmplitudes(thetaDeg, phiDeg) {
  const θ = toRad(thetaDeg);
  const φ = toRad(phiDeg);
  const a0 = Math.cos(θ / 2); // real
  const a1_mag = Math.sin(θ / 2);
  const a1_re = a1_mag * Math.cos(φ);
  const a1_im = a1_mag * Math.sin(φ);
  return { a0, a1: { re: a1_re, im: a1_im } };
}

function densityMatrix(thetaDeg, phiDeg) {
  const { a0, a1 } = stateAmplitudes(thetaDeg, phiDeg);
  const α = { re: a0, im: 0 };
  const β = a1; // complex
  const ρ00 = α.re * α.re + α.im * α.im; // |α|^2
  const ρ11 = β.re * β.re + β.im * β.im; // |β|^2
  const ρ01 = { re: α.re * β.re + α.im * β.im, im: -α.re * β.im + α.im * β.re };
  const ρ10 = { re: ρ01.re, im: -ρ01.im }; // conjugate
  return { r00: ρ00, r01: ρ01, r10: ρ10, r11: ρ11 };
}

function formatComplex({ re, im }, digits = 3) {
  const r = re.toFixed(digits);
  // const i = im.toFixed(digits);
  const sign = im >= 0 ? "+" : "-";
  return `${r} ${sign} ${Math.abs(im).toFixed(digits)}i`;
}

// ---------- 3D primitives ----------
function Axis({ from = [0, 0, 0], to = [1, 0, 0] }) {
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(new THREE.Vector3(...from), new THREE.Vector3(...to)).multiplyScalar(0.5);
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <group position={mid} quaternion={quat}>
      <mesh>
        <cylinderGeometry args={[0.01, 0.01, len, 16]} />
        <meshStandardMaterial />
      </mesh>
    </group>
  );
}

function Arrow({ to = [0, 0, 1], radius = 0.02 }) {
  const end = new THREE.Vector3(...to);
  const len = end.length();
  const shaftLen = Math.max(0, len - 0.1);
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().normalize());
  return (
    <group quaternion={quat}>
      <mesh position={[0, shaftLen / 2, 0]}>
        <cylinderGeometry args={[radius, radius, shaftLen, 16]} />
        <meshStandardMaterial />
      </mesh>
      <mesh position={[0, len - 0.05, 0]}>
        <coneGeometry args={[radius * 2.2, 0.1, 20]} />
        <meshStandardMaterial />
      </mesh>
    </group>
  );
}

function Equator() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const t = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t), 0, Math.sin(t)));
    }
    return pts;
  }, []);
  return (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={["attributes", "position"]}
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial />
    </line>
  );
}

// ---------- Scene ----------
function BlochScene({ theta, phi }) {
 const { x, y, z } = useMemo(() => blochFromAngles(theta, phi), [theta, phi]);

 // slow auto-rotate red glow point on surface
 const glowRef = useRef();
 useFrame(({ clock }) => {
   const t = clock.getElapsedTime() * 0.25;
   const gx = Math.cos(t);
   const gz = Math.sin(t);
   if (glowRef.current) glowRef.current.position.set(gx, 0, gz);
 });

 return (
   <>
     <ambientLight intensity={0.9} />
     <directionalLight position={[3, 4, 2]} intensity={0.8} />

     {/* Sphere */}
     <mesh>
       <sphereGeometry args={[1, 64, 64]} />
       <meshStandardMaterial wireframe opacity={0.25} transparent />
     </mesh>

     {/* Axes X, Y, Z */}
     <group>
       <mesh>
         <cylinderGeometry args={[0.006, 0.006, 2.2, 12]} />
         <meshStandardMaterial />
       </mesh>
       <mesh rotation={[0, 0, Math.PI / 2]}>
         <cylinderGeometry args={[0.006, 0.006, 2.2, 12]} />
         <meshStandardMaterial />
       </mesh>
       <mesh rotation={[Math.PI / 2, 0, 0]}>
         <cylinderGeometry args={[0.006, 0.006, 2.2, 12]} />
         <meshStandardMaterial />
       </mesh>
     </group>

     {/* Equator */}
     <Equator />

     {/* |0> and |1> markers on Z axis */}
     <mesh position={[0, 1, 0]}>
       <sphereGeometry args={[0.02, 16, 16]} />
       <meshStandardMaterial />
     </mesh>
     <mesh position={[0, -1, 0]}>
       <sphereGeometry args={[0.02, 16, 16]} />
       <meshStandardMaterial />
     </mesh>

     {/* State vector */}
     <group>
       <Arrow to={[x, y, z]} />
     </group>

     {/* Moving red glow point for visual interest */}
     <mesh ref={glowRef}>
       <sphereGeometry args={[0.05, 12, 12]} />
       <meshStandardMaterial emissiveIntensity={2} emissive={new THREE.Color("purple")} />
     </mesh>

     <OrbitControls enablePan={false} makeDefault />
   </>
 );
}
// ---------- UI ----------
function NumberSlider({ label, value, setValue, min, max, step = 1 }) {
  return (
    <div className="slider-control">
      <div className="slider-label">{label}</div>
      <input
        type="range"
        className="slider-range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <input
        type="number"
        className="slider-number-input"
        value={value} min={min} max={max} step={step}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <span className="slider-unit">deg</span>
    </div>
  );
}

function MatrixCell({ children }) {
  return <div className="matrix-cell">{children}</div>;
}

function PrettyKet({ theta, phi }) {
  const { a0, a1 } = stateAmplitudes(theta, phi);
  const amp0 = `${a0.toFixed(3)}`;
  const amp1 = `${a1.re.toFixed(3)} ${a1.im >= 0 ? "+" : "-"} ${Math.abs(a1.im).toFixed(3)}i`;
  return (
    <div className="ket-display">
      |ψ⟩ = {amp0} |0⟩ + ({amp1}) |1⟩
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="section-card">
      
      <div className="section-title">{title}
      
      </div>
      {children}
    </div>
  );
}

const PRESETS = [
  { name: "|0⟩", theta: 0, phi: 0 },
  { name: "|1⟩", theta: 180, phi: 0 },
  { name: "|+⟩", theta: 90, phi: 0 },
  { name: "|−⟩", theta: 90, phi: 180 },
  { name: "|+i⟩", theta: 90, phi: 90 },
  { name: "|−i⟩", theta: 90, phi: 270 },
];

function simulateShots(theta, phi, shots) {
  const p0 = Math.cos(toRad(theta) / 2) ** 2;
  let c0 = 0;
  for (let i = 0; i < shots; i++) if (Math.random() < p0) c0++;
  return { c0, c1: shots - c0, p0, p1: 1 - p0 };
}

export default function QuantumStateVisualizer() {
  const [theta, setTheta] = useState(60);
  const [phi, setPhi] = useState(30);
  const [shots, setShots] = useState(200);
  const [res, setRes] = useState(() => simulateShots(60, 30, 200));


  const [aiResponse, setAiResponse] = useState("");




async function getAIExplanation() {
  const res = await fetch("http://localhost:5000/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theta, phi }),
  });
  const data = await res.json();
  setAiResponse(data.explanation);
}

  const bloch = useMemo(() => blochFromAngles(theta, phi), [theta, phi]);
  const amps = useMemo(() => stateAmplitudes(theta, phi), [theta, phi]);
  const rho = useMemo(() => densityMatrix(theta, phi), [theta, phi]);

  function doPreset(p) { setTheta(p.theta); setPhi(p.phi); }
  function randomize() {
    setTheta(Math.round(Math.random() * 180));
    setPhi(Math.round(Math.random() * 360));
  }
  function measure() { setRes(simulateShots(theta, phi, shots)); }

  const prob0 = (Math.cos(toRad(theta) / 2) ** 2).toFixed(3);
  const prob1 = (1 - Math.cos(toRad(theta) / 2) ** 2).toFixed(3);

  return <>
    <div className="app-container">
      <div className="main-grid">
        <div className="column">
          <div className="header">
            <h1 className="title">Quantum State Visualizer</h1>
            <button className="button-primary" onClick={randomize}>Random</button>
          </div>

          <Section title="Bloch Sphere (single qubit)">
            <div className="canvas-container">
              <Canvas camera={{ position: [2.4, 1.8, 2.4], fov: 45 }}>
                <BlochScene theta={theta} phi={phi} />
              </Canvas>
            </div>
            <div className="controls-grid">
              <NumberSlider label="θ (polar)" value={theta} setValue={(v) => setTheta(clamp(v, 0, 180))} min={0} max={180} />
              <NumberSlider label="φ (azimuth)" value={phi} setValue={(v) => setPhi(((v % 360) + 360) % 360)} min={0} max={360} />
            </div>
            <div className="presets-container">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => doPreset(p)} className="button-preset">
                  {p.name}
                </button>
              ))}
            </div>
          </Section>


          
          <Section title="Quick help">
            <ul className="help-list">
              <li>Drag to rotate the sphere. Use the sliders to change θ (0–180°) and φ (0–360°).</li>
              <li>Presets jump to familiar states like |0⟩, |1⟩, |±⟩, and |±i⟩.</li>
              <li>Measurement simulator samples in the computational (Z) basis. Expect ~P(0)=cos²(θ/2).</li>
              <li>Extend it: add gates (X,Y,Z,H,S,T), animate paths, or include mixed states.</li>
            </ul>
          </Section>

          {/* 🔹 AI Explanation Section */}
          <Section title="AI Explanation">
            <button className="button-primary" onClick={getAIExplanation}>
              Explain with AI
            </button>
            {aiResponse && (
              <div className="ai-box">
                <h3>AI says:</h3>
                <p>{aiResponse}</p>
              </div>
            )}
          </Section>

          <Section title="Measurement simulator (σ_z basis)">
            <div className="measurement-controls">
              <div className="shots-label">Shots:</div>
              <input type="number" value={shots} min={1} max={100000}
                className="shots-input"
                onChange={(e) => setShots(clamp(Number(e.target.value), 1, 100000))} />
              <button className="button-secondary" onClick={measure}>Measure</button>
            </div>
            <div className="results-grid">
              <div className="result-box">Observed 0: <b>{res.c0}</b> ({(res.c0 / (res.c0 + res.c1) || 0).toFixed(3)})</div>
              <div className="result-box">Observed 1: <b>{res.c1}</b> ({(res.c1 / (res.c0 + res.c1) || 0).toFixed(3)})</div>
            </div>
          </Section>
        </div>

        <div className="column">
          <Section title="State & math">
            <PrettyKet theta={theta} phi={phi} />
            <div className="math-details-grid">
              <div className="math-box">
                <div className="math-box-title">Amplitudes</div>
                <div className="monospace">α (|0⟩): {amps.a0.toFixed(3)}</div>
                <div className="monospace">β (|1⟩): {formatComplex(amps.a1)}</div>
              </div>
              <div className="math-box">
                <div className="math-box-title">Probabilities</div>
                <div className="monospace">P(0) = {prob0}</div>
                <div className="monospace">P(1) = {prob1}</div>
              </div>
            </div>

            <div className="info-block">
              <div className="info-block-title">Bloch coordinates (x, y, z)</div>
              <div className="monospace">({bloch.x.toFixed(3)}, {bloch.y.toFixed(3)}, {bloch.z.toFixed(3)})</div>
            </div>

            <div className="info-block">
              <div className="info-block-title">Density matrix ρ = |ψ⟩⟨ψ|</div>
              <div className="density-matrix-grid">
                <MatrixCell>{rho.r00.toFixed(3)}</MatrixCell>
                <MatrixCell>{formatComplex(rho.r01)}</MatrixCell>
                <MatrixCell>{formatComplex(rho.r10)}</MatrixCell>
                <MatrixCell>{rho.r11.toFixed(3)}</MatrixCell>
              </div>
            </div>

            <div className="notes">
              Notes: Global phase is omitted. φ controls relative phase. The vector points to (x, y, z) on the unit Bloch sphere where x = sinθ cosφ, y = sinθ sinφ, z = cosθ.
            </div>
          </Section>

          <Section title="Quick help">
            <ul className="help-list">
              <li>Drag to rotate the sphere. Use the sliders to change θ (0–180°) and φ (0–360°).</li>
              <li>Presets jump to familiar states like |0⟩, |1⟩, |±⟩, and |±i⟩.</li>
              <li>Measurement simulator samples in the computational (Z) basis. Expect ~P(0)=cos²(θ/2).</li>
              <li>Extend it: add gates (X,Y,Z,H,S,T), animate paths, or include mixed states.</li>
              <li>{details}</li>
            </ul>

            <Link to='/glossary' className="learn" ><button className="learn">Learn More</button></Link>
          </Section>
        </div>
      </div>
    </div>
  </>;
}


