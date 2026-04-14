import { useState } from "react";
import SchoolSelector from "./components/SchoolSelector";
import SearchInput from "./components/SearchInput";
import ResultsTable from "./components/ResultsTable";

import { searchCourses } from "./db/queries";
import type { Equivalency } from "./types";

function App() {
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Equivalency[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!selectedSchool || !query) return;

    setLoading(true);
    const res = await searchCourses(selectedSchool, query);
    setResults(res);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>UW Equivalency Interface</h1>

      {/* School Dropdown */}
      <SchoolSelector
        selected={selectedLabel}
        onChange={(label, groupValue) => {
          setSelectedLabel(label);   // used to control the dropdown
          setSelectedSchool(groupValue); // used for your API/logic
        }}
      />

      {/* Search Input */}
      <SearchInput
        query={query}
        onChange={setQuery}
        onSearch={handleSearch}
      />

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Results */}
      <ResultsTable results={results} />

    </div>
  );
}

export default App;