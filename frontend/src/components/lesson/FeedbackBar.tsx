"use client";

type Props = {
  variant: "correct" | "incorrect" | "hidden";
  title: string;
  subtitle?: string;
  onContinue: () => void;
};

export function FeedbackBar({
  variant,
  title,
  subtitle,
  onContinue,
}: Props) {
  if (variant === "hidden") return null;

  const isCorrect = variant === "correct";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 animate-bounce-in border-t-2 px-4 py-6 ${
        isCorrect
          ? "border-duo-green-dark bg-duo-green text-white"
          : "border-duo-red-dark bg-duo-red text-white"
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-extrabold">{title}</p>
          {subtitle && <p className="text-sm font-bold opacity-90">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onContinue}
          className={`duo-btn shrink-0 ${
            isCorrect
              ? "border-white/40 bg-white text-duo-green"
              : "border-white/40 bg-white text-duo-red"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
