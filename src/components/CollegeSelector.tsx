import { colleges, getCollegeLogo } from "../utils/collegeGrouping";
import "./CollegeSelector.css";

type Props = {
  selected: string;
  onChange: (collegeName: string, collegeGroup: string) => void;
};

export default function CollegeSelector({ selected, onChange }: Props) {
  const isListedCollege = colleges.some((college) => college.name === selected);
  const selectedLogo = getCollegeLogo(selected);

  return (
  <div className="college-selector">
    <label
      className="college-selector-label"
      htmlFor="college-select"
    >
      Select College
    </label>

    <div className="college-select-column">
      <div className="college-select-wrapper">
        <select
          id="college-select"
          className="college-select"
          value={selected}
          onChange={(e) => {
            const opt = colleges.find(
              (college) => college.name === e.target.value
            );

            if (opt) {
              onChange(opt.name, opt.group);
            }
          }}
        >
          <option value="">Choose a college</option>

          {selected && !isListedCollege && (
            <option value={selected} disabled>
              {selected}
            </option>
          )}

          {colleges.map((college) => (
            <option key={college.name} value={college.name}>
              {college.name}
            </option>
          ))}
        </select>

        <span className="college-select-arrow" aria-hidden="true">
          ▼
        </span>
      </div>

      {selectedLogo && (
        <img
          className="college-selected-logo"
          src={selectedLogo}
          alt={`${selected} logo`}
        />
      )}
    </div>
  </div>
);
}