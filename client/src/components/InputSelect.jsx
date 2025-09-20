import React from "react";
// REMOVED: No longer needs to get data from the context itself.
// import { useDataContext } from "../context/data_context";

const InputSelect = ({
  label,
  data,
  name,
  value,
  id,
  width,
  w,
  hasPlaceholder,
  placeholderText,
  required = false,
  handleChange, // It now correctly accepts handleChange as a prop
}) => {
  // REMOVED: const { handleChange } = useDataContext();

  return (
    <div className="row mt-2">
      <div className={w ? "col-md-5" : "col-md-4"}>
        <h4>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </h4>
      </div>
      <div className="col-md-7">
        <select
          className="form-select"
          aria-label="Default select example"
          id={id}
          name={name}
          value={value}
          // THIS IS THE FIX:
          // It now calls the function passed down from the parent component.
          // It no longer has its own complex logic.
          onChange={handleChange}
          style={{ width: width }}
        >
          {hasPlaceholder && (
            <option value="" disabled>
              {placeholderText || `-- Select ${label} --`}
            </option>
          )}
          {data.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InputSelect;
