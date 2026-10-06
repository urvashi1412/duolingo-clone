"use client";

type Props = {
  text: string;
  label?: string;
};

export function SpeakButton({ text, label = "Listen" }: Props) {
  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      className="inline-flex items-center gap-2 rounded-xl border-2 border-duo-gray bg-white px-3 py-2 text-sm font-extrabold text-duo-blue hover:bg-duo-blue/10"
    >
      🔊 {label}
    </button>
  );
}
