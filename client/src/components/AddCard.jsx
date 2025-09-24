import React, { useEffect, useState } from "react";
import { useDataContext } from "../context/data_context";
import { InputSelect, Alert, Loading, InputRow } from ".";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import MultiSelect from "react-multiple-select-dropdown-lite";
import "react-multiple-select-dropdown-lite/dist/index.css";

const AddCard = () => {
  const [dueMonths, setDueMonths] = useState([]);
  const [add, setAdd] = useState(true);
  const [value, setValue] = useState("");
  const [chemicals, setChemicals] = useState([]);
  const [isSubmiting, setIsSubmiting] = useState(false);
  // const [submitError, setSubmitError] = useState(null); // No longer needed, using alerts

  const navigate = useNavigate();

  const handleOnchange = (val) => {
    setValue(val);
  };

  const {
    frequency,
    fetchSingleContract,
    singleContract,
    createCard,
    createCards,
    treatmentLocation,
    handleChange,
    showAlert,
    loading,
    displayAlert,
    role,
    adminList,
    area,
    business,
    allValues,
    deleteService,
    del,
    ratrid,
    editService,
    user,
  } = useDataContext();

  const { contractNo, startDate, endDate, services } = singleContract;

  const frequencyList = [
    "Daily",
    "Single",
    "Alternate Days",
    "Thrice A Week",
    "Twice A Week",
    "Weekly",
    "Thrice A Month",
    "Fortnightly",
    "Monthly",
    "Alternate Monthly",
    "Quarterly",
    "3 Services Once In 4 Months",
    "2 Services Once In 6 Months",
    "As An When Called",
    "Multi Frequency",
    "Other",
  ];

  const businessList = [];
  const serviceChemicalsList = [];
  if (adminList) {
    adminList.forEach(
      (item) =>
        (item.business !== undefined && businessList.push(item.business)) ||
        (item.serviceChemicals !== undefined &&
          serviceChemicalsList.push(item.serviceChemicals))
    );
  }

  const sort = serviceChemicalsList.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });

  const home = [
    "1 RK",
    "1 BHK",
    "2 BHK",
    "3 BHK",
    "4 BHK",
    "5 BHK",
    "Bungalow",
  ];

  const ratridOp = ["No", "Yes"];

  const addChemicals = () => {
    const temp = [];
    const value1 = value.split(",");

    value1.forEach((item) => {
      serviceChemicalsList.forEach((item1) => {
        return item1.label === item && temp.push(item1.chemical);
      });
    });

    return setChemicals(temp);
  };

  const { id } = useParams();

  const dueRange = (startDate, endDate) => {
    if (!startDate || !endDate) return; // Guard against missing dates
    const startMonth = startDate.split("T")[0];
    const endMonth = endDate.split("T")[0];

    var start = moment(startMonth);
    var end = moment(endMonth);

    const curDate = start.format("DD");

    var months = [start.format("MMM YY")];
    end.subtract(1, "month");

    var month = moment(start);
    while (month < end) {
      month.add(1, "month");
      months.push(month.format("MMM YY"));
    }
    const due = [];
    months.forEach((date, index) => {
      if (startDate === endDate && index === 0) {
        due.push(`${curDate} ${date}, Onwards`);
        return;
      }
      if (frequency === "3 Services Once In 4 Months" && index % 4 === 0) {
        due.push(date);
      } else if (frequency === "Quarterly" && index % 3 === 0) {
        due.push(date);
      } else if (frequency === "Single" && index === 0) {
        due.push(date);
      } else if (
        frequency === "2 Services Once In 6 Months" &&
        index % 6 === 0
      ) {
        due.push(date);
      } else if (frequency === "Alternate Monthly" && index % 2 === 0) {
        due.push(date);
      } else if (
        [
          "Daily",
          "Weekly",
          "Multi Frequency",
          "Alternate Days",
          "As An When Called",
          "Twice A Week",
          "Thrice A Week",
          "Thrice A Month",
          "Fortnightly",
          "Other",
          "Monthly",
        ].includes(frequency)
      ) {
        due.push(date);
      }
    });
    setDueMonths(due);
  };

  useEffect(() => {
    fetchSingleContract(id);
    // eslint-disable-next-line
  }, [id, add, del]);

  useEffect(() => {
    if (startDate && endDate) {
      dueRange(startDate, endDate);
    }
    // eslint-disable-next-line
  }, [startDate, endDate, frequency]);

  useEffect(() => {
    allValues();
    addChemicals();
    // eslint-disable-next-line
  }, [value]);

  // --- UPDATED SUBMIT HANDLER FOR SAVING A SINGLE CARD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmiting || loading || !value) {
      displayAlert({
        type: "danger",
        msg: "Please select services before saving.",
      });
      return;
    }

    setIsSubmiting(true);
    try {
      await createCard(dueMonths, value, chemicals);
      setAdd(!add); // Re-fetch the contract to show the new card
      setValue(""); // Clear the multi-select input
      displayAlert({ type: "success", msg: "Service card saved!" });
    } catch (error) {
      console.error("Error saving service card:", error);
      displayAlert({
        type: "danger",
        msg: "Failed to save card. Please try again.",
      });
    } finally {
      setIsSubmiting(false);
    }
  };

  // --- UPDATED GENERATE CARDS HANDLER WITH PROPER ERROR HANDLING ---
  const generateCards = async (e) => {
    e.preventDefault();
    setIsSubmiting(true);

    try {
      await createCards(id);

      // This part now only runs on success
      setAdd(!add);
      displayAlert({
        type: "success",
        msg: "Cards created! Redirecting to billing...",
      });
      navigate(`/add-billing/${id}`);
    } catch (error) {
      // This part now runs on failure
      console.error("Error creating cards:", error);
      displayAlert({
        type: "danger",
        msg: "Failed to create cards. Please check console for details.",
      });
    } finally {
      // This always runs
      setIsSubmiting(false);
    }
  };

  if (loading && !isSubmiting) {
    // Prevent double loading indicator
    return <Loading />;
  }

  return (
    <div className="container my-3">
      <div className="row g-4 mb-4 text-center">
        <div className="col-md-4">
          <h4>{`Contract Number: ${contractNo || ""}`}</h4>
        </div>
        <div className="col-md-4">
          <h4>{`Start Date: ${
            startDate ? moment(startDate).format("DD/MM/YYYY") : ""
          }`}</h4>
        </div>
        <div className="col-md-4">
          <h4>{`End Date: ${
            endDate ? moment(endDate).format("DD/MM/YYYY") : ""
          }`}</h4>
        </div>
      </div>
      <hr />

      <h5>Existing Service Cards</h5>
      <table className="table table-striped table-bordered border-dark ">
        <thead>
          <tr>
            <th>No.</th>
            <th className="text-center">Services</th>
            <th className="text-center">Frequency</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services && services.length > 0 ? (
            services.map((data, index) => {
              const {
                frequency,
                service,
                _id,
                treatmentLocation,
                business,
                area,
              } = data;
              return (
                <tr key={_id}>
                  <td>{index + 1}</td>
                  <td>{service.join(", ")}</td>
                  <td>{frequency}</td>
                  <td>
                    {role === "Admin" && (
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => deleteService(_id)}
                      >
                        Delete
                      </button>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        editService({
                          frequency,
                          business,
                          treatmentLocation,
                          area,
                          _id,
                        })
                      }
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No service cards have been added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(role === "Sales" || role === "Admin") && (
        <div className="mt-5 p-4 border rounded shadow-sm">
          <h5 className="mb-3">Add a New Service Card</h5>
          <form onSubmit={handleSubmit}>
            <div className="row align-items-end g-3">
              <div className="col-md-4">
                <InputSelect
                  label="Business"
                  name="business"
                  value={business}
                  data={businessList}
                  handleChange={handleChange}
                />
              </div>
              {!home.includes(business) && (
                <div className="col-md-3">
                  <InputRow
                    label="Area (in sqft):"
                    placeholder="e.g., 1500"
                    type="text"
                    name="area"
                    value={area}
                    handleChange={handleChange}
                  />
                </div>
              )}
              <div className="col-md-5">
                <label className="form-label">
                  Ratrid with other services:
                </label>
                <select
                  className="form-select"
                  name="ratrid"
                  value={ratrid}
                  onChange={handleChange}
                >
                  {ratridOp.map((data) => (
                    <option value={data} key={data}>
                      {data}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-lg-4">
                <InputSelect
                  label="Frequency"
                  name="frequency"
                  value={frequency}
                  data={frequencyList}
                  handleChange={handleChange}
                />
              </div>
              <div className="col-lg-4">
                <label className="form-label">Services</label>
                <MultiSelect
                  onChange={handleOnchange}
                  options={sort}
                  className="multiselect"
                />
              </div>
              <div className="col-lg-3">
                <label htmlFor="treatmentLocation" className="form-label">
                  Location To Be Treated
                </label>
                <textarea
                  className="form-control"
                  id="treatmentLocation"
                  name="treatmentLocation"
                  value={treatmentLocation}
                  onChange={handleChange}
                  rows="2"
                  required
                ></textarea>
              </div>
              <div className="col-lg-1">
                <button
                  className="btn btn-dark w-100"
                  type="submit"
                  disabled={isSubmiting}
                >
                  Save
                </button>
              </div>
            </div>
          </form>

          <hr className="my-4" />

          <div className="row align-items-center">
            <div className="col-md-3">
              <button
                className="btn btn-success btn-lg w-100"
                onClick={generateCards}
                disabled={isSubmiting || !services || services.length === 0}
              >
                Create Cards & Add Billing
              </button>
            </div>
            <div className="col-md-9">{showAlert && <Alert />}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCard;
