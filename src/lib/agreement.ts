export type Deliverable = {
  id: string;
  title: string;
  description: string;
};

export type Clause = {
  id: string;
  title: string;
  body: string;
};

export type Agreement = {
  agreementId: string;
  effectiveDate: string;
  agencySignatory: string;
  agencyTitle: string;
  clientName: string;
  clientRepresentative: string;
  clientDesignation: string;
  clientContact: string;
  clientLocation: string;
  projectTitle: string;
  overview: string;
  deliverables: Deliverable[];
  fee: number;
  advancePercent: number;
  timeline: string;
  revisions: string;
  clauses: Clause[];
};

const INR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatINR(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "₹0";
  return `₹${INR.format(Math.round(value))}`;
}

export function parseAmount(value: string): number {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function toDate(iso: string): Date | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLongDate(iso: string): string {
  const date = toDate(iso);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatNumericDate(iso: string): string {
  const date = toDate(iso);
  if (!date) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

export function paymentSplit(fee: number, advancePercent: number) {
  const total = Math.max(0, Math.round(Number.isFinite(fee) ? fee : 0));
  const percent = Math.min(100, Math.max(0, Number.isFinite(advancePercent) ? advancePercent : 0));
  const advance = Math.round((total * percent) / 100);
  return {
    total,
    advance,
    balance: total - advance,
    advanceLabel: `${percent}%`,
    balanceLabel: `${100 - percent}%`,
  };
}

let deliverableSequence = 0;

export function createDeliverable(): Deliverable {
  deliverableSequence += 1;
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `d-${Date.now()}-${deliverableSequence}`;

  return {
    id,
    title: "New deliverable",
    description: "Describe the output, formats and quantity included.",
  };
}

export const DEFAULT_AGREEMENT: Agreement = {
  agreementId: "AGR-2026-001",
  effectiveDate: "2026-11-18",
  agencySignatory: "Rishabh Srivastava",
  agencyTitle: "Founder, Webli Studio",
  clientName: "Browncoffee",
  clientRepresentative: "Aarav Mehta",
  clientDesignation: "Authorised Representative",
  clientContact: "hello@browncoffee.in",
  clientLocation: "Pratapgarh, India",
  projectTitle: "Brand Website & Digital Identity",
  overview:
    "Webli Studio will design and build a new brand website for the Client — a fast, mobile-first digital home that presents the brand's identity, product and story with clarity. The engagement spans visual direction, interface design, development and launch, delivered as one coherent system across every screen.",
  deliverables: [
    {
      id: "d-1",
      title: "Brand & Visual Direction",
      description: "Logo refinement, colour palette, typography system and a concise brand usage guide.",
    },
    {
      id: "d-2",
      title: "Website Design — 5 Pages",
      description: "Home, About, Menu, Gallery and Contact, with responsive layouts for desktop and mobile.",
    },
    {
      id: "d-3",
      title: "Development & Responsive Build",
      description: "Next.js front end, lightweight content structure, SEO fundamentals and performance tuning.",
    },
    {
      id: "d-4",
      title: "Launch & Handover",
      description: "Domain configuration, deployment, analytics setup and a recorded handover walkthrough.",
    },
  ],
  fee: 150000,
  advancePercent: 50,
  timeline: "14 Working Days",
  revisions: "2 Rounds",
  clauses: [
    {
      id: "c-1",
      title: "Scope of Work & Revisions",
      body: "Webli Studio will design, develop and deliver the services described in this Agreement in accordance with the project scope, deliverables and timeline set out above. The engagement includes the revision rounds stated in the Commercials section. Revisions are limited to the refinement of approved directions; new pages, features or changes of direction are treated as additional scope and quoted separately in writing. Any request received after written sign-off is considered a new change request.",
    },
    {
      id: "c-2",
      title: "Payment Terms & Non-Refundable Advance",
      body: "The Client agrees to pay the Total Project Fee in the instalments set out in the Payment Schedule. The Advance is due on execution of this Agreement and is strictly non-refundable once design and development work has commenced, as it reserves studio time and resources. The Balance is payable upon completion and before final handover, deployment or transfer of source files. Invoices are payable within seven (7) days of issue. Applicable GST, if any, is charged in addition.",
    },
    {
      id: "c-3",
      title: "Client Responsibilities & Content Delivery",
      body: "The Client will provide all required content — copy, imagery, brand assets, product information and access credentials — within five (5) working days of request. The Client will nominate a single representative with authority to review and approve work. Any delay in providing content, feedback or approvals extends the estimated timeline on a day-for-day basis. The Client confirms that it holds the rights and licences for all material supplied and indemnifies Webli Studio against claims arising from it.",
    },
    {
      id: "c-4",
      title: "Intellectual Property & Source Code Ownership",
      body: "All work created under this Agreement, including design files and source code, remains the intellectual property of Webli Studio until the Total Project Fee has been received in full. Upon full payment, ownership of the final approved deliverables and the project source code transfers to the Client. Webli Studio retains the right to display the work in its portfolio and marketing material. Third-party assets, fonts, plugins and licences remain subject to their own terms and are not transferred.",
    },
    {
      id: "c-5",
      title: "Confidentiality & Termination",
      body: "Each party will keep confidential all non-public information disclosed during the engagement and will use it only for the purposes of this Agreement. Either party may terminate this Agreement by giving seven (7) days' written notice. On termination, the Client will pay for all work completed up to the termination date, and the Advance remains non-refundable. Webli Studio will hand over work in progress only against payment for that work.",
    },
    {
      id: "c-6",
      title: "Governing Law",
      body: "This Agreement is governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with this Agreement is subject to the exclusive jurisdiction of the competent courts at Pratapgarh, Uttar Pradesh, India. This document, together with its annexures, constitutes the entire agreement between the parties and supersedes all prior discussions and proposals.",
    },
  ],
};
