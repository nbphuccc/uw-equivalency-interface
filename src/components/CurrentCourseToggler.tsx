import "./CurrentCourseToggler.css";

type Props = {
  showActiveOnly: boolean;
  setShowActiveOnly: (checked: boolean) => void;
};

export default function CurrentCourseToggler({
  showActiveOnly,
  setShowActiveOnly,
}: Props) {
  return (
    <div className="active-course-toggle">
      <span className="active-course-toggle-text">
        Show Active Courses Only
      </span>

      <input
        className="active-course-toggle-input"
        type="checkbox"
        checked={showActiveOnly}
        onChange={(e) => setShowActiveOnly(e.target.checked)}
        id="course-toggle"
      />

      <label
        className="active-course-toggle-switch"
        htmlFor="course-toggle"
      >
        <span className="active-course-toggle-knob" />
      </label>
    </div>
  );
}