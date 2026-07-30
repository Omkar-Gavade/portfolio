import { Suspense, lazy, useState } from "react";
import { sortedCertificates } from "../data/certificates";
import { EVENTS, track } from "../lib/analytics";
import CertificateCard from "../components/certificates/CertificateCard";
import SectionHeader from "../components/ui/SectionHeader";
import { RevealGroup } from "../components/ui/Reveal";

const CertificateModal = lazy(() =>
  import("../components/certificates/CertificateModal")
);

export default function Certificates() {
  const certificates = sortedCertificates();
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(false);

  const active = certificates.find((certificate) => certificate.id === activeId);

  const openPreview = (certificate) => {
    setActiveId(certificate.id);
    setOpen(true);
    track(EVENTS.CERTIFICATE_PREVIEW_OPEN, {
      certificate: certificate.id,
      issuer: certificate.issuer,
    });
  };

  // An empty list ships nothing rather than an empty section. In development
  // the section stays visible with a note, so it's obvious where to add them.
  if (certificates.length === 0 && !import.meta.env.DEV) return null;

  return (
    <section
      id="certificates"
      className="bg-white dark:bg-black
                 text-black dark:text-white
                 px-6 py-24 flex justify-center"
    >
      <div className="max-w-6xl w-full">
        <SectionHeader title="Certificates">
          Verified certifications and course credentials backing the tools and
          fundamentals I work with.
        </SectionHeader>

        {certificates.length > 0 ? (
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onPreview={() => openPreview(certificate)}
              />
            ))}
          </RevealGroup>
        ) : (
          <div
            className="border border-dashed border-gray-300 dark:border-white/15
                       rounded-xl p-6 text-center
                       text-sm text-gray-600 dark:text-gray-400"
          >
            No certificates yet. Add them to{" "}
            <code className="text-black dark:text-white">
              src/data/certificates.js
            </code>{" "}
            — this placeholder only renders during development.
          </div>
        )}

        {active && (
          <Suspense fallback={null}>
            <CertificateModal
              certificate={active}
              open={open}
              onClose={() => setOpen(false)}
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}
