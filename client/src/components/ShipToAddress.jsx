import { InputRow } from ".";
import { useDataContext } from "../context/data_context";

const ShipToAddress = ({ id }) => {
  const { shipToAddress, handleChange } = useDataContext();
  const prefixList = ["Mr", "Mrs", "Ms", "M/s", "Other"];
  const {
    prefix,
    name,
    address1,
    address2,
    address3,
    address4,
    nearBy,
    city,
    pincode,
  } = shipToAddress;
  return (
    <div>
      <div className="row my-2">
        <div className="col-md-2">
          <label>
            <h4>Name</h4>
          </label>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            aria-label="Default select example"
            id={id}
            name="shipToAddress-prefix" // <-- UPDATED
            value={prefix}
            onChange={handleChange}
          >
            {prefixList.map((data) => {
              return (
                <option value={data} key={data}>
                  {data}
                </option>
              );
            })}
          </select>
        </div>
        <div className="col">
          <input
            className="form-control"
            type="text"
            placeholder="Full Name"
            id={id}
            name="shipToAddress-name" // <-- UPDATED
            value={name}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <InputRow
        label="Address1 :"
        id={id}
        type="text"
        name="shipToAddress-address1" // <-- UPDATED
        placeholder="Building/Office Name"
        value={address1}
      />
      <InputRow
        label="Address2 :"
        id={id}
        type="text"
        placeholder="Flat/Office No"
        name="shipToAddress-address2" // <-- UPDATED
        value={address2}
      />
      <InputRow
        label="Address3 :"
        id={id}
        type="text"
        placeholder="Road/Lane Name"
        name="shipToAddress-address3" // <-- UPDATED
        value={address3}
      />
      <InputRow
        label="Address4 :"
        id={id}
        type="text"
        placeholder="Location"
        name="shipToAddress-address4" // <-- UPDATED
        value={address4}
      />
      <InputRow
        label="Near By :"
        id={id}
        type="text"
        placeholder="Landmark"
        name="shipToAddress-nearBy" // <-- UPDATED
        value={nearBy}
      />
      <InputRow
        label="City :"
        id={id}
        type="text"
        name="shipToAddress-city" // <-- UPDATED
        value={city}
      />
      <InputRow
        label="Pincode :"
        id={id}
        type="number"
        name="shipToAddress-pincode" // <-- UPDATED
        value={pincode}
      />
    </div>
  );
};

export default ShipToAddress;
