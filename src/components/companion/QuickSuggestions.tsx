"use client"

interface QuickSuggestionsProps {
  onSelect: (suggestion: string) => void
}

const SUGGESTIONS = [
  'Change my goal',
  'What should I do today?',
  'Suggest an exercise',
  'Update my program',
]

export function QuickSuggestions({ onSelect }: QuickSuggestionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 -mx-4 scrollbar-hide">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="flex-shrink-0 px-3 py-2 rounded-full bg-surface-2 text-zinc-300 hover:bg-surface-1 text-sm transition-colors whitespace-nowrap"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
