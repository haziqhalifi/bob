type Props = {
  step: string;
};

export default function LoadingState({ step }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={step}
      className="flex flex-col items-center gap-4 py-12"
    >
      {/* Animated dots — respects prefers-reduced-motion via globals.css */}
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-blue-400"
            style={{
              animation: `ns-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-sm text-slate-500 font-medium">{step}</p>
    </div>
  );
}
