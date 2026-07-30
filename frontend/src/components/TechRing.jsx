import {
  FaReact,
  FaNodeJs,
  FaDocker,
  FaGitAlt,
  FaGithub,
  FaAws,
} from "react-icons/fa";
import {
  SiMongodb,
  SiExpress,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiHtml5,
  SiCss3,
  SiNextdotjs,
} from "react-icons/si";

export default function TechMarquee() {
  const icons = [
    FaGitAlt,
    FaGithub,
    SiNextdotjs,
    FaReact,
    FaNodeJs,
    SiExpress,
    SiMongodb,
    SiJavascript,
    SiTypescript,
    SiHtml5,
    SiCss3,
    SiTailwindcss,
    FaDocker,
    FaAws,
  ];

  return (
    <section className="w-full 
                    bg-gray-50 dark:bg-black 
                    py-24 flex justify-center">

  {/* Capsule container */}
  <div className="w-[80vw] max-w-6xl overflow-hidden rounded-full
                  bg-white/70 dark:bg-black/70
                  backdrop-blur-md
                  border border-gray-200 dark:border-white/10
                  py-6 group">

    {/* Marquee track */}
    <div
      className="flex w-max gap-20 px-10 animate-marquee
                 group-hover:[animation-play-state:paused]"
    >
      {[...icons, ...icons].map((Icon, index) => (
        <Icon
          key={index}
          className="text-gray-600 dark:text-white 
                     text-4xl opacity-70
                     hover:opacity-100
                     transition"
        />
      ))}
    </div>
  </div>
</section>
  );
}