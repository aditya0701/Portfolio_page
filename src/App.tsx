import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { CaseStudySegmentation } from "./pages/CaseStudySegmentation";
import { CaseStudyTechDrishti } from "./pages/CaseStudyTechDrishti";
import { CaseStudyDeepResearch } from "./pages/CaseStudyDeepResearch";
import { CaseStudyChitragupta } from "./pages/CaseStudyChitragupta";
import { ChitraguptaArchitecture } from "./pages/ChitraguptaArchitecture";
import { ChitraguptaFailureLog } from "./pages/ChitraguptaFailureLog";
import { DeepResearchComparison } from "./pages/DeepResearchComparison";
import { SarvamVsDeepseek } from "./pages/SarvamVsDeepseek";
import { EvaluationReport } from "./pages/EvaluationReport";
import { Evolution } from "./pages/Evolution";
import { Certifications } from "./pages/Certifications";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/case-study/microglomeruli-segmentation" element={<CaseStudySegmentation />} />
      <Route path="/case-study/techdrishti" element={<CaseStudyTechDrishti />} />
      <Route path="/case-study/techdrishti/sarvam-vs-deepseek" element={<SarvamVsDeepseek />} />
      <Route path="/case-study/techdrishti/evaluation" element={<EvaluationReport />} />
      <Route path="/case-study/techdrishti/evolution" element={<Evolution />} />
      <Route path="/case-study/deep-research-agent" element={<CaseStudyDeepResearch />} />
      <Route path="/case-study/deep-research-agent/comparison" element={<DeepResearchComparison />} />
      <Route path="/case-study/chitragupta" element={<CaseStudyChitragupta />} />
      <Route path="/case-study/chitragupta/architecture" element={<ChitraguptaArchitecture />} />
      <Route path="/case-study/chitragupta/failure-log" element={<ChitraguptaFailureLog />} />
      <Route path="/certifications" element={<Certifications />} />
    </Routes>
  );
}

export default App;
