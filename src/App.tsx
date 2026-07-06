import { useState } from "react";
import SchoolSelector from "./components/SchoolSelector";
import SearchInput from "./components/SearchInput";
import ResultsTable from "./components/ResultsTable";
import CurrentCourseToggler from "./components/CurrentCourseToggler";
import { searchCcCourses, searchUwCourses } from "./db/queries";
import type { Equivalency } from "./types/type";

function App() {
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [results, setResults] = useState<Equivalency[]>([]);
  const [loading, setLoading] = useState(false);
  const[showActiveOnly, setShowActiveOnly] = useState(true);
  const[isUWSearch, setIsUwSearch] = useState(false);

  const handleSearchByCcCourse = async (course: string, showActiveOnly: boolean) => {
    if (!selectedSchool || !course) return;

    setLoading(true);
    const res = await searchCcCourses(selectedSchool, course, showActiveOnly);
    setResults(res);
    setLoading(false);
    setIsUwSearch(false);
  };

  const handleSearchByUwCourse = async (course: string, showActiveOnly: boolean) => {
    if (!selectedSchool || !course) return;

    setLoading(true);
    const res = await searchUwCourses(selectedSchool, course, showActiveOnly);
    setResults(res);
    setLoading(false);
    setIsUwSearch(true);
  };

  const handleToggleCourse = async (checked: boolean) => {
    setShowActiveOnly(checked);

    if (isUWSearch) {
      handleSearchByUwCourse(searchCourse, checked);
    } else {
      handleSearchByCcCourse(searchCourse, checked);
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
          setSelectedSchool(groupValue); // used for API
        }}
      />

      {/* Search Input */}
      <SearchInput
        query={searchCourse}
        onChange={(value) => setSearchCourse(value)}
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
        <ResultsTable
          showActiveOnly={showActiveOnly}
          results={results}
          setSearchCourse={setSearchCourse}
          onSearchCc={handleSearchByCcCourse}
          onSearchUw={handleSearchByUwCourse}
         />
      </div>

    </div>
  );
}

export default App;