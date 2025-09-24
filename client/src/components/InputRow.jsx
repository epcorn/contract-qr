// src/components/InputRow.js

import { useDataContext } from "../context/data_context";

const InputRow = ({
  label,
  type,
  name,
  value,
  id,
  placeholder,
  width,
  required = true,
  handleChange, // This prop is now the key
}) => {
  // We still need the context for the fallback logic
  const context = useDataContext();

  const handleInputChange = (e) => {
    // If a specific handleChange function is passed as a prop, use it.
    // This will be used by your MultiBillingConfig component.
    if (handleChange) {
      handleChange(e);
      return;
    }

    // Otherwise, for all other InputRows across your app,
    // use the original logic. This ensures nothing else breaks.
    context.handleChange({
      name: e.target.name,
      value: e.target.value,
      id: id,
    });
  };

  return (
    <div className="row g-3 align-items-center">
      <div className="col-auto">
        <label className="col-form-label">
          <h4>{label}</h4>
        </label>
      </div>
      <div className="col">
        <input
          className="form-control"
          required={required}
          type={type}
          id={id}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={handleInputChange} // Use our new conditional handler
          style={{ width: width }}
        />
      </div>
    </div>
  );
};

export default InputRow;
