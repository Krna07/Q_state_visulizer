import React, { useState } from "react";
import "./QuantumStateVisualizer.css"; // reuse styles

function GlossaryItem({ term, description, link }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="section-card">
      <div
        className="section-title"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        {term} {open ? "▼" : "▶"}
      </div>
      {open && (
        <div className="notes">
          <p>{description}</p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007bff", textDecoration: "underline" }}
          >
            🔗 Learn more on Wikipedia
          </a>
        </div>
      )}
    </div>
  );
}

export default function QuantumGlossary() {
const glossary = [
  {
    term: "Qubit",
    description:
      "A qubit is the quantum version of a classical bit. Unlike bits, which can be 0 or 1, a qubit can exist in a superposition α|0⟩ + β|1⟩ where |α|² + |β|² = 1.",
    link: "https://en.wikipedia.org/wiki/Qubit"
  },
  {
    term: "Bloch Sphere",
    description:
      "The Bloch sphere provides a 3D representation of qubit states. Any pure qubit state is represented as a point on the sphere, defined by angles θ and φ.",
    link: "https://en.wikipedia.org/wiki/Bloch_sphere"
  },
  {
    term: "Ket Notation (|ψ⟩)",
    description:
      "Dirac's 'bra-ket' notation is a compact way to represent vectors in quantum mechanics. A ket |ψ⟩ represents a column vector describing a state.",
    link: "https://en.wikipedia.org/wiki/Bra%E2%80%93ket_notation"
  },
  {
    term: "Superposition",
    description:
      "Superposition means a quantum system can exist in multiple states at once. For a qubit, it means being partly |0⟩ and partly |1⟩ until measured.",
    link: "https://en.wikipedia.org/wiki/Quantum_superposition"
  },
  {
    term: "Amplitude (α, β)",
    description:
      "The coefficients α and β describe how much of |0⟩ and |1⟩ a qubit contains. Their magnitudes squared give measurement probabilities.",
    link: "https://en.wikipedia.org/wiki/Probability_amplitude"
  },
  {
    term: "Probability",
    description:
      "Probabilities in quantum mechanics are obtained by squaring the amplitudes: P(0) = |α|², P(1) = |β|². These always sum to 1.",
    link: "https://en.wikipedia.org/wiki/Born_rule"
  },
  {
    term: "Bloch Coordinates (x, y, z)",
    description:
      "On the Bloch sphere, a qubit state can be mapped to coordinates (x, y, z) with x = sinθ cosφ, y = sinθ sinφ, z = cosθ.",
    link: "https://en.wikipedia.org/wiki/Bloch_sphere#Mathematical_description"
  },
  {
    term: "Density Matrix",
    description:
      "The density matrix describes both pure and mixed quantum states. For pure states, ρ = |ψ⟩⟨ψ|. It is useful for describing noisy or open systems.",
    link: "https://en.wikipedia.org/wiki/Density_matrix"
  },
  {
    term: "Measurement",
    description:
      "Quantum measurement collapses a superposition into one of its basis states. The outcome probabilities follow the Born rule (|amplitude|²).",
    link: "https://en.wikipedia.org/wiki/Measurement_in_quantum_mechanics"
  },
  {
    term: "Born Rule",
    description:
      "The Born rule states that measurement probabilities are given by the squared magnitude of amplitudes. This connects abstract quantum states to real-world statistics.",
    link: "https://en.wikipedia.org/wiki/Born_rule"
  },
  {
    term: "Phase (φ)",
    description:
      "The phase determines relative oscillations between |0⟩ and |1⟩ components. While invisible in single probabilities, it impacts interference in multi-qubit systems.",
    link: "https://en.wikipedia.org/wiki/Phase_factor"
  },
  {
    term: "Polar Angle (θ)",
    description:
      "On the Bloch sphere, θ sets the balance between |0⟩ and |1⟩: P(0) = cos²(θ/2), P(1) = sin²(θ/2). θ = 0 → |0⟩, θ = π → |1⟩.",
    link: "https://en.wikipedia.org/wiki/Bloch_sphere#Mathematical_description"
  },
  {
    term: "Azimuth (φ)",
    description:
      "The azimuthal angle φ (phi) specifies rotation around the Z-axis on the Bloch sphere. It controls the relative phase between |0⟩ and |1⟩.",
    link: "https://en.wikipedia.org/wiki/Spherical_coordinate_system"
  }
];


  return (
    <div className="app-container">
      <div className="main-grid">
        <div className="column">
          <h1 className="title">Quantum Glossary</h1>
          {glossary.map((item) => (
            <GlossaryItem
              term={item.term}
              description={item.description}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
