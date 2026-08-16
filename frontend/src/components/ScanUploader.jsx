import { useCallback, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

export default function ScanUploader({ onFileSelected, file, previewUrl, scanning, error }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const picked = fileList?.[0];
      if (!picked) return;
      if (!ACCEPTED_TYPES.includes(picked.type)) {
        onFileSelected(null, "Only JPEG and PNG images are supported.");
        return;
      }
      onFileSelected(picked, null);
    },
    [onFileSelected]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`relative overflow-hidden cursor-pointer rounded-2xl border-2 border-dashed
          transition-colors duration-150 focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-accent
          ${isDragOver ? "border-accent bg-accent-soft" : "border-paper-line bg-white/60"}
          ${previewUrl ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-[16/9]"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Selected upload preview"
              className="h-full w-full object-cover"
            />
            {scanning && (
              <>
                <div className="absolute inset-0 bg-ink/10" />
                <div className="absolute left-0 right-0 h-px animate-scan">
                  <div className="h-px w-full bg-accent shadow-[0_0_12px_3px_var(--color-accent)]" />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              className="text-ink-soft"
              aria-hidden="true"
            >
              <path
                d="M12 16V4M12 4L7 9M12 4l5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-medium text-[15px]">
              Drop an image, or <span className="text-accent">browse</span>
            </p>
            <p className="text-[13px] text-ink-soft">JPEG or PNG</p>
          </div>
        )}
      </div>

      {file && !error && (
        <p className="mt-2.5 truncate font-mono text-[12px] text-ink-soft">{file.name}</p>
      )}
      {error && <p className="mt-2.5 text-[13px] text-signal-ai">{error}</p>}
    </div>
  );
}
