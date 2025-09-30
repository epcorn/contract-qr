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
    saveBillingConfig,
    loading,
    showAlert,
    singleContract,
    fetchSingleContract,
    fetchServicesForContract,
    servicesForContract,
    saveConfigAndGenerateDocs, // will now generate docs after billing information is saved.
  } = useDataContext();

  const { contractNo, startDate, endDate } = singleContract || {};
  console.log("CHECKPOINT 5: [COMPONENT] AddBilling is rendering...");
  console.log("   > State from context - billingType:", billingType);

  // --- FINAL DEBUGGING useEffect ---
  useEffect(() => {
    const loadContractData = async () => {
      if (contractId) {
        console.log("A. Inside useEffect, about to fetch contract...");
        const contractData = await fetchSingleContract(contractId);
        console.log("B. Contract fetch finished. Returned data:", contractData);

        if (contractData && contractData.billingType === "multi") {
          console.log("C. Condition MET. About to fetch services...");
          await fetchServicesForContract(contractId, contractData.contractNo);
          console.log("D. Services fetch call FINISHED.");
        } else {
          console.log(
            "E. Condition FAILED. Not fetching services. Billing type was:",
            contractData?.billingType
          );
        }
      }
    };
    loadContractData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);
  // --- END OF DEBUGGING useEffect --

  const billingTypeOptions = [
    { label: "Single Billing", value: "single" },
    { label: "Multi-Billing", value: "multi" },
  ];

  const handleBillingTypeChange = (e) => {
    const { name, value } = e.target;
    handleChange({ name, value });

    // Pass contractNo directly here as well to be safe
    if (value === "multi" && contractId && contractNo) {
      fetchServicesForContract(contractId, contractNo);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call our new master function instead of the old one
      await saveConfigAndGenerateDocs(contractId);

      // The navigation logic after success remains the same
      setTimeout(() => {
        navigate(`/contract/${contractId}`);
      }, 2000);
    } catch (error) {
      // The context will handle displaying the alert. We can still log the error.
      console.error(
        "Failed to save configuration and generate documents:",
        error
      );
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
