import type { ReactNode } from "react";

/** Small square marker — visual rhythm element used throughout. */
export function Marker({
  className = "",
  size = 8,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-ink ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Editorial section label: ■ + Courier label on the left, optional Courier tag on the right,
 * with a thin horizontal rule beneath.
 */
export function SectionLabel({
  label,
  tag,
  className = "",
}: {
  label: ReactNode;
  tag?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-b border-hairline pb-3 mb-5 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Marker />
          <span className="ptta-label text-ink" style={{ fontSize: "10pt" }}>
            {label}
          </span>
        </div>
        {tag && (
          <span className="ptta-label text-muted-fg" style={{ fontSize: "10pt" }}>
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

/** Bordered metric card: tiny Courier label on top, big value below. */
export function MetricCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-hairline px-5 py-5 bg-surface ${className}`}>
      <p className="ptta-label text-muted-fg mb-3" style={{ fontSize: "10pt" }}>
        {label}
      </p>
      <p className="text-ink text-2xl md:text-[1.75rem] leading-tight">
        {value}
      </p>
    </div>
  );
}

/** Dark alert banner with colored dot and Courier label. */
export function AlertBanner({
  children,
  tone = "accent",
  className = "",
}: {
  children: ReactNode;
  tone?: "accent" | "neutral";
  className?: string;
}) {
  return (
    <div
      role="status"
      className={`bg-stone-950 text-stone-50 px-5 py-3 flex items-center gap-3 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          tone === "accent" ? "bg-accent" : "bg-stone-50"
        }`}
      />
      <span className="ptta-label" style={{ fontSize: "10pt" }}>{children}</span>
    </div>
  );
}

/** Label ↔ value row with a bottom rule — for metadata tables. */
export function LabelRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-hairline py-2.5 ${className}`}
    >
      <span className="text-sm text-ink">{label}</span>
      <span
        className="ptta-label text-body-fg text-right"
        style={{ fontSize: "10pt" }}
      >
        {value}
      </span>
    </div>
  );
}
