// SearchInput.tsx
type Props = {
  query: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

export default function SearchInput({ query, onChange, onSearch }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Enter course name..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={onSearch}>SEARCH</button>
    </div>
  );
}