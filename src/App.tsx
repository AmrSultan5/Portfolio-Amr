import { MotionConfig } from 'framer-motion';
import { useState } from 'react';
import { About } from './components/About';
import { Capabilities } from './components/Capabilities';
import { CaseStudyModal } from './components/CaseStudyModal';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Process } from './components/Process';
import { Stack } from './components/Stack';
import { Stats } from './components/Stats';
import { Work } from './components/Work';
import type { Project } from './data/projects';
import { useSmoothScroll } from './hooks/useSmoothScroll';

function App() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  useSmoothScroll();

  return (
    // reducedMotion="user" makes Framer honour prefers-reduced-motion: transform
    // and opacity animations snap to their end state rather than playing. Without
    // it Framer ignores the preference entirely — the CSS override in index.css
    // only reaches CSS animations, not JS-driven ones.
    <MotionConfig reducedMotion="user">
      <div className="max-w-full overflow-x-hidden bg-bg">
        <Header />
        <Hero />
        <Stats />
        <Work onSelect={setActiveProject} />
        <Capabilities />
        <Stack />
        <Process />
        <About />
        <Contact />
        <Footer />
        <CaseStudyModal project={activeProject} onClose={() => setActiveProject(null)} />
      </div>
    </MotionConfig>
  );
}

export default App;
