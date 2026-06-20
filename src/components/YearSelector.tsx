'use client';

const YEARS = Array.from({ length: 13 }, (_, i) => 1990 + i);

type Props = {
  year: number;
  onChange: (year: number) => void;
};

export default function YearSelector({ year, onChange }: Props) {
  return (
    <div className="mb-8">
      <p className="text-grunge-muted font-mono text-xs tracking-widest uppercase mb-3">
        Select Year
      </p>
      <div className="flex flex-wrap gap-2">
        {YEARS.map(y => (
          <button
            key={y}
            onClick={() => onChange(y)}
            className={`
              px-3 py-1.5 font-mono text-sm border transition-colors duration-150
              ${y === year
                ? 'border-grunge-accent text-grunge-accent bg-grunge-playing'
                : 'border-grunge-border text-grunge-muted hover:border-grunge-muted hover:text-grunge-text'
              }
            `}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
