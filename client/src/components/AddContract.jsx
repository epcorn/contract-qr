import { useEffect, useState } from "react";
import { useDataContext } from "../context/data_context";
import {
  InputRow,
  BillContacts,
  ShipContacts,
  InputSelect,
  Alert,
  BillToAddress,
  ShipToAddress,
} from ".";
import { useNavigate, useParams } from "react-router-dom";

const AddContract = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [same, setSame] = useState(false);
  const [endDate, setEndDate] = useState(null);

  const {
    contractNo,
    startDate,
    createContract,
    contract,
    sameDetails,
    preferred,
    sales,
    specialInstruction,
    contractCreated,
    endContract,
    showAlert,
    loading,
    displayAlert,
    type,
    handleChange,
    adminList,
    allValues,
    updateContract,
    role,
    company,
    branch,
    contractCode,
    billToAddress,
    billToContact1,
  } = useDataContext();
  const { day, time } = preferred;

  const representativeList = [];
  const contractCodesList = [];

  if (adminList) {
    const seenSales = new Set();
    const seenCodes = new Set();

    adminList.forEach((item) => {
      if (item.sales && !seenSales.has(item.sales)) {
        representativeList.push(item.sales);
        seenSales.add(item.sales);
      }

      if (item.contractCode) {
        const label = `${item.contractCode.name}`;

        if (!seenCodes.has(label)) {
          contractCodesList.push(label);
          seenCodes.add(label);
        }
      }
    });
  }

  const branchList = ["MUM - 1", "PUN - 1", "BLR - 1"];
  const timeList = [
    "10 am - 12 pm",
    "11 am - 1 pm",
    "12 pm - 2 pm",
    "2 pm - 4 pm",
    "4 pm - 6 pm",
    "6 pm - 8 pm",
    "Night",
    "Anytime",
    "To Confirm",
  ];
  const endDateList = [
    "1 Month (30 Days)",
    "2 Months (60 Days)",
    "3 Months (90 Days)",
    "4 Months (120 Days)",
    "5 Months (150 Days)",
    "6 Months (180 Days)",
    "7 Months (210 Days)",
    "8 Months (240 Days)",
    "9 Months (270 Days)",
    "10 Months (300 Days)",
    "11 Months (330 Days)",
    "1 Year",
    "Onwards",
  ];
  const companyNames = ["EXPC", "EPPL", "PMO"];
  const typeList = ["NC", "RC"];

  const lastDate = async (startDate) => {
    const date = new Date(startDate);
    const options = {
      "1 Month (30 Days)": 1,
      "2 Months (60 Days)": 2,
      "3 Months (90 Days)": 3,
      "4 Months (120 Days)": 4,
      "5 Months (150 Days)": 5,
      "6 Months (180 Days)": 6,
      "7 Months (210 Days)": 7,
      "8 Months (240 Days)": 8,
      "9 Months (270 Days)": 9,
      "10 Months (300 Days)": 10,
      "11 Months (330 Days)": 11,
      "1 Year": 12,
    };

    if (endContract && options[endContract]) {
      let ss = await new Date(
        date.getFullYear(),
        date.getMonth() + options[endContract],
        0
      );
      return setEndDate(ss);
    } else if (endContract && endContract === "Onwards") {
      return setEndDate(date);
    }
  };

  useEffect(() => {
    if (startDate) lastDate(startDate);
  }, [startDate, endContract]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!sales || sales.trim() === "") {
      displayAlert("Please select a valid Sales Representative.");
      return;
    }

    if (!contractCode || contractCode.trim() === "") {
      displayAlert("Please select a valid Contract Code.");
      return;
    }

    if (!contractNo || !startDate || !preferred.day) {
      displayAlert(
        "Please fill in all required fields (Contract No., Start Date, Preferred Day)."
      );
      return;
    }

    createContract(endDate);
    setSame(false);
  };

  const handleSame = (e) => {
    e.preventDefault();
    if (!billToAddress.name || !billToContact1.name) {
      displayAlert("Please fill in billing details first.");
      return;
    }
    sameDetails();
    setSame(true);
  };

  useEffect(() => {
    allValues();
    if (contractCreated) {
      setTimeout(() => {
        navigate(`/addcard/${contract}`);
      }, 2000);
    }
  }, [contractCreated, navigate, contract]);

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-4">
            <InputRow
              label="Contract No:"
              type="text"
              id="ContractNumber"
              placeholder="eg: s/124"
              name="contractNo"
              value={contractNo}
              handleChange={handleChange}
            />
          </div>
          <div className="col-md-1">
            <select
              className="form-select"
              style={{ marginTop: 6 }}
              aria-label="Default select example"
              name="type"
              value={type}
              onChange={(e) =>
                handleChange({ name: e.target.name, value: e.target.value })
              }
            >
              {typeList.map((data) => (
                <option value={data} key={data}>
                  {data}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-1">
            <select
              className="form-select"
              style={{ marginTop: 6, width: 100 }}
              aria-label="Default select example"
              name="company"
              value={company}
              onChange={(e) =>
                handleChange({ name: e.target.name, value: e.target.value })
              }
            >
              {companyNames.map((data) => (
                <option value={data} key={data}>
                  {data}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2 ps-4">
            <select
              className="form-select"
              style={{ marginTop: 6 }}
              aria-label="Default select example"
              name="branch"
              value={branch}
              onChange={(e) =>
                handleChange({ name: e.target.name, value: e.target.value })
              }
            >
              {branchList.map((data) => (
                <option value={data} key={data}>
                  {data}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <InputSelect
              label="Sales"
              name="sales"
              value={sales}
              data={representativeList}
              hasPlaceholder={true}
              placeholderText="-- Select a sales rep --"
              required={true}
              handleChange={handleChange}
            />
          </div>
          <hr className="mt-3" />
          <div className="col-md-4">
            <InputRow
              label="Start Date :"
              type="date"
              name="startDate"
              value={startDate}
              handleChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <InputSelect
              label="End Date"
              name="endContract"
              value={endContract}
              data={endDateList}
              width={180}
              handleChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <InputSelect
              label="Code"
              name="contractCode"
              value={contractCode}
              data={contractCodesList}
              hasPlaceholder={true}
              placeholderText="-- Select a code --"
              required={true}
              handleChange={handleChange}
            />
          </div>
          <hr className="mt-3" />
          <div className="col-md-4">
            <InputRow
              label="Preferred Day:"
              id="preferred"
              type="text"
              name="preferred-day" // <-- UPDATED
              value={day}
              handleChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <InputSelect
              label="& Time :"
              id="preferred"
              name="preferred-time" // <-- UPDATED
              value={time}
              data={timeList}
              handleChange={handleChange}
            />
          </div>
          <hr className="mt-3" />
          <div className="col-md-6">
            <InputRow
              label="Instructions :"
              type="text"
              name="specialInstruction"
              value={specialInstruction}
              placeholder="should be comma separated"
              handleChange={handleChange}
            />
          </div>
          <hr className="mt-3" />
          <div className="col-md-6 ">
            <h4 className="text-info text-center mb-3">Bill To Details:</h4>
            <BillToAddress id="billToAddress" handleChange={handleChange} />
            <BillContacts />
          </div>
          <div className="col-md-6 ">
            <h4 className="text-info d-inline ms-5">Ship To Details:</h4>
            <button
              onClick={handleSame}
              className="btn btn-primary btn-sm ms-5 d-inline"
            >
              Same As Billing Details
            </button>
            <ShipToAddress id="shipToAddress" handleChange={handleChange} />
            <ShipContacts same={same} />
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={loading}
            >
              New Contract
            </button>
          </div>
          <div className="col-md-4">{showAlert && <Alert />}</div>
        </div>
      </form>
      <div className="col-md-3">
        {(role === "Sales" || role === "Admin") && (
          <button
            className=" btn btn-secondary my-2"
            onClick={() => updateContract({ id, endDate })}
          >
            Update Contract
          </button>
        )}
      </div>
    </div>
  );
};

export default AddContract;
