function SearchSuggestionItem({ suggestion, onSelect }) {
  const lineTwo = [suggestion.state, suggestion.country]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      className="w-full text-left px-4 py-2 hover:bg-[#E2E8F0] text-[#0F172A]"
      onClick={() => onSelect?.(suggestion)}
    >
      <span className="font-semibold">{suggestion.name}</span>
      {lineTwo && (
        <span className="text-[#64748B] text-[12px] ml-2">{lineTwo}</span>
      )}
    </button>
  );
}

function SuggestionMessage({ children, muted = false }) {
  const textColor = muted ? 'text-[#94A3B8]' : 'text-[#64748B]';
  return <li className={`px-4 py-2 text-[14px] ${textColor}`}>{children}</li>;
}

function SearchSuggestions({
  suggestions,
  suggestionsLoading,
  suggestionsFetched,
  onSuggestionSelect,
}) {
  return (
    <ul
      className="absolute left-0 right-0 mt-2 bg-gradient-to-r from-[#FFFFFF] to-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] shadow-xl max-h-60 overflow-y-auto text-left z-50"
      role="listbox"
    >
      {suggestionsLoading && (
        <SuggestionMessage>Searching...</SuggestionMessage>
      )}
      {!suggestionsLoading &&
        suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <SearchSuggestionItem
              suggestion={suggestion}
              onSelect={onSuggestionSelect}
            />
          </li>
        ))}
      {!suggestionsLoading &&
        suggestionsFetched &&
        suggestions.length === 0 && (
          <SuggestionMessage muted>No matches found</SuggestionMessage>
        )}
    </ul>
  );
}

export default SearchSuggestions;
