import { skillGroups } from "../data/skills";
import { ChipList } from "../components/ui/Chip";
import SectionHeader from "../components/ui/SectionHeader";
import { RevealGroup, RevealItem } from "../components/ui/Reveal";

export default function Skills() {
  return (
    <section
      id="skills"
      className="bg-white dark:bg-black
                 text-black dark:text-white
                 px-6 py-24 flex justify-center"
    >
      <div className="max-w-6xl w-full">

        <SectionHeader title="Skills & Tech Stack">
          Technologies and concepts I use to design, build, and deploy
          full-stack applications.
        </SectionHeader>

        {/* Skills Grid */}
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {skillGroups.map((group) => (
            <RevealItem
              key={group.title}
              className={`border border-gray-200 dark:border-white/10
                          bg-gray-50 dark:bg-transparent
                          rounded-xl p-6 ${group.wide ? "md:col-span-2" : ""}`}
            >
              <h3 className="text-lg font-medium mb-4">{group.title}</h3>
              <ChipList items={group.items} size="sm" />
            </RevealItem>
          ))}
        </RevealGroup>

      </div>
    </section>
  );
}
