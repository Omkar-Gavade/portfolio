import { education } from "../data/education";
import { ChipList } from "../components/ui/Chip";
import SectionHeader from "../components/ui/SectionHeader";
import { RevealGroup, RevealItem } from "../components/ui/Reveal";

export default function Education() {
  return (
    <section
      id="education"
      className="bg-white dark:bg-black
                 text-black dark:text-white
                 px-6 py-20 flex justify-center"
    >
      <div className="max-w-4xl w-full">

        <SectionHeader title="Education" className="mb-14">
          Formal academic background supporting my foundation in computer
          science and software development.
        </SectionHeader>

        <RevealGroup className="space-y-8">
          {education.map((entry) => (
            <RevealItem
              key={entry.id}
              as="article"
              className="border border-gray-200 dark:border-white/10
                         rounded-xl p-6 space-y-4
                         bg-gray-50 dark:bg-transparent"
            >
              {/* Degree */}
              <div>
                <h3 className="text-lg font-medium">{entry.degree}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.institution} · {entry.period}
                </p>
              </div>

              {/* CGPA */}
              {entry.cgpa && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  CGPA: <span className="font-medium">{entry.cgpa}</span>
                </p>
              )}

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {entry.description}
              </p>

              {/* Coursework */}
              {entry.coursework?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Relevant Coursework
                  </p>
                  <ChipList items={entry.coursework} size="sm" />
                </div>
              )}
            </RevealItem>
          ))}
        </RevealGroup>

      </div>
    </section>
  );
}
