import { useState } from "react";
import SchoolSelector from "./components/SchoolSelector";
import SearchInput from "./components/SearchInput";
import ResultsTable from "./components/ResultsTable";
import CurrentCourseToggler from "./components/CurrentCourseToggler";
import { searchCcCourses, searchUwCourses } from "./db/queries";
import type { Equivalency } from "./types";

function App() {
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [results, setResults] = useState<Equivalency[]>([]);
  const [loading, setLoading] = useState(false);
  const[showActiveOnly, setShowActiveOnly] = useState(true);
  const[isUWSearch, setIsUwSearch] = useState(false);

  const handleSearchByCcCourse = async (showActiveOnly: boolean) => {
    if (!selectedSchool || !searchCourse) return;

    setLoading(true);
    const res = await searchCcCourses(selectedSchool, searchCourse, showActiveOnly);
    setResults(res);
    setLoading(false);
    setIsUwSearch(false);
  };

  const handleSearchByUwCourse = async (showActiveOnly: boolean) => {
    if (!selectedSchool || !searchCourse) return;
    
    setLoading(true);
    const res = await searchUwCourses(selectedSchool, searchCourse, showActiveOnly);
    setResults(res);
    setLoading(false);
    setIsUwSearch(true);
  };

  const handleToggleCourse = async (checked: boolean) => {
    setShowActiveOnly(checked);

    if (isUWSearch) {
      handleSearchByUwCourse(checked);
    } else {
      handleSearchByCcCourse(checked);
    }
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
        query={searchCourse}
        onChange={setSearchCourse}
        onSearchCc={handleSearchByCcCourse}
        onSearchUw={handleSearchByUwCourse}
        showActiveOnly={showActiveOnly}
      />

      <CurrentCourseToggler
        setShowActiveOnly={handleToggleCourse}
        showActiveOnly={showActiveOnly}
      />

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Results */}
      <div className="results-section">
        <ResultsTable results={results} />
      </div>

    </div>
  );
}

export default App;