import { InputRow } from ".";
import { useDataContext } from "../context/data_context";

const BillToAddress = ({ id }) => {
  const { billToAddress, handleChange } = useDataContext();
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
  } = billToAddress;
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
            name="billToAddress-prefix" // <-- UPDATED
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
            name="billToAddress-name" // <-- UPDATED
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
        name="billToAddress-address1" // <-- UPDATED
        placeholder="Building/Office Name"
        value={address1}
      />
      <InputRow
        label="Address2 :"
        id={id}
        type="text"
        placeholder="Flat/Office No"
        name="billToAddress-address2" // <-- UPDATED
        value={address2}
      />
      <InputRow
        label="Address3 :"
        id={id}
        type="text"
        placeholder="Road/Lane Name"
        name="billToAddress-address3" // <-- UPDATED
        value={address3}
      />
      <InputRow
        label="Address4 :"
        id={id}
        type="text"
        placeholder="Location"
        name="billToAddress-address4" // <-- UPDATED
        value={address4}
      />
      <InputRow
        label="Near By :"
        id={id}
        type="text"
        placeholder="Landmark"
        name="billToAddress-nearBy" // <-- UPDATED
        value={nearBy}
      />
      <InputRow
        label="City :"
        id={id}
        type="text"
        name="billToAddress-city" // <-- UPDATED
        value={city}
      />
      <InputRow
        label="Pincode :"
        id={id}
        type="number"
        name="billToAddress-pincode" // <-- UPDATED
        value={pincode}
      />
    </div>
  );
};
export default BillToAddress;
