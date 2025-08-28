import React from "react";
import QuantumStateVisualizer from "./components/QuantumStateVisualizer";
// import QuantumStateVisualizer from "./components/QuantumStateVisualizer";
import { Routes, Route } from 'react-router-dom';
import QuantumGlossary from "./components/QuantumGlossary";
function App() {
  return (
    <div>
      {/* <QuantumStateVisualizer/> */}
      <Routes>
        <Route path="/" element={<QuantumStateVisualizer />} />
        <Route path="/glossary" element={<QuantumGlossary />} />
      </Routes>
    </div>
  );
}

export default App;
