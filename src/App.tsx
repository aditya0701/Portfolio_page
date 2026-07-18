import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { CaseStudySegmentation } from "./pages/CaseStudySegmentation";
import { CaseStudyTechDrishti } from "./pages/CaseStudyTechDrishti";
import { CaseStudyDeepResearch } from "./pages/CaseStudyDeepResearch";
import { SarvamVsDeepseek } from "./pages/SarvamVsDeepseek";
import { Evolution } from "./pages/Evolution";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/case-study/microglomeruli-segmentation" element={<CaseStudySegmentation />} />
      <Route path="/case-study/techdrishti" element={<CaseStudyTechDrishti />} />
      <Route path="/case-study/techdrishti/sarvam-vs-deepseek" element={<SarvamVsDeepseek />} />
      <Route path="/case-study/techdrishti/evolution" element={<Evolution />} />
      <Route path="/case-study/deep-research-agent" element={<CaseStudyDeepResearch />} />
    </Routes>
  );
}

export default App;
