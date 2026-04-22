import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, IdCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getProfileExtras } from "@/lib/profile-extras";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  destination: string;
  country: string | null;
  emergency: { general?: string; police?: string; ambulance?: string; fire?: string };
  brief: any;
};

/**
 * Offline Safety Card — generates a printable / downloadable wallet card with
 * the user's critical info + trip emergency data. Works offline once printed.
 */
export const SafetyCard = ({ destination, country, emergency, brief }: Props) => {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const buildHtml = () => {
    const extras = getProfileExtras(user?.id) || {
      emergency_contact_name: "", emergency_contact_phone: "",
      blood_type: "", allergies: "", medical_notes: "", home_country: "", bio: "",
    };
    const phrases: Array<{ phrase: string; local: string; pronunciation?: string }> =
      brief?.emergency_phrases || [];

    return `<!doctype html>
<html><head><meta charset="utf-8"><title>SafeWander Card — ${destination}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; color: #1a1d2b; margin: 0; }
  .card { width: 100%; max-width: 720px; margin: 0 auto; border: 2px solid #ee6b50; border-radius: 18px; overflow: hidden; }
  .head { background: linear-gradient(135deg, #ee6b50, #f08a4b); color: #fff; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; }
  .head h1 { margin: 0; font-size: 22px; letter-spacing: -0.02em; }
  .head .sub { font-size: 12px; opacity: .92; }
  .badge { background: rgba(255,255,255,.22); padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .cell { padding: 16px 22px; border-top: 1px solid #f0e6d8; }
  .cell:nth-child(odd) { border-right: 1px solid #f0e6d8; }
  .label { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #7a7d8a; margin: 0 0 4px; }
  .value { font-size: 15px; font-weight: 600; margin: 0; }
  .value.big { font-size: 22px; color: #d94e2f; font-weight: 800; letter-spacing: -.01em; }
  .row { display: flex; gap: 14px; flex-wrap: wrap; }
  .row .value { flex: 1; min-width: 120px; }
  .phrases { padding: 16px 22px; border-top: 1px solid #f0e6d8; background: #fff8f0; }
  .phrase { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 6px 0; border-bottom: 1px dashed #e9d8c2; font-size: 12px; }
  .phrase:last-child { border-bottom: 0; }
  .phrase b { font-weight: 700; color: #1a1d2b; }
  .phrase i { font-style: normal; color: #7a3a25; font-weight: 600; }
  .foot { padding: 10px 22px; font-size: 10px; color: #7a7d8a; text-align: center; background: #faf6ee; }
  .print-btn { position: fixed; top: 16px; right: 16px; padding: 10px 16px; background: #ee6b50; color: #fff; border: 0; border-radius: 999px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 24px -8px rgba(238,107,80,.6); }
  @media print { .print-btn { display: none; } body { background: #fff; } .card { border-width: 1.5px; } }
</style></head>
<body>
<button class="print-btn" onclick="window.print()">🖨 Print / Save PDF</button>
<div class="card">
  <div class="head">
    <div>
      <div class="sub">SafeWander · Offline Safety Card</div>
      <h1>${escapeHtml(destination)}</h1>
    </div>
    <div class="badge">${country ? escapeHtml(country) : "Trip"}</div>
  </div>

  <div class="grid">
    <div class="cell">
      <p class="label">Emergency (general)</p>
      <p class="value big">${emergency.general || "—"}</p>
      <div class="row" style="margin-top:8px">
        <div><p class="label">Police</p><p class="value">${emergency.police || "—"}</p></div>
        <div><p class="label">Ambulance</p><p class="value">${emergency.ambulance || "—"}</p></div>
        <div><p class="label">Fire</p><p class="value">${emergency.fire || "—"}</p></div>
      </div>
    </div>
    <div class="cell">
      <p class="label">My emergency contact</p>
      <p class="value">${escapeHtml(extras.emergency_contact_name || "Not set")}</p>
      <p class="value big" style="font-size:18px;margin-top:4px">${escapeHtml(extras.emergency_contact_phone || "—")}</p>
      <p class="label" style="margin-top:10px">From</p>
      <p class="value">${escapeHtml(extras.home_country || "—")}</p>
    </div>
    <div class="cell">
      <p class="label">Blood type</p>
      <p class="value big" style="font-size:20px">${escapeHtml(extras.blood_type || "—")}</p>
      <p class="label" style="margin-top:10px">Allergies</p>
      <p class="value">${escapeHtml(extras.allergies || "None on file")}</p>
    </div>
    <div class="cell">
      <p class="label">Medical notes</p>
      <p class="value" style="font-size:13px;line-height:1.4">${escapeHtml(extras.medical_notes || "None on file")}</p>
    </div>
  </div>

  ${phrases.length ? `
  <div class="phrases">
    <p class="label" style="margin-bottom:8px">Emergency phrases</p>
    ${phrases.slice(0, 6).map((p) => `
      <div class="phrase">
        <b>${escapeHtml(p.phrase)}</b>
        <i>${escapeHtml(p.local)}${p.pronunciation ? ` <span style="opacity:.6">/${escapeHtml(p.pronunciation)}/</span>` : ""}</i>
      </div>`).join("")}
  </div>` : ""}

  <div class="foot">Generated by SafeWander — keep in your wallet or phone wallpaper. Works fully offline.</div>
</div>
</body></html>`;
  };

  const handlePrint = () => {
    setBusy(true);
    try {
      const html = buildHtml();
      const w = window.open("", "_blank", "width=820,height=900");
      if (!w) {
        toast.error("Popup blocked — allow popups to print your card.");
        return;
      }
      w.document.write(html);
      w.document.close();
      toast.success("Safety card opened — print or save as PDF.");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    setBusy(true);
    try {
      const html = buildHtml();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `safewander-${destination.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded — open it anywhere, even offline.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary-soft/60 to-accent-soft/40 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-coral text-primary-foreground shadow-soft">
          <IdCard className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold leading-tight">Offline Safety Card</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            A printable wallet card with emergency numbers, your contact, blood type & local phrases. Works without internet.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={handlePrint} disabled={busy} size="sm" className="bg-gradient-coral border-0 shadow-soft hover:shadow-glow">
              {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Printer className="mr-1.5 h-3.5 w-3.5" />}
              Print card
            </Button>
            <Button onClick={handleDownload} disabled={busy} size="sm" variant="outline">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const escapeHtml = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
