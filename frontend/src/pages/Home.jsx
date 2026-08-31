import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import ScanUploader from "../components/ScanUploader";
import { predictImage } from "../lib/api";

export default function Home() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pickError, setPickError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleFileSelected = (picked, error) => {
    setSubmitError(null);
    if (error) {
      setPickError(error);
      return;
    }
    setPickError(null);
    setFile(picked);
    setPreviewUrl(picked ? URL.createObjectURL(picked) : null);
  };

  const handleAnalyze = async () => {
    if (!file || scanning) return;
    setScanning(true);
    setSubmitError(null);
    try {
      const result = await predictImage(file);
      navigate("/result", {
        state: {
          prediction: result.prediction,
          confidence: result.confidence,
          gradCam: result.grad_cam,
          previewUrl,
        },
      });
    } catch (err) {
      setSubmitError(err.message);
      setScanning(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[560px] flex-col px-6">
      <header className="flex items-center justify-between py-8">
        <Logo />
      </header>

      <main className="flex flex-1 flex-col justify-center gap-8 pb-16">
        <div className="text-center">
          <h1 className="font-display text-[34px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
            See through the pixels.
          </h1>
          <p className="mx-auto mt-3 max-w-[38ch] text-[15px] text-ink-soft">
            Upload an image and GhostReveal will tell you whether it's real
            or AI-generated, with a confidence score.
          </p>
        </div>

        <ScanUploader
          onFileSelected={handleFileSelected}
          file={file}
          previewUrl={previewUrl}
          scanning={scanning}
          error={pickError}
        />

        {submitError && (
          <p className="-mt-4 text-center text-[13px] text-signal-ai">{submitError}</p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file || scanning}
          className="w-full rounded-xl bg-ink py-3.5 font-display text-[15px] font-medium text-paper
            transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-30
            hover:opacity-90 focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {scanning ? "Analyzing…" : "Analyze image"}
        </button>
      </main>

      <footer className="py-6 text-center font-mono text-[11px] text-ink-soft">
        College project · results are for demonstration purposes
      </footer>
    </div>
  );
}
