import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Experience } from "./components/Experience";
import { Contact } from "./components/Contact";
import { TricolorBar } from "./components/TricolorBar";

function App() {
  return (
    <div className="min-h-screen bg-ink-950">
      <TricolorBar />
      <Nav />
      <main>
        <Hero />
        <Projects />
        <Skills />
        <Experience />
      </main>
      <Contact />
    </div>
  );
}

export default App;
