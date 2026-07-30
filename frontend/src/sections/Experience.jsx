import { experience } from "../data/experience";
import { ChipList } from "../components/ui/Chip";
import SectionHeader from "../components/ui/SectionHeader";
import { RevealGroup, RevealItem } from "../components/ui/Reveal";

export default function Experience() {
  return (
    <section
      id="experience"
      className="min-h-screen
                 bg-white dark:bg-black
                 text-black dark:text-white
                 px-6 py-32 flex justify-center"
    >
      <div className="max-w-4xl w-full">

        <SectionHeader title="My Experience" className="mb-20">
          Practical experience and community involvement.
        </SectionHeader>

        {/* Timeline */}
        <RevealGroup
          as="ol"
          className="relative border-l border-gray-300 dark:border-white/20 pl-12 space-y-20"
        >
          {experience.map((entry) => (
            <RevealItem key={entry.id} as="li" className="relative">
              {/* Dot */}
              <span
                aria-hidden="true"
                className="absolute left-[-25px] top-[6px]
                 w-4 h-4 rounded-full
                 bg-white dark:bg-black
                 border-2 border-black dark:border-white"
              ></span>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold">{entry.org}</h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {entry.role} · {entry.period}
                </p>

                <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {entry.body}
                </p>

                <ChipList
                  items={entry.skills}
                  variant="outline"
                  className="mt-4"
                />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

      </div>
    </section>
  );
}
