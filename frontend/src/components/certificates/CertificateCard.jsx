import { Eye, ShieldCheck } from "lucide-react";
import { issuerInitials } from "../../data/certificates";
import { EVENTS, track } from "../../lib/analytics";
import ActionButton from "../ui/ActionButton";
import { ChipList } from "../ui/Chip";
import { RevealItem } from "../ui/Reveal";

/** Issuer logo, falling back to initials in the same circular frame. */
function IssuerMark({ certificate }) {
  if (certificate.logo) {
    return (
      <div
        className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full
                   border border-gray-300 dark:border-white/15
                   bg-white dark:bg-white/5"
      >
        <img
          src={certificate.logo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="w-6 h-6 object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full
                 border border-gray-300 dark:border-white/15
                 text-sm font-medium text-gray-700 dark:text-gray-200"
      aria-hidden="true"
    >
      {issuerInitials(certificate.issuer)}
    </div>
  );
}

export default function CertificateCard({ certificate, onPreview }) {
  const { credentialUrl, image } = certificate;

  return (
    <RevealItem
      as="article"
      className="border border-gray-200 dark:border-white/10
                 bg-gray-50 dark:bg-transparent
                 rounded-xl p-6 h-full flex flex-col"
    >
      <div className="flex items-start gap-4">
        <IssuerMark certificate={certificate} />

        <div className="min-w-0">
          <h3 className="text-lg font-medium leading-snug">
            {certificate.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {certificate.issuer}
            {certificate.issued && ` · Issued ${certificate.issued}`}
          </p>
          {certificate.credentialId && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 break-all">
              Credential ID: {certificate.credentialId}
            </p>
          )}
        </div>
      </div>

      <ChipList items={certificate.skills} className="mt-5" />

      <div className="mt-auto pt-6 flex flex-wrap items-center gap-3">
        <ActionButton
          icon={Eye}
          onClick={onPreview}
          disabled={!image}
          disabledHint="Certificate image not available"
        >
          Preview
        </ActionButton>

        <ActionButton
          href={credentialUrl ?? undefined}
          external
          icon={ShieldCheck}
          disabled={!credentialUrl}
          disabledHint="Credential link not available"
          onClick={() =>
            track(EVENTS.CERTIFICATE_CREDENTIAL_CLICK, {
              certificate: certificate.id,
              issuer: certificate.issuer,
            })
          }
        >
          View Credential
        </ActionButton>
      </div>
    </RevealItem>
  );
}
