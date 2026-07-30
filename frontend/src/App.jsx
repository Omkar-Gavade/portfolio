import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Contact from "./sections/Contact";
import TechRing from "./components/TechRing";
import Skills from "./sections/Skills";
import Education from "./sections/Education";
import Certificates from "./sections/Certificates";
import GithubActivity from "./sections/GithubActivity";

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main>
        <Hero />
        <About />
        <TechRing />
        <Skills />
        <Education />
        <Certificates />
        <Experience />
        <Projects />
        <GithubActivity />
        <Contact />
      </main>
      <Analytics />
    </div>
  );
}
