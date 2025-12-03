import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import SearchSuggestions from './SearchSuggestions.jsx';

function SearchBar({
  value = '',
  onChange,
  onSubmit,
  loading,
  suggestions = [],
  suggestionsLoading = false,
  suggestionsFetched = false,
  onSuggestionSelect,
  placeholder = 'Search for a city',
  hasError = false,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };

  const trimmedValue = value.trim();
  const shouldShowSuggestions =
    trimmedValue.length >= 3 &&
    (suggestionsLoading || suggestions.length > 0 || suggestionsFetched);

  const containerClasses = `fixed xl:static xl:self-end xl:ml-auto z-50 max-w-md w-[358px] md:w-[448px] mt-[20px] bg-gradient-to-r from-[#FFFFFF] to-[#F8FAFC] border-opacity-30 border-[2px] shadow-md rounded-[12px] px-[12px] md:px-[16px] transition-colors ${
    hasError
      ? 'border-[#EF4444] focus-within:border-[#EF4444] focus-within:ring-2 focus-within:ring-[#EF4444]'
      : 'border-[#E2E8F0] focus-within:border-[#4A90E2] focus-within:ring-2 focus-within:ring-[#4A90E2]'
  }`;

  const inputClasses = `font-inter focus:outline-none w-full text-[14px] md:text-[16px] font-[500] text-[#64748B] bg-transparent appearance-none border-none ${
    hasError ? 'placeholder:text-[#EF4444]' : 'placeholder:text-[#94A3B8]'
  }`;

  return (
    <form onSubmit={handleSubmit} className={containerClasses}>
      <div className="relative w-full">
        <div className="flex items-center gap-2 w-full h-[38px] md:h-[48px]">
          <input
            type="text"
            value={value}
            onChange={onChange}
            className={inputClasses}
            placeholder={placeholder}
            aria-label="Search for a city"
          />
          <button
            type="submit"
            className="disabled:opacity-40"
            disabled={loading}
            aria-label="Submit city search"
          >
            <MagnifyingGlassIcon className="w-[20px] md:w-[24px] text-[#64748B]" />
          </button>
        </div>
        {shouldShowSuggestions && (
          <SearchSuggestions
            suggestions={suggestions}
            suggestionsLoading={suggestionsLoading}
            suggestionsFetched={suggestionsFetched}
            onSuggestionSelect={onSuggestionSelect}
          />
        )}
      </div>
    </form>
  );
}

export default SearchBar;
