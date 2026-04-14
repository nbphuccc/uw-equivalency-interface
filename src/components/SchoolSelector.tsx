type Props = {
  selected: string;       // ← now stores the label, e.g. "Seattle Central College"
  onChange: (label: string, groupValue: string) => void; // ← passes both up
};

const colleges = [
  { label: "Bates Technical College", value: "Bates Technical College" },
  { label: "Bellevue College", value: "Bellevue College" },
  { label: "Bellingham Technical College", value: "Bellingham Technical College" },
  { label: "Big Bend Community College", value: "Big Bend Community College" },
  { label: "Cascadia College", value: "Cascadia College" },
  { label: "Centralia College", value: "Centralia College" },
  { label: "Clark College", value: "Clark College" },
  { label: "Clover Park Technical College", value: "Clover Park Technical College" },
  { label: "Columbia Basin College", value: "Columbia Basin College" },
  { label: "Edmonds College", value: "Edmonds College" },
  { label: "Everett Community College", value: "Everett Community College" },
  { label: "Grays Harbor College", value: "Grays Harbor College" },
  { label: "Green River College", value: "Green River College" },
  { label: "Highline College", value: "Highline College" },
  { label: "Lake Washington Institute of Technology", value: "Lake Washington Institute of Technology" },
  { label: "Lower Columbia College", value: "Lower Columbia College" },
  { label: "Northwest Indian College", value: "Northwest Indian College" },
  { label: "Olympic College", value: "Olympic College" },
  { label: "Peninsula College", value: "Peninsula College" },
  { label: "Pierce College", value: "Pierce College" },
  { label: "Renton Technical College", value: "Renton Technical College" },

  { label: "North Seattle College", value: "Seattle Colleges" },
  { label: "Seattle Central College", value: "Seattle Colleges" },
  { label: "South Seattle College", value: "Seattle Colleges" },

  { label: "Shoreline Community College", value: "Shoreline Community College" },
  { label: "Skagit Valley College", value: "Skagit Valley College" },
  { label: "South Puget Sound Community College", value: "South Puget Sound Community College" },

  { label: "Spokane Community College", value: "Spokane Colleges" },
  { label: "Spokane Falls Community College", value: "Spokane Colleges" },

  { label: "Tacoma Community College", value: "Tacoma Community College" },
  { label: "Walla Walla Community College", value: "Walla Walla Community College" },
  { label: "Wenatchee Valley College", value: "Wenatchee Valley College" },
  { label: "Whatcom Community College", value: "Whatcom Community College" },
  { label: "Yakima Valley College", value: "Yakima Valley College" },
];

export default function SchoolSelector({ selected, onChange }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ marginRight: 8 }}>Select School:</label>
      <select
        value={selected}
        onChange={(e) => {
          const opt = colleges.find((c) => c.label === e.target.value);
          if (opt) onChange(opt.label, opt.value);
        }}
      >
        <option value="">-- Choose a college --</option>
        {colleges.map((college) => (
          <option key={college.label} value={college.label}>
            {college.label}
          </option>
        ))}
      </select>
    </div>
  );
}