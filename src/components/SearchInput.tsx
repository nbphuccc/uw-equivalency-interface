import "./SearchInput.css";


type Props = {
  query: string;
  onChange: (value: string) => void;
  onSearchCc: (course: string, showActiveOnly: boolean) => void;
  onSearchUw: (course: string, showActiveOnly: boolean) => void;
  showActiveOnly: boolean;
};

export default function SearchInput({ query, onChange, onSearchCc, onSearchUw, showActiveOnly }: Props) {
  return (
    <div className="course-search">
      <input
        className="course-search-input"
        type="text"
        placeholder="Enter course name..."
        value={query}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />

      <button
        className="cc-search-button"
        onClick={() => onSearchCc(query, showActiveOnly)}
      >
        Search CC Course
      </button>

      <button
        className="uw-search-button"
        onClick={() => onSearchUw(query, showActiveOnly)}
      >
        Search UW Course
      </button>
    </div>
  );
}