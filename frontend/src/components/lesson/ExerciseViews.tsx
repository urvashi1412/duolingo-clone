"use client";

import { useMemo, useState } from "react";
import { SpeakButton } from "@/components/SpeakButton";
import type { Exercise } from "@/lib/types";

type ExerciseProps = {
  exercise: Exercise;
  disabled: boolean;
  onSubmit: (answer: unknown) => void;
};

export function MultipleChoiceExercise({
  exercise,
  disabled,
  onSubmit,
}: ExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-extrabold text-gray-800">{exercise.question}</h2>
        <SpeakButton text={exercise.question} />
      </div>
      <div className="grid gap-3">
        {exercise.options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => setSelected(opt)}
            className={`duo-card w-full px-4 py-4 text-left text-lg font-bold transition ${
              selected === opt
                ? "border-duo-blue bg-duo-blue/10 text-duo-blue"
                : "hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!selected || disabled}
        onClick={() => selected && onSubmit(selected)}
        className="duo-btn-green w-full disabled:opacity-50"
      >
        Check
      </button>
    </div>
  );
}

export function TranslateWordBankExercise({
  exercise,
  disabled,
  onSubmit,
}: ExerciseProps) {
  const [bank, setBank] = useState([...exercise.word_bank]);
  const [selected, setSelected] = useState<string[]>([]);

  const pick = (word: string, index: number) => {
    if (disabled) return;
    setSelected((s) => [...s, word]);
    setBank((b) => b.filter((_, i) => i !== index));
  };

  const remove = (word: string, index: number) => {
    if (disabled) return;
    setBank((b) => [...b, word]);
    setSelected((s) => s.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold uppercase tracking-wide text-duo-feather">
        {exercise.prompt}
      </p>
      <h2 className="text-3xl font-extrabold">{exercise.question}</h2>
      <div className="min-h-[56px] rounded-2xl border-2 border-b-4 border-duo-gray-dark border-b-duo-gray bg-white px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {selected.map((word, i) => (
            <button
              key={`${word}-${i}`}
              type="button"
              onClick={() => remove(word, i)}
              className="rounded-xl border-2 border-duo-gray bg-duo-gray px-3 py-2 font-bold"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {bank.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            onClick={() => pick(word, i)}
            className="rounded-xl border-2 border-duo-gray bg-white px-3 py-2 font-bold shadow-duo-gray hover:bg-gray-50"
          >
            {word}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={selected.length === 0 || disabled}
        onClick={() => onSubmit(selected)}
        className="duo-btn-green w-full disabled:opacity-50"
      >
        Check
      </button>
    </div>
  );
}

export function MatchPairsExercise({
  exercise,
  disabled,
  onSubmit,
}: ExerciseProps) {
  const leftItems = useMemo(
    () => exercise.pairs.map((p) => p.left),
    [exercise.pairs]
  );
  const rightItems = useMemo(
    () => [...exercise.pairs.map((p) => p.right)].sort(),
    [exercise.pairs]
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const matchedRights = new Set(Object.values(matches));

  const pickRight = (right: string) => {
    if (disabled || !selectedLeft) return;
    setMatches((m) => ({ ...m, [selectedLeft]: right }));
    setSelectedLeft(null);
  };

  const allMatched = leftItems.every((l) => matches[l]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">{exercise.question}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {leftItems.map((left) => (
            <button
              key={left}
              type="button"
              disabled={disabled || Boolean(matches[left])}
              onClick={() => setSelectedLeft(left)}
              className={`duo-card w-full px-4 py-3 font-bold ${
                selectedLeft === left ? "border-duo-blue bg-duo-blue/10" : ""
              } ${matches[left] ? "opacity-50" : ""}`}
            >
              {left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((right) => (
            <button
              key={right}
              type="button"
              disabled={disabled || matchedRights.has(right)}
              onClick={() => pickRight(right)}
              className={`duo-card w-full px-4 py-3 font-bold ${
                matchedRights.has(right) ? "opacity-50" : "hover:bg-gray-50"
              }`}
            >
              {right}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={!allMatched || disabled}
        onClick={() => onSubmit(matches)}
        className="duo-btn-green w-full disabled:opacity-50"
      >
        Check
      </button>
    </div>
  );
}

export function FillBlankExercise({
  exercise,
  disabled,
  onSubmit,
}: ExerciseProps) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold">{exercise.question}</h2>
      {exercise.hint && (
        <p className="text-sm font-bold text-duo-feather">Hint: {exercise.hint}</p>
      )}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border-2 border-duo-gray px-4 py-3 text-lg font-bold outline-none focus:border-duo-blue"
        placeholder="Type the missing word"
      />
      <button
        type="button"
        disabled={!value.trim() || disabled}
        onClick={() => onSubmit(value.trim())}
        className="duo-btn-green w-full disabled:opacity-50"
      >
        Check
      </button>
    </div>
  );
}

export function TypeAnswerExercise({
  exercise,
  disabled,
  onSubmit,
}: ExerciseProps) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold uppercase text-duo-feather">
        {exercise.prompt}
      </p>
      <h2 className="text-2xl font-extrabold">{exercise.question}</h2>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border-2 border-duo-gray px-4 py-3 text-lg font-bold outline-none focus:border-duo-blue"
        placeholder="Type in Spanish"
      />
      <button
        type="button"
        disabled={!value.trim() || disabled}
        onClick={() => onSubmit(value.trim())}
        className="duo-btn-green w-full disabled:opacity-50"
      >
        Check
      </button>
    </div>
  );
}

export function ExerciseRenderer(props: ExerciseProps) {
  switch (props.exercise.exercise_type) {
    case "multiple_choice":
      return <MultipleChoiceExercise key={props.exercise.id} {...props} />;
    case "translate_word_bank":
      return <TranslateWordBankExercise key={props.exercise.id} {...props} />;
    case "match_pairs":
      return <MatchPairsExercise key={props.exercise.id} {...props} />;
    case "fill_blank":
      return <FillBlankExercise key={props.exercise.id} {...props} />;
    case "type_answer":
      return <TypeAnswerExercise key={props.exercise.id} {...props} />;
    default:
      return <p>Unsupported exercise</p>;
  }
}
