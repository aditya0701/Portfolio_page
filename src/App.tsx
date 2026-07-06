import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { CaseStudyTechDrishti } from "./pages/CaseStudyTechDrishti";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/case-study/techdrishti" element={<CaseStudyTechDrishti />} />
    </Routes>
  );
}

export default App;
