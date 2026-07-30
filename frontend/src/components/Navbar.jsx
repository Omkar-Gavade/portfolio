// import { useState } from "react";

// export default function Navbar() {
//   const [active, setActive] = useState("Home");

//   const links = [
//     "Home",
//     "About",   
//     "Skills",
//     "Education",
//     "Experience",
//     "Projects",
//     "Contact",
//   ];

//   return (
//     <header className="fixed top-6 left-0 w-full z-50">
//       <div className="flex items-center justify-center relative">

//         {/* Center pill navbar */}
//         <nav className="flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3 py-2 border border-white/10">
//           {links.map((link) => (
//             <a
//               key={link}
//               href={`#${link.toLowerCase()}`}
//               onClick={() => setActive(link)}
//               className={`px-4 py-2 text-sm rounded-full transition-all
//                 ${
//                   active === link
//                     ? "bg-white text-black"
//                     : "text-gray-300 hover:text-white"
//                 }`}
//             >
//               {link}
//             </a>
//           ))}
//         </nav>

//         {/* Right controls */}
//         <div className="absolute right-8 flex items-center gap-3">
//           {/* Language button (UI only for now) */}
//           <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 border border-white/10 text-sm text-white">
//             🇬🇧 English
//           </button>

//           {/* Theme toggle (UI only for now) */}
//           <button className="w-10 h-10 rounded-full bg-black/70 border border-white/10 text-white flex items-center justify-center">
//             🌙
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }

// import { useEffect, useState } from "react";
// import ThemeToggle from "./ThemeToggle";

// export default function Navbar() {
//   const [active, setActive] = useState("home");

//   const links = [
//     "home",
//     "about",
//     "skills",
//     "education",
//     "experience",
//     "projects",
//     "contact",
//   ];

//   // Scroll-spy logic
//   useEffect(() => {
//     const sections = links.map((id) => document.getElementById(id));

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setActive(entry.target.id);
//           }
//         });
//       },
//       {
//         rootMargin: "-40% 0px -50% 0px",
//         threshold: 0,
//       }
//     );

//     sections.forEach((section) => {
//       if (section) observer.observe(section);
//     });

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <header className="fixed top-4 left-0 w-full z-50 px-3">
//   <div className="flex flex-col items-center gap-3">

//     {/* Navbar pill */}
//     <nav className="flex items-center gap-2 rounded-full 
//                     bg-white/70 dark:bg-black/70
//                     backdrop-blur-md 
//                     px-3 py-2 
//                     border border-gray-200 dark:border-white/10 
//                     overflow-x-auto scrollbar-hide max-w-full">

//       {links.map((link) => (
//         <a
//           key={link}
//           href={`#${link}`}
//           className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-all duration-300
//             ${
//               active === link
//                 ? "bg-black text-white dark:bg-white dark:text-black"
//                 : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
//             }`}
//         >
//           {link.charAt(0).toUpperCase() + link.slice(1)}
//         </a>
//       ))}
//     </nav>

//     {/* Right controls */}
//     <div className="hidden md:flex items-center gap-3 md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2">

//       {/* Language */}
//       <button className="flex items-center gap-2 px-4 py-2 rounded-full 
//                          bg-white/70 dark:bg-black/70 
//                          border border-gray-200 dark:border-white/10 
//                          text-sm text-black dark:text-white">
//         🇬🇧 English
//       </button>

//       {/* Theme Toggle */}
//       <ThemeToggle />
//     </div>

//   </div>
// </header>
//   );
// }

import { useEffect, useState } from "react";
import { certificates } from "../data/certificates";
import ThemeToggle from "./ThemeToggle";

// `label` is explicit so casing like "GitHub" survives.
//
// The Certificates section removes itself when there are no certificates yet,
// so its link is conditional too — otherwise the nav points at an anchor that
// isn't on the page.
const links = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  ...(certificates.length > 0
    ? [{ id: "certificates", label: "Certificates" }]
    : []),
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "github", label: "GitHub" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [showToggle, setShowToggle] = useState(true);

  // Scroll-spy
  useEffect(() => {
    const sections = links
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // ✅ ONLY TOGGLE HIDE ON SCROLL (mobile)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setShowToggle(true);
      } else {
        setShowToggle(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 left-0 w-full z-50 px-3">
      <div className="relative flex justify-center items-center">

        {/* Navbar pill */}
        <nav aria-label="Primary"
             className="flex items-center gap-2 rounded-full
                        bg-white/70 dark:bg-black/70
                        backdrop-blur-md 
                        px-3 py-2 
                        border border-gray-200 dark:border-white/10
                        overflow-x-auto scrollbar-hide
                        max-w-[calc(100%-8rem)] md:max-w-[calc(100%-25rem)]">

          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={active === link.id ? "true" : undefined}
              className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-all duration-300
                ${
                  active === link.id
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ✅ MOBILE TOGGLE (RIGHT + HIDE ON SCROLL) */}
        <div
          className={`md:hidden absolute right-3 transition-all duration-300
            ${showToggle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
        >
          <ThemeToggle />
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-3 absolute right-8 top-1/2 -translate-y-1/2">

          <button className="flex items-center gap-2 px-4 py-2 rounded-full 
                             bg-white/70 dark:bg-black/70 
                             border border-gray-200 dark:border-white/10 
                             text-sm text-black dark:text-white">
            🇬🇧 English
          </button>

          <ThemeToggle />
        </div>

      </div>
    </header>
  );
}