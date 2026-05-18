type Props = {
  showActiveOnly: boolean;
  setShowActiveOnly: (checked: boolean) => void;
};

export default function CurrentCourseToggler({
  showActiveOnly,
  setShowActiveOnly,
}: Props) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <span>Show Active Courses Only</span>

  <input
    type="checkbox"
    checked={showActiveOnly}
    onChange={(e) => setShowActiveOnly(e.target.checked)}
    style={{ display: "none" }}
    id="course-toggle"
  />

  <label
    htmlFor="course-toggle"
    style={{
      width: 42,
      height: 22,
      background: showActiveOnly ? "#007bff" : "#ccc",
      borderRadius: 999,
      position: "relative",
      cursor: "pointer",
      transition: "0.2s",
    }}
  >
    <span
      style={{
        position: "absolute",
        top: 2,
        left: showActiveOnly ? 22 : 2,
        width: 18,
        height: 18,
        background: "white",
        borderRadius: "50%",
        transition: "0.2s",
      }}
    />
  </label>
</label>
  );
}