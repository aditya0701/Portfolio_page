import { Nav } from "../components/Nav";
import { Hero } from "../components/Hero";
import { Projects } from "../components/Projects";
import { ChitraguptaBridge } from "../components/ChitraguptaBridge";
import { Skills } from "../components/Skills";
import { Experience } from "../components/Experience";
import { Contact } from "../components/Contact";
import { SignalBar } from "../components/SignalBar";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

export function Home() {
  usePageTitle(ROUTE_META["/"].title);
  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />
      <Nav />
      <main>
        <Hero />
        <Projects />
        <ChitraguptaBridge />
        <Skills />
        <Experience />
      </main>
      <Contact />
    </div>
  );
}
