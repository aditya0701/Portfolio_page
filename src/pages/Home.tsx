import { Nav } from "../components/Nav";
import { Hero } from "../components/Hero";
import { Projects } from "../components/Projects";
import { Skills } from "../components/Skills";
import { Experience } from "../components/Experience";
import { Contact } from "../components/Contact";
import { SignalBar } from "../components/SignalBar";

export function Home() {
  return (
    <div className="scanlines min-h-screen bg-ink-950">
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
