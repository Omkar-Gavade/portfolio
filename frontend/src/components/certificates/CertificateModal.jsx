import { ShieldCheck } from "lucide-react";
import { EVENTS, track } from "../../lib/analytics";
import ActionButton from "../ui/ActionButton";
import { ChipList } from "../ui/Chip";
import Modal from "../ui/Modal";
import ZoomImage from "../ui/ZoomImage";

export default function CertificateModal({ certificate, open, onClose }) {
  if (!certificate) return null;

  const { credentialUrl } = certificate;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={certificate.title}
      subtitle={`${certificate.issuer}${
        certificate.issued ? ` · Issued ${certificate.issued}` : ""
      }`}
      footer={
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
              source: "modal",
            })
          }
        >
          View Credential
        </ActionButton>
      }
    >
      <div className="space-y-6">
        <ZoomImage
          src={certificate.image}
          alt={`${certificate.title} certificate issued by ${certificate.issuer}`}
        />

        {certificate.skills?.length > 0 && (
          <div>
            <h4 className="text-lg font-medium mb-4">Skills</h4>
            <ChipList items={certificate.skills} />
          </div>
        )}
      </div>
    </Modal>
  );
}
