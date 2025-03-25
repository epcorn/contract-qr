/* eslint-disable react/prop-types */
import { useDataContext } from "../context/data_context";
import InputRow from "./InputRow";

function SearchContracts({ toggle, setToggle }) {
  const { search, searchSD, searchED, clearValues } = useDataContext();
  const handleSubmit = (e) => {
    e.preventDefault();
    setToggle(!toggle);
    clearValues();
  };
  return (
    <div className="row">
      <div className="col-md-4">
        <InputRow label="Search" type="text" name="search" value={search} />
      </div>
      <div className="col-md-3 mobile-table">
        <InputRow
          label="From :"
          type="date"
          name="searchSD"
          value={searchSD}
          width={170}
        />
      </div>
      <div className="col-md-3 mobile-table">
        <InputRow
          label="To :"
          type="date"
          name="searchED"
          value={searchED}
          width={170}
        />
      </div>
      <div className="col-md-1 mt-1">
        <button
          className="btn btn-dark"
          onClick={() => {
            setToggle(!toggle);
          }}
        >
          Search
        </button>
      </div>
      <div className="col-md-1 my-1">
        <button className="btn btn-dark" onClick={handleSubmit}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default SearchContracts;
