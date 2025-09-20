import React, { useEffect } from "react";
import { useDataContext } from "../context/data_context";
import { SingleBillingConfig, MultiBillingConfig, Alert, Loading } from ".";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";

const AddBilling = () => {
  const { id: contractId } = useParams();
  const navigate = useNavigate();

  const {
    billingType,
    handleChange,
    submitBillingData,
    loading,
    showAlert,
    displayAlert,
    singleContract,
    fetchSingleContract, // <-- Import function
    fetchServicesForContract, // <-- Import function
    servicesForContract, // <-- Import correct state for services
  } = useDataContext();

  const { contractNo, startDate, endDate } = singleContract || {};

  // This useEffect ensures contract data (start/end dates) is loaded when the component mounts
  useEffect(() => {
    if (contractId) {
      fetchSingleContract(contractId);
    }
    // eslint-disable-next-line
  }, [contractId]);

  const billingTypeOptions = [
    { label: "Single Billing", value: "single" },
    { label: "Multi-Billing", value: "multi" },
  ];

  const handleBillingTypeChange = (e) => {
    const { name, value } = e.target;
    handleChange({ name, value });

    // When user selects multi-billing, fetch the associated service cards
    if (value === "multi" && contractId) {
      fetchServicesForContract(contractId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitBillingData(contractId);
      displayAlert({
        type: "success",
        msg: "Billing data saved successfully!",
      });
      setTimeout(() => {
        navigate(`/contracts/${contractId}`);
      }, 2000);
    } catch (error) {
      displayAlert({
        type: "danger",
        msg: "Failed to save billing data. Please try again.",
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">
        Billing Configuration for Contract #{contractNo || contractId}
      </h2>
      <div className="row g-4 mb-4 text-center">
        <div className="col-md-4">
          <h4>{`Contract Number: ${contractNo || ""}`}</h4>
        </div>
        <div className="col-md-4">
          <h4>{`Start Date: ${
            startDate ? moment(startDate).format("DD/MM/YYYY") : "N/A"
          }`}</h4>
        </div>
        <div className="col-md-4">
          <h4>{`End Date: ${
            endDate ? moment(endDate).format("DD/MM/YYYY") : "N/A"
          }`}</h4>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card p-4 shadow-sm mb-4">
          <div className="d-flex justify-content-center mb-3">
            {billingTypeOptions.map((option) => (
              <div className="form-check form-check-inline" key={option.value}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="billingType"
                  id={`billingType-${option.value}`}
                  value={option.value}
                  checked={billingType === option.value}
                  onChange={handleBillingTypeChange}
                />
                <label
                  className="form-check-label"
                  htmlFor={`billingType-${option.value}`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {billingType === "single" && (
          <SingleBillingConfig startDate={startDate} endDate={endDate} />
        )}

        {billingType === "multi" && (
          // UPDATED: Pass the correct services prop
          <MultiBillingConfig
            services={servicesForContract}
            startDate={startDate}
            endDate={endDate}
          />
        )}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <button
            type="submit"
            className="btn btn-success btn-lg"
            disabled={loading}
          >
            Save Billing Configuration
          </button>
          <div className="col-md-5">{showAlert && <Alert />}</div>
        </div>
      </form>
    </div>
  );
};

export default AddBilling;
