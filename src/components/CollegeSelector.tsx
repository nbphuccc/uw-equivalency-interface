import { colleges } from "../utils/collegeGrouping";

type Props = {
  selected: string;
  onChange: (collegeName: string, collegeGroup: string) => void;
};

export default function CollegeSelector({ selected, onChange }: Props) {
  const isListedCollege = colleges.some(
    (college) => college.name === selected
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ marginRight: 8 }}>Select College:</label>

      <select
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
        <option value="">-- Choose a college --</option>

        {/* Display the current group even though it isn't selectable */}
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
    </div>
  );
}