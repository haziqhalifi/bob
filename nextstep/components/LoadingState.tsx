type Props = {
  step: string;
};

export default function LoadingState({ step }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 py-12"
    >
      {/* Animated dots */}
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-blue-400"
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 font-medium">{step}</p>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
