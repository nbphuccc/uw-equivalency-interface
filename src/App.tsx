import { useState } from "react";
import SearchInput from "./components/SearchInput";
import ResultsTable from "./components/ResultsTable";
import CurrentCourseToggler from "./components/CurrentCourseToggler";
import { searchCcCourses, searchUwCourses } from "./db/queries";
import type { Equivalency } from "./types/type";
import Planner from "./components/Planner";
import CollegeSelector from "./components/CollegeSelector";
import { useAdvisoryTooltip } from "./hooks/useAdvisoryTooltip";
import AdvisoryTooltip from "./components/AdvisoryTooltip";

function App() {
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [results, setResults] = useState<Equivalency[]>([]);
  const [loading, setLoading] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [isUWSearch, setIsUwSearch] = useState(false);
  const [planner, setPlanner] = useState<Equivalency[]>([]);

  const {tooltip, tooltipHandlers} = useAdvisoryTooltip();

  const handleSearchByCcCourse = async (
    course: string,
    showActiveOnly: boolean,
    collegeName?: string
  ) => {
    const collegeToSearch = collegeName || selectedCollege;

    if (!collegeToSearch || !course) return;

    setLoading(true);

    try {
      const res = await searchCcCourses(
        collegeToSearch,
        course,
        showActiveOnly
      );

      setResults(res);
      setIsUwSearch(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByUwCourse = async (
    course: string,
    showActiveOnly: boolean,
    collegeName?: string
  ) => {
    const collegeToSearch = collegeName || selectedCollege;

    if (!collegeToSearch || !course) return;

    setLoading(true);

    try {
      const res = await searchUwCourses(
        collegeToSearch,
        course,
        showActiveOnly
      );

      setResults(res);
      setIsUwSearch(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourse = async (checked: boolean) => {
    setShowActiveOnly(checked);

    if (isUWSearch) {
      handleSearchByUwCourse(searchCourse, checked);
    } else {
      handleSearchByCcCourse(searchCourse, checked);
    }
  };

  const handleSelectCollege = (collegeName: string, collegeGroup: string) => {
    setSelectedLabel(collegeName);
    setSelectedCollege(collegeGroup);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>UW Equivalency Interface</h1>

      {/* School Dropdown */}
      <CollegeSelector
        selected={selectedLabel}
        onChange={handleSelectCollege}
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

      {/* Planner */}
      <div className="planner-section">
        <Planner
          showActiveOnly={showActiveOnly}
          planner={planner}
          setSearchCourse={setSearchCourse}
          setSelectedCollege={handleSelectCollege}
          onSearchCc={handleSearchByCcCourse}
          onSearchUw={handleSearchByUwCourse}
          setPlanner={setPlanner}
          tooltipHandlers={tooltipHandlers}
        />
      </div>

      {/* Results */}
      <div className="results-section">
        <ResultsTable
          showActiveOnly={showActiveOnly}
          results={results}
          setSearchCourse={setSearchCourse}
          onSearchCc={handleSearchByCcCourse}
          onSearchUw={handleSearchByUwCourse}
          planner={planner}
          setPlanner={setPlanner}
          tooltipHandlers={tooltipHandlers}
         />
      </div>

      <AdvisoryTooltip tooltip={tooltip} />

    </div>
  );
}

export default App;