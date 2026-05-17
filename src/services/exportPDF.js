import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportElementToPDF(elementId, filename = "veryfii-report.pdf") {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Element not found: " + elementId);

  const canvas = await html2canvas(el, {
    backgroundColor: "#07091a",
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = canvas.width / canvas.height;
  const imgH = pageW / ratio;

  let position = 0;
  let remaining = imgH;

  pdf.addImage(imgData, "PNG", 0, position, pageW, imgH);
  remaining -= pageH;

  while (remaining > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pageW, imgH);
    remaining -= pageH;
  }

  pdf.save(filename);
}

export function generateMarketReportFilename(niche) {
  const safe = niche.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  return `veryfii-market-${safe}-${Date.now()}.pdf`;
}

export function generateTradeReportFilename(type) {
  return `veryfii-trade-${type.toLowerCase()}-${Date.now()}.pdf`;
}
