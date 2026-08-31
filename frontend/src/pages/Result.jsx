import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

// Backend may send grad_cam as a bare base64 string or a full data URI.
// Normalize so <img src> always gets something it can render.
function toImageSrc(value) {
  if (!value) return null;
  return value.startsWith("data:") ? value : `data:image/png;base64,${value}`;
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showGradCam, setShowGradCam] = useState(false);

  useEffect(() => {
    if (!state) navigate("/", { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const { prediction, confidence, previewUrl, gradCam } = state;
  const gradCamSrc = toImageSrc(gradCam);
  const isReal = /real/i.test(prediction || "");
  const pct = Math.round((confidence ?? 0) * 1000) / 10; // one decimal place

  const displayedSrc = showGradCam && gradCamSrc ? gradCamSrc : previewUrl;
  const displayedAlt = showGradCam && gradCamSrc
    ? "Grad-CAM heatmap highlighting the regions the model focused on"
    : "Analyzed upload";

  const signal = isReal
    ? {
        label: "REAL IMAGE",
        text: "text-signal-real",
        bg: "bg-signal-real-soft",
        bar: "bg-signal-real",
        ring: "shadow-[0_0_0_3px_var(--color-signal-real-soft),0_0_24px_-6px_var(--color-signal-real)]",
      }
    : {
        label: "AI GENERATED",
        text: "text-signal-ai",
        bg: "bg-signal-ai-soft",
        bar: "bg-signal-ai",
        ring: "shadow-[0_0_0_3px_var(--color-signal-ai-soft),0_0_24px_-6px_var(--color-signal-ai)]",
      };

  return (
    <div className="mx-auto flex min-h-screen max-w-[560px] flex-col px-6">
      <header className="flex items-center justify-between py-8">
        <Logo />
        <Link
          to="/"
          className="font-mono text-[12px] text-ink-soft transition-colors hover:text-ink"
        >
          ← back
        </Link>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-7 pb-16">
        {displayedSrc && (
          <div className={`relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl ${signal.ring}`}>
            <img
              src={displayedSrc}
              alt={displayedAlt}
              className="aspect-square w-full object-cover"
            />
            <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10px] font-medium tracking-wide text-paper backdrop-blur-sm">
              {showGradCam && gradCamSrc ? "GRAD-CAM" : "ORIGINAL"}
            </span>
          </div>
        )}

        <div className="text-center">
          <span
            className={`inline-block rounded-full px-3 py-1 font-mono text-[11px] font-medium tracking-wide ${signal.bg} ${signal.text}`}
          >
            VERDICT
          </span>
          <h1 className="mt-3 font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">
            {prediction}
          </h1>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[13px] text-ink-soft">Confidence</span>
            <span className="font-mono text-[15px] font-medium">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-paper-line/60">
            <div
              className={`h-full rounded-full ${signal.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {gradCamSrc && (
          <button
            onClick={() => setShowGradCam((prev) => !prev)}
            className="w-full rounded-xl border border-accent/30 bg-accent-soft py-3.5 text-center font-display
              text-[15px] font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {showGradCam ? "Show original image" : "Check Grad-CAM"}
          </button>
        )}

        <Link
          to="/"
          className="w-full rounded-xl border border-paper-line bg-white/60 py-3.5 text-center font-display
            text-[15px] font-medium transition-colors hover:bg-white focus-visible:outline
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Analyze another image
        </Link>
      </main>
    </div>
  );
}
