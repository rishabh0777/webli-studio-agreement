"use client";

import { useRef, useState } from "react";
import {
  type Agreement,
  type Deliverable,
  createDeliverable,
  formatINR,
  parseAmount,
  paymentSplit,
} from "@/lib/agreement";

type SidebarEditorProps = {
  data: Agreement;
  onChange: (next: Agreement) => void;
  clientLogo: string | null;
  onClientLogoChange: (value: string | null) => void;
  signature: string | null;
  onSignatureChange: (value: string | null) => void;
};

const inputClass =
  "w-full border-0 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-[13px] leading-5 text-black outline-none transition-colors placeholder:text-[#B3B3B3] focus:border-black";
const monoInputClass = `${inputClass} font-mono text-[12px]`;
const textareaClass =
  "w-full resize-y border border-[#E5E5E5] bg-white px-2.5 py-2 text-[12.5px] leading-5 text-black outline-none transition-colors placeholder:text-[#B3B3B3] focus:border-black";

function Section({
  index,
  title,
  description,
  children,
}: {
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#E5E5E5] px-6 py-6">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-[9px] tracking-[0.16em] text-[#B3B3B3]">{index}</span>
        <h2 className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-black">{title}</h2>
      </div>
      {description ? <p className="mb-4 text-[11.5px] leading-4 text-[#8A8A8A]">{description}</p> : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7A7A7A]">{label}</span>
        {hint ? <span className="text-[10px] text-[#B3B3B3]">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function Uploader({
  label,
  hint,
  accept,
  value,
  onChange,
  tall,
}: {
  label: string;
  hint: string;
  accept: string;
  value: string | null;
  onChange: (value: string | null) => void;
  tall?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a PNG, JPG or SVG file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Keep the file under 4 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.onerror = () => setError("That file could not be read.");
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7A7A7A]">{label}</span>
        <span className="text-[10px] text-[#B3B3B3]">{hint}</span>
      </div>
      <div className="mt-2 border border-[#E5E5E5] bg-white">
        {value ? (
          <div className="flex items-center gap-3 p-2.5">
            <div
              className={`flex shrink-0 items-center justify-center overflow-hidden border border-[#EFEFEF] bg-white p-1 ${
                tall ? "h-14 w-24" : "h-12 w-20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt={`${label} preview`} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[11px] text-[#6B6B6B]">Uploaded</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-black underline decoration-[#C7C7C7] underline-offset-2 hover:decoration-black"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8A8A8A] underline decoration-[#DCDCDC] underline-offset-2 hover:text-black"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-[#FCFCFC]"
          >
            <span className="text-[12px] text-[#6B6B6B]">Choose file</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#A3A3A3]">{accept}</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {error ? <p className="mt-1.5 text-[10.5px] text-black">{error}</p> : null}
    </div>
  );
}

export default function SidebarEditor({
  data,
  onChange,
  clientLogo,
  onClientLogoChange,
  signature,
  onSignatureChange,
}: SidebarEditorProps) {
  function update<K extends keyof Agreement>(key: K, value: Agreement[K]) {
    onChange({ ...data, [key]: value });
  }

  function updateDeliverable(id: string, patch: Partial<Deliverable>) {
    onChange({
      ...data,
      deliverables: data.deliverables.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function addDeliverable() {
    onChange({ ...data, deliverables: [...data.deliverables, createDeliverable()] });
  }

  function removeDeliverable(id: string) {
    if (data.deliverables.length <= 1) return;
    onChange({ ...data, deliverables: data.deliverables.filter((item) => item.id !== id) });
  }

  function updateClause(id: string, patch: { title?: string; body?: string }) {
    onChange({
      ...data,
      clauses: data.clauses.map((clause) => (clause.id === id ? { ...clause, ...patch } : clause)),
    });
  }

  const split = paymentSplit(data.fee, data.advancePercent);

  return (
    <aside className="app-sidebar flex w-full shrink-0 flex-col border-b border-[#E5E5E5] bg-[#F8F8F8] lg:min-h-0 lg:w-[420px] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-5">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/transparent.svg" alt="Webli Studio" className="h-8 w-8" />
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.24em] text-black">
              Webli Studio
            </p>
            <p className="mt-1.5 text-[11px] leading-none text-[#8A8A8A]">Service Agreement Generator</p>
          </div>
        </div>
        <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#B3B3B3]">2026</span>
      </div>

      <div className="thin-scroll flex-1 lg:overflow-y-auto">
        <Section index="01" title="Agreement & Parties">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Agreement ID" hint="AGR">
              <input
                className={monoInputClass}
                value={data.agreementId}
                onChange={(event) => update("agreementId", event.target.value)}
                placeholder="AGR-2026-001"
              />
            </Field>
            <Field label="Effective date">
              <input
                type="date"
                className={monoInputClass}
                value={data.effectiveDate}
                onChange={(event) => update("effectiveDate", event.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Agency signatory">
              <input
                className={inputClass}
                value={data.agencySignatory}
                onChange={(event) => update("agencySignatory", event.target.value)}
                placeholder="Rishabh Srivastava"
              />
            </Field>
            <Field label="Title">
              <input
                className={inputClass}
                value={data.agencyTitle}
                onChange={(event) => update("agencyTitle", event.target.value)}
                placeholder="Founder, Webli Studio"
              />
            </Field>
          </div>

          <Field label="Client / Brand name">
            <input
              className={inputClass}
              value={data.clientName}
              onChange={(event) => update("clientName", event.target.value)}
              placeholder="Browncoffee"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Client representative">
              <input
                className={inputClass}
                value={data.clientRepresentative}
                onChange={(event) => update("clientRepresentative", event.target.value)}
                placeholder="Aarav Mehta"
              />
            </Field>
            <Field label="Designation">
              <input
                className={inputClass}
                value={data.clientDesignation}
                onChange={(event) => update("clientDesignation", event.target.value)}
                placeholder="Authorised Representative"
              />
            </Field>
          </div>

          <Field label="Client contact / email">
            <input
              className={monoInputClass}
              value={data.clientContact}
              onChange={(event) => update("clientContact", event.target.value)}
              placeholder="hello@brand.com"
            />
          </Field>

          <Field label="Client location">
            <input
              className={inputClass}
              value={data.clientLocation}
              onChange={(event) => update("clientLocation", event.target.value)}
              placeholder="Pratapgarh, India"
            />
          </Field>
        </Section>

        <Section
          index="02"
          title="Brand & Signatures"
          description="Uploaded assets render directly on the A4 sheet and are embedded in the exported PDF."
        >
          <Uploader
            label="Client logo"
            hint="PNG · JPG · SVG"
            accept="image/png,image/jpeg,image/svg+xml"
            value={clientLogo}
            onChange={onClientLogoChange}
          />
          <Uploader
            label="Agency signature"
            hint="Transparent PNG"
            accept="image/png,image/jpeg"
            value={signature}
            onChange={onSignatureChange}
            tall
          />
        </Section>

        <Section index="03" title="Project Scope & Deliverables">
          <Field label="Project title">
            <input
              className={inputClass}
              value={data.projectTitle}
              onChange={(event) => update("projectTitle", event.target.value)}
              placeholder="Brand Website & Digital Identity"
            />
          </Field>

          <Field label="Overview / objective">
            <textarea
              className={textareaClass}
              rows={5}
              value={data.overview}
              onChange={(event) => update("overview", event.target.value)}
              placeholder="What the engagement covers and the outcome it delivers."
            />
          </Field>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7A7A7A]">Deliverables</span>
            <span className="font-mono text-[9px] text-[#B3B3B3]">
              {String(data.deliverables.length).padStart(2, "0")}
            </span>
          </div>

          <div className="space-y-3">
            {data.deliverables.map((item, index) => (
              <div key={item.id} className="border border-[#E5E5E5] bg-white/70 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[9.5px] tracking-[0.14em] text-[#A3A3A3]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDeliverable(item.id)}
                    disabled={data.deliverables.length <= 1}
                    className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8A8A8A] transition-colors hover:text-black disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
                <input
                  className={inputClass}
                  value={item.title}
                  onChange={(event) => updateDeliverable(item.id, { title: event.target.value })}
                  placeholder="Deliverable title"
                  aria-label={`Deliverable ${index + 1} title`}
                />
                <textarea
                  className="mt-1 w-full resize-y border-0 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-[12px] leading-5 text-[#333333] outline-none transition-colors placeholder:text-[#B3B3B3] focus:border-black"
                  rows={2}
                  value={item.description}
                  onChange={(event) => updateDeliverable(item.id, { description: event.target.value })}
                  placeholder="Short description"
                  aria-label={`Deliverable ${index + 1} description`}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addDeliverable}
              className="flex w-full items-center justify-between border border-dashed border-[#D4D4D4] px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#6B6B6B] transition-colors hover:border-black hover:text-black"
            >
              <span>Add deliverable</span>
              <span className="text-[13px] leading-none">+</span>
            </button>
          </div>
        </Section>

        <Section index="04" title="Commercials & Timeline">
          <Field label="Total project fee" hint="INR">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[13px] text-[#8A8A8A]">₹</span>
              <input
                className={monoInputClass}
                inputMode="numeric"
                value={data.fee ? String(data.fee) : ""}
                onChange={(event) => update("fee", parseAmount(event.target.value))}
                placeholder="150000"
              />
            </div>
          </Field>
          <p className="-mt-2 font-mono text-[10.5px] tracking-[0.04em] text-[#8A8A8A]">{formatINR(data.fee)}</p>

          <div className="border border-[#E5E5E5] bg-white px-3 py-2.5">
            <div className="flex items-baseline justify-between border-b border-[#EFEFEF] py-1.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#7A7A7A]">
                Advance · {split.advanceLabel}
              </span>
              <span className="font-mono text-[12px] text-black">{formatINR(split.advance)}</span>
            </div>
            <div className="flex items-baseline justify-between py-1.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#7A7A7A]">
                Balance · {split.balanceLabel}
              </span>
              <span className="font-mono text-[12px] text-black">{formatINR(split.balance)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Timeline">
              <input
                className={inputClass}
                value={data.timeline}
                onChange={(event) => update("timeline", event.target.value)}
                placeholder="14 Working Days"
              />
            </Field>
            <Field label="Revisions">
              <input
                className={inputClass}
                value={data.revisions}
                onChange={(event) => update("revisions", event.target.value)}
                placeholder="2 Rounds"
              />
            </Field>
          </div>
        </Section>

        <Section
          index="05"
          title="Legal Clauses"
          description="Pre-filled with Indian web agency defaults. Edit any clause; the document repaginates as you type."
        >
          {data.clauses.map((clause, index) => (
            <div key={clause.id} className="border border-[#E5E5E5] bg-white/70 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[9.5px] tracking-[0.14em] text-[#A3A3A3]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#C7C7C7]">Clause</span>
              </div>
              <input
                className={`${inputClass} font-medium`}
                value={clause.title}
                onChange={(event) => updateClause(clause.id, { title: event.target.value })}
                aria-label={`Clause ${index + 1} title`}
              />
              <textarea
                className="mt-1 w-full resize-y border-0 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-[12px] leading-[1.65] text-[#333333] outline-none transition-colors focus:border-black"
                rows={5}
                value={clause.body}
                onChange={(event) => updateClause(clause.id, { body: event.target.value })}
                aria-label={`Clause ${index + 1} body`}
              />
            </div>
          ))}
        </Section>

        <div className="px-6 py-5">
          <p className="font-mono text-[8.5px] uppercase leading-5 tracking-[0.16em] text-[#B3B3B3]">
            Draft document · Webli Studio / 2026
          </p>
        </div>
      </div>
    </aside>
  );
}
