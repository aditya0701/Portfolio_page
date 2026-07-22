import { Nav } from "../components/Nav";
import { Hero } from "../components/Hero";
import { Projects } from "../components/Projects";
import { Skills } from "../components/Skills";
import { Experience } from "../components/Experience";
import { Contact } from "../components/Contact";
import { SignalBar } from "../components/SignalBar";
import { usePageTitle } from "../hooks/usePageTitle";

export function Home() {
  usePageTitle("Aditya Rawat | ML Systems, Computer Vision & LLM Engineering");
  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />
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
