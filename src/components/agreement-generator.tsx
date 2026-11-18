"use client";

import { useCallback, useState } from "react";
import AgreementDocument from "@/components/agreement-document";
import SidebarEditor from "@/components/sidebar-editor";
import { DEFAULT_AGREEMENT, type Agreement } from "@/lib/agreement";

export default function AgreementGenerator() {
  const [data, setData] = useState<Agreement>(DEFAULT_AGREEMENT);
  const [clientLogo, setClientLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handlePageCount = useCallback((count: number) => setPageCount(count), []);
  const displayCount = pageCount || 1;
  const ready = pageCount > 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (exporting) return;
    setExporting(true);
    setNotice(null);

    try {
      await document.fonts.ready;

      const sheets = Array.from(document.querySelectorAll<HTMLElement>(".a4-page[data-export-page='true']"));
      if (sheets.length === 0) throw new Error("No pages to export.");

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvases: HTMLCanvasElement[] = [];

      for (const sheet of sheets) {
        canvases.push(
          await html2canvas(sheet, {
            scale: 2,
            backgroundColor: "#FFFFFF",
            useCORS: true,
            logging: false,
            width: sheet.offsetWidth,
            height: sheet.offsetHeight,
            windowWidth: document.documentElement.clientWidth,
            onclone: (cloned) => {
              cloned.querySelectorAll<HTMLElement>(".a4-page").forEach((page) => {
                page.style.boxShadow = "none";
              });
            },
          })
        );
      }

      // Encode at the requested 0.85 quality first. Only if the document
      // overshoots the 500 KB budget do we step quality (then resolution)
      // down, keeping the PDF light without re-rendering the pages.
      const budget = 500 * 1024;
      const qualities = [0.85, 0.72, 0.62, 0.52];
      let working = canvases;
      let images: string[] = [];

      for (let attempt = 0; attempt < 4; attempt += 1) {
        for (const quality of qualities) {
          images = working.map((canvas) => canvas.toDataURL("image/jpeg", quality));
          const approximate = images.reduce(
            (total, image) => total + Math.floor(((image.length - image.indexOf(",") - 1) * 3) / 4),
            0
          );
          if (approximate <= budget * 0.96) break;
        }

        const approximate = images.reduce(
          (total, image) => total + Math.floor(((image.length - image.indexOf(",") - 1) * 3) / 4),
          0
        );
        if (approximate <= budget * 0.96) break;

        working = working.map((canvas) => {
          const scaled = document.createElement("canvas");
          scaled.width = Math.round(canvas.width * 0.82);
          scaled.height = Math.round(canvas.height * 0.82);
          const context = scaled.getContext("2d");
          if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
            context.drawImage(canvas, 0, 0, scaled.width, scaled.height);
          }
          return scaled;
        });
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      images.forEach((imageData, index) => {
        if (index > 0) pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      });

      const fileName = (data.agreementId || "service-agreement").replace(/[^a-zA-Z0-9-_]+/g, "-");
      pdf.save(`${fileName}.pdf`);

      const bytes = pdf.output("blob").size;
      setNotice(`Exported ${sheets.length} page${sheets.length === 1 ? "" : "s"} · ${Math.round(bytes / 1024)} KB`);
    } catch (error) {
      console.error(error);
      setNotice("PDF export failed. Try Print / Save PDF instead.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen flex-col bg-[#F1F1F1] text-black lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <SidebarEditor
          data={data}
          onChange={setData}
          clientLogo={clientLogo}
          onClientLogoChange={setClientLogo}
          signature={signature}
          onSignatureChange={setSignature}
        />

        <main className="app-main flex min-w-0 flex-1 flex-col lg:min-h-0">
          <header className="app-toolbar sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-black" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7A7A7A]">Live document</span>
              <span className="hidden h-3 w-px bg-[#E5E5E5] sm:inline-block" aria-hidden="true" />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-black">
                A4 · {displayCount} {displayCount === 1 ? "Page" : "Pages"}
              </span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-[#B3B3B3] md:inline">
                210 × 297 mm
              </span>
              {notice ? (
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6B6B6B]" role="status">
                  · {notice}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 border border-[#E5E5E5] bg-white px-4 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-black transition-colors hover:border-black"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={exporting || !ready}
                className="inline-flex items-center gap-2 border border-black bg-black px-4 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#1A1A1A] disabled:opacity-50"
              >
                {exporting ? "Rendering…" : "Download PDF"}
              </button>
            </div>
          </header>

          <div className="preview-pane thin-scroll flex-1 overflow-auto bg-[#F1F1F1]">
            <div className="preview-canvas flex min-h-full flex-col items-center px-5 py-8 lg:px-10 lg:py-10">
              <AgreementDocument
                data={data}
                clientLogo={clientLogo}
                signature={signature}
                onPageCount={handlePageCount}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
