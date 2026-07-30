import { useRef } from "react";
import { useInView } from "framer-motion";
import { Github } from "lucide-react";
import { site } from "../data/site";
import { EVENTS, track } from "../lib/analytics";
import ActionButton from "../components/ui/ActionButton";
import ContributionGraph from "../components/github/ContributionGraph";
import RecentRepos from "../components/github/RecentRepos";
import Reveal from "../components/ui/Reveal";
import SectionHeader from "../components/ui/SectionHeader";

export default function GithubActivity() {
  const ref = useRef(null);
  // Both GitHub endpoints are only hit once the section is actually
  // approaching the viewport, so they cost nothing on first paint.
  const inView = useInView(ref, { once: true, margin: "200px 0px" });

  return (
    <section
      ref={ref}
      id="github"
      className="bg-white dark:bg-black
                 text-black dark:text-white
                 px-6 py-24 flex justify-center"
    >
      <div className="max-w-6xl w-full">
        <SectionHeader title="GitHub Activity">
          What I have been building lately — a year of contribution history and
          the repositories worth a closer look.
        </SectionHeader>

        {inView && (
          <>
            <Reveal
              className="border border-gray-200 dark:border-white/10
                         bg-gray-50 dark:bg-transparent
                         rounded-xl p-6 mb-10"
            >
              <ContributionGraph />
            </Reveal>

            <RecentRepos />
          </>
        )}

        <Reveal className="mt-12 flex justify-center" delay={0.1}>
          <ActionButton
            href={site.socials.github}
            external
            size="lg"
            variant="secondary"
            icon={Github}
            onClick={() =>
              track(EVENTS.GITHUB_CLICK, { source: "activity_profile" })
            }
          >
            View full profile
          </ActionButton>
        </Reveal>
      </div>
    </section>
  );
}
