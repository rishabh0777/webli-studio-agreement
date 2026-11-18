"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type Agreement,
  type Clause,
  type Deliverable,
  formatINR,
  formatLongDate,
  formatNumericDate,
  paymentSplit,
} from "@/lib/agreement";

const LOGO_SRC = "/logo/transparent.svg";

type AgreementDocumentProps = {
  data: Agreement;
  clientLogo: string | null;
  signature: string | null;
  onPageCount?: (count: number) => void;
};

/* ------------------------------------------------------------------ */
/* Sheet furniture                                                     */
/* ------------------------------------------------------------------ */

function DocHeader({ data, clientLogo }: { data: Agreement; clientLogo: string | null }) {
  return (
    <div className="doc-header w-full flex items-center">
      <div className="doc-header-row w-full flex items-center justify-between">
        <div className="doc-header-left">
          <div className="doc-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="" />
            <span className="doc-brand-word">
              WEBLI
              <br />
              STUDIO
            </span>
          </div>
        </div>
        <div className="doc-header-right ml-auto flex items-center gap-3">
          <span className="doc-pill">→ Agreement #{data.agreementId}</span>
          {clientLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="doc-client-logo h-8 w-auto object-contain" src={clientLogo} alt="" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DocFooter({ page, total }: { page: number; total: number }) {
  return (
    <div className="doc-footer w-full">
      <div className="doc-footer-row w-full flex items-center justify-between gap-3">
        <span className="doc-footer-left">WEBLI STUDIO / 2026</span>
        <span className="doc-footer-center">
          Page {page} of {total}
        </span>
        <span className="doc-footer-right">INDIA ↗</span>
      </div>
    </div>
  );
}

function Sheet({
  children,
  page,
  total,
  data,
  clientLogo,
}: {
  children?: ReactNode;
  page: number;
  total: number;
  data: Agreement;
  clientLogo: string | null;
}) {
  return (
    <section className="a4-page" data-export-page="true">
      <div className="doc-watermark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_SRC} alt="" />
      </div>
      <DocHeader data={data} clientLogo={clientLogo} />
      <div className="a4-body">{children}</div>
      <DocFooter page={page} total={total} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Document blocks                                                     */
/* ------------------------------------------------------------------ */

function TitleBlock({ data }: { data: Agreement }) {
  return (
    <div className="doc-block">
      <p className="doc-title-italic">Service</p>
      <h1 className="doc-title-main">AGREEMENT</h1>
      <p className="doc-lede">
        This Service Agreement is entered into between <strong>{data.clientName || "the Client"}</strong> and Webli
        Studio for <strong>{data.projectTitle || "the project described below"}</strong>, on the terms set out in this
        document.
      </p>
      <p className="doc-lede-mono">
        AGREEMENT ID {data.agreementId} &nbsp;/&nbsp; EFFECTIVE {formatNumericDate(data.effectiveDate)} &nbsp;/&nbsp;
        GOVERNING LAW INDIA
      </p>
    </div>
  );
}

function PartiesBlock({ data }: { data: Agreement }) {
  return (
    <div className="doc-block">
      <table className="doc-parties">
        <tbody>
          <tr>
            <td className="doc-party doc-party-left">
              <span className="doc-label">SERVICE PROVIDER</span>
              <p className="doc-party-name">Webli Studio</p>
              <p className="doc-party-role">Design &amp; development studio</p>
              <p className="doc-party-meta">
                {(data.agencySignatory || "—").toUpperCase()}
                <br />
                {(data.agencyTitle || "FOUNDER, WEBLI STUDIO").toUpperCase()}
                <br />
                HELLO@WEBLI.STUDIO
                <br />
                INDIA
              </p>
            </td>
            <td className="doc-party doc-party-right">
              <span className="doc-label">CLIENT</span>
              <p className="doc-party-name">{data.clientName || "—"}</p>
              <p className="doc-party-role">
                {data.clientRepresentative || "—"}
                {data.clientDesignation ? (
                  <>
                    <br />
                    {data.clientDesignation}
                  </>
                ) : null}
                <br />
                {data.clientLocation || "—"}
              </p>
              <p className="doc-party-meta">
                {(data.clientContact || "—").toUpperCase()}
                <br />
                EFFECTIVE {formatNumericDate(data.effectiveDate)}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function OverviewBlock({ data }: { data: Agreement }) {
  return (
    <div className="doc-block">
      <div className="doc-section-head">
        <span className="doc-section-title">PROJECT OVERVIEW</span>
        <span className="doc-section-meta">{(data.projectTitle || "PROJECT").toUpperCase()}</span>
      </div>
      <p className="doc-body-text">{data.overview || "—"}</p>
    </div>
  );
}

function DeliverablesBlock({
  items,
  continued,
  startIndex,
  totalItems,
}: {
  items: Deliverable[];
  continued: boolean;
  startIndex: number;
  totalItems: number;
}) {
  return (
    <div className="doc-block">
      <div className="doc-section-head">
        <span className="doc-section-title">{continued ? "DELIVERABLES — CONTINUED" : "DELIVERABLES"}</span>
        <span className="doc-section-meta">
          {totalItems} ITEM{totalItems === 1 ? "" : "S"}
        </span>
      </div>
      <table className="doc-table">
        <colgroup>
          <col style={{ width: "9mm" }} />
          <col style={{ width: "47mm" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>NO.</th>
            <th>DELIVERABLE</th>
            <th>DETAILS</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="doc-row-index">{String(startIndex + index + 1).padStart(2, "0")}</td>
              <td className="doc-row-title">{item.title || "Untitled deliverable"}</td>
              <td className="doc-row-desc">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeliverableRowMeasure({ item, index }: { item: Deliverable; index: number }) {
  return (
    <table className="doc-table">
      <colgroup>
        <col style={{ width: "9mm" }} />
        <col style={{ width: "47mm" }} />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td className="doc-row-index">{String(index + 1).padStart(2, "0")}</td>
          <td className="doc-row-title">{item.title || "Untitled deliverable"}</td>
          <td className="doc-row-desc">{item.description}</td>
        </tr>
      </tbody>
    </table>
  );
}

function CommercialsBlock({ data }: { data: Agreement }) {
  const split = paymentSplit(data.fee, data.advancePercent);

  return (
    <div className="doc-block">
      <div className="doc-commercials">
        <div className="doc-commercials-head">
          <span className="doc-section-title">COMMERCIALS</span>
          <span className="doc-section-meta">PAYMENT SCHEDULE · INR</span>
        </div>
        <table className="doc-money">
          <tbody>
            <tr>
              <td>Advance · {split.advanceLabel} upon signing</td>
              <td>{formatINR(split.advance)}</td>
            </tr>
            <tr>
              <td>Balance · {split.balanceLabel} upon completion</td>
              <td>{formatINR(split.balance)}</td>
            </tr>
            <tr className="doc-money-total">
              <td>Total project fee</td>
              <td>{formatINR(split.total)}</td>
            </tr>
          </tbody>
        </table>
        <table className="doc-meta">
          <tbody>
            <tr>
              <td>
                <span className="doc-label">ESTIMATED TIMELINE</span>
                <span className="doc-meta-value">{data.timeline || "—"}</span>
              </td>
              <td>
                <span className="doc-label">INCLUDED REVISIONS</span>
                <span className="doc-meta-value">{data.revisions || "—"}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="doc-fineprint">
          The advance is non-refundable once design and development work has commenced. All figures are in Indian
          Rupees (INR) and exclusive of applicable taxes.
        </p>
      </div>
    </div>
  );
}

function ClausesTitleBlock() {
  return (
    <div className="doc-block">
      <p className="doc-title-italic">Terms</p>
      <h2 className="doc-title-main doc-title-sub">OF ENGAGEMENT</h2>
      <p className="doc-clauses-lede">
        The following clauses form part of this Agreement. They are read together with the scope, deliverables and
        payment schedule set out on the preceding pages.
      </p>
    </div>
  );
}

function ClauseBlock({ clause, index }: { clause: Clause; index: number }) {
  return (
    <div className="doc-block">
      <table className="doc-clause-table">
        <tbody>
          <tr>
            <td className="doc-clause-num">{String(index + 1).padStart(2, "0")}</td>
            <td>
              <p className="doc-clause-title">{clause.title || "Untitled clause"}</p>
              <p className="doc-clause-body">{clause.body}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SignaturesBlock({
  data,
  signature,
  fixed = false,
}: {
  data: Agreement;
  signature: string | null;
  fixed?: boolean;
}) {
  return (
    <div className={fixed ? "doc-signatures doc-signatures-fixed" : "doc-signatures"}>
      <div className="doc-witness">
        <span className="doc-label">EXECUTION OF AGREEMENT</span>
        <p className="doc-witness-text">
          In witness whereof, the parties have executed this Agreement on the Effective Date first written above.
        </p>
      </div>
      <table className="doc-sign-table">
        <tbody>
          <tr>
            <td className="doc-sign-cell">
              <span className="doc-label">FOR WEBLI STUDIO</span>
              <div className="doc-sign-area">
                <div className="doc-sign-image">
                  {signature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={signature} alt="Authorised signature" />
                  ) : null}
                </div>
              </div>
              <div className="doc-sign-rule" />
              <p className="doc-sign-name">{data.agencySignatory || "—"}</p>
              <p className="doc-sign-role">{data.agencyTitle || "Founder, Webli Studio"}</p>
              <p className="doc-sign-date">DATE · {formatLongDate(data.effectiveDate)}</p>
            </td>
            <td className="doc-sign-cell doc-sign-cell-right">
              <span className="doc-label">
                FOR CLIENT — {(data.clientName || "CLIENT").toUpperCase()}
              </span>
              <div className="doc-sign-area">
                <div className="doc-sign-empty">SIGNATURE &amp; COMPANY STAMP</div>
              </div>
              <div className="doc-sign-rule" />
              <p className="doc-sign-name">{data.clientRepresentative || "—"}</p>
              <p className="doc-sign-role">{data.clientDesignation || "Authorised Representative"}</p>
              <p className="doc-sign-date">DATE · ____________________</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

function samePages(a: string[][], b: string[][]) {
  return a.length === b.length && a.every((page, index) => page.join("|") === b[index].join("|"));
}

function buildLayout(heights: Record<string, number>, available: number, data: Agreement): string[][] {
  const tolerance = 6;
  const pageHeight = Math.max(0, available - tolerance);

  const deliverableKeys = data.deliverables.map((item) => `deliv-row-${item.id}`);
  const prelude = ["title", "parties", "overview", "deliv-head", ...deliverableKeys, "commercials"];

  const pages: string[][] = [];
  let current: string[] = [];
  let used = 0;

  const commit = () => {
    if (current.length) {
      pages.push(current);
      current = [];
      used = 0;
    }
  };

  const add = (key: string, height: number) => {
    current.push(key);
    used += height;
  };

  for (let index = 0; index < prelude.length; index += 1) {
    const key = prelude[index];
    const height = heights[key] ?? 0;
    let need = height;

    if (key === "deliv-head" && deliverableKeys.includes(prelude[index + 1])) {
      need += heights[prelude[index + 1]] ?? 0;
    }

    if (used + need > pageHeight && current.length > 0) {
      commit();
      if (key.startsWith("deliv-row-")) add("deliv-head", heights["deliv-head"] ?? 0);
    }

    add(key, height);
  }

  const clauseKeys = ["clauses-head", ...data.clauses.map((clause) => `clause-${clause.id}`)];
  const signatureHeight = heights.signatures ?? 0;

  // The title page always stands alone. When the scope overflows, the clauses
  // may continue on that overflow page instead of leaving it half empty.
  if (current.includes("title")) commit();

  for (let index = 0; index < clauseKeys.length; index += 1) {
    const key = clauseKeys[index];
    const height = heights[key] ?? 0;
    let need = height;

    if (key === "clauses-head") need += heights[clauseKeys[index + 1]] ?? 0;

    if (used + need > pageHeight && current.length > 0) commit();
    add(key, height);
  }

  if (current.length > 0 && used + signatureHeight <= pageHeight) {
    add("signatures", signatureHeight);
  } else if (current.length > 0) {
    // Prefer a closing page that pairs the final clause with the signatures
    // over a page holding nothing but signatures.
    const lastClauseKey = [...current].reverse().find((key) => key.startsWith("clause-"));
    const remaining = current.filter((key) => key !== lastClauseKey);
    const remainingClauses = remaining.filter((key) => key.startsWith("clause-")).length;
    const movedHeight = lastClauseKey ? heights[lastClauseKey] ?? 0 : 0;

    if (lastClauseKey && remainingClauses > 0 && movedHeight + signatureHeight <= pageHeight) {
      pages.push(remaining);
      current = [lastClauseKey, "signatures"];
    } else {
      pages.push(current);
      current = ["signatures"];
    }
    used = 0;
  } else {
    current = ["signatures"];
  }

  commit();
  return pages;
}

/* ------------------------------------------------------------------ */
/* Document                                                            */
/* ------------------------------------------------------------------ */

export default function AgreementDocument({
  data,
  clientLogo,
  signature,
  onPageCount,
}: AgreementDocumentProps) {
  const measureBodyRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<string[][]>([]);
  const dataKey = useMemo(() => JSON.stringify(data), [data]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const measure = () => {
      const body = measureBodyRef.current;
      if (!body || cancelled) return;
      const available = body.clientHeight;
      if (available < 100) return;

      const heights: Record<string, number> = {};
      body.querySelectorAll<HTMLElement>("[data-mkey]").forEach((element) => {
        const key = element.dataset.mkey;
        if (key) heights[key] = element.getBoundingClientRect().height;
      });

      const next = buildLayout(heights, available, data);
      setPages((previous) => (samePages(previous, next) ? previous : next));
    };

    // setTimeout rather than requestAnimationFrame: pagination must also run
    // in background tabs, where animation frames are paused.
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 32);
    };

    // Measure immediately so the first paint already has pages, then again
    // once webfonts settle (metrics can shift) and on any layout resize.
    schedule();

    if (typeof document.fonts !== "undefined") {
      document.fonts.ready
        .then(() => {
          if (!cancelled) schedule();
        })
        .catch(() => {
          /* Font loading API unavailable — keep the initial measurement. */
        });
    }

    // A first measurement can land before the sheet has its final height
    // (fonts, CSS, image decode). Retry a few times while it is unusable.
    let attempts = 0;
    const retry = () => {
      if (cancelled || attempts >= 12) return;
      attempts += 1;
      const body = measureBodyRef.current;
      if (!body || body.clientHeight < 100) {
        window.setTimeout(retry, 150);
        return;
      }
      schedule();
    };
    window.setTimeout(retry, 150);

    const observer = new ResizeObserver(schedule);
    if (measureBodyRef.current) observer.observe(measureBodyRef.current);
    document.addEventListener("visibilitychange", schedule);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [dataKey, data, clientLogo, signature]);

  useEffect(() => {
    if (pages.length > 0) onPageCount?.(pages.length);
  }, [pages.length, onPageCount]);

  const total = pages.length || 1;

  const renderBlock = (key: string): ReactNode => {
    if (key === "title") return <TitleBlock data={data} />;
    if (key === "parties") return <PartiesBlock data={data} />;
    if (key === "overview") return <OverviewBlock data={data} />;
    if (key === "commercials") return <CommercialsBlock data={data} />;
    if (key === "clauses-head") return <ClausesTitleBlock />;
    if (key === "signatures") return <SignaturesBlock data={data} signature={signature} fixed />;

    if (key.startsWith("clause-")) {
      const index = data.clauses.findIndex((clause) => `clause-${clause.id}` === key);
      if (index === -1) return null;
      return <ClauseBlock clause={data.clauses[index]} index={index} />;
    }

    return null;
  };

  const renderPageBody = (keys: string[]) => {
    const nodes: ReactNode[] = [];
    let index = 0;

    while (index < keys.length) {
      const key = keys[index];

      if (key === "deliv-head") {
        const rows: Deliverable[] = [];
        let cursor = index + 1;

        while (cursor < keys.length && keys[cursor].startsWith("deliv-row-")) {
          const found = data.deliverables.find((item) => `deliv-row-${item.id}` === keys[cursor]);
          if (found) rows.push(found);
          cursor += 1;
        }

        const startIndex = rows.length ? data.deliverables.findIndex((item) => item.id === rows[0].id) : 0;

        nodes.push(
          <DeliverablesBlock
            key={`deliverables-${index}`}
            items={rows}
            continued={!keys.includes("title")}
            startIndex={startIndex < 0 ? 0 : startIndex}
            totalItems={data.deliverables.length}
          />
        );

        index = cursor;
        continue;
      }

      nodes.push(<Fragment key={`${key}-${index}`}>{renderBlock(key)}</Fragment>);
      index += 1;
    }

    return nodes;
  };

  return (
    <div className="preview-stack">
      <div className="measure-wrap" aria-hidden="true">
        <div className="a4-page measure-sheet">
          <DocHeader data={data} clientLogo={clientLogo} />
          <div className="a4-body" ref={measureBodyRef}>
            <div data-mkey="title">
              <TitleBlock data={data} />
            </div>
            <div data-mkey="parties">
              <PartiesBlock data={data} />
            </div>
            <div data-mkey="overview">
              <OverviewBlock data={data} />
            </div>
            <div data-mkey="deliv-head">
              <DeliverablesBlock items={[]} continued={false} startIndex={0} totalItems={data.deliverables.length} />
            </div>
            {data.deliverables.map((item, index) => (
              <div data-mkey={`deliv-row-${item.id}`} key={item.id}>
                <DeliverableRowMeasure item={item} index={index} />
              </div>
            ))}
            <div data-mkey="commercials">
              <CommercialsBlock data={data} />
            </div>
            <div data-mkey="clauses-head">
              <ClausesTitleBlock />
            </div>
            {data.clauses.map((clause, index) => (
              <div data-mkey={`clause-${clause.id}`} key={clause.id}>
                <ClauseBlock clause={clause} index={index} />
              </div>
            ))}
            <div data-mkey="signatures">
              <SignaturesBlock data={data} signature={signature} />
            </div>
          </div>
          <DocFooter page={1} total={1} />
        </div>
      </div>

      {pages.length === 0 ? (
        <Sheet page={1} total={1} data={data} clientLogo={clientLogo} />
      ) : (
        pages.map((keys, index) => (
          <Sheet
            key={`page-${index}`}
            page={index + 1}
            total={total}
            data={data}
            clientLogo={clientLogo}
          >
            {renderPageBody(keys)}
          </Sheet>
        ))
      )}
    </div>
  );
}
