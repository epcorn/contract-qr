import React, { useEffect, useCallback } from "react";
import { useDataContext } from "../context/data_context";
import { InputRow, InputSelect } from ".";
import { calculateBillingMonths } from "../../utils/billingUtils";
import Select from "react-select";
import moment from "moment";

// UPDATED: This component now generates a list of months with years
const ManualBillingMonthsPicker = ({
  selectedMonths,
  handleMonthChange,
  startDate,
  endDate,
}) => {
  // Generate month-year options dynamically based on contract dates
  const monthYearOptions = [];
  if (startDate && endDate) {
    let current = moment(startDate);
    const end = moment(endDate);

    while (current.isBefore(end) || current.isSame(end, "month")) {
      const monthYearStr = current.format("MMM YYYY");
      monthYearOptions.push({ value: monthYearStr, label: monthYearStr });
      current.add(1, "month");
    }
  }

  const selectedOptions = Array.isArray(selectedMonths)
    ? selectedMonths.map((monthStr) => ({
        value: monthStr,
        label: monthStr,
      }))
    : [];

  return (
    <div className="form-group mb-3">
      <label htmlFor="selectedManualMonths" className="form-label">
        Select Billing Months:
      </label>
      <Select
        id="selectedManualMonths"
        name="selectedManualMonths"
        isMulti
        options={monthYearOptions}
        value={selectedOptions}
        onChange={(selected) =>
          handleMonthChange(selected ? selected.map((s) => s.value) : [])
        }
        className="basic-multi-select"
        classNamePrefix="select"
        placeholder="Select months..."
      />
      <small className="form-text text-muted">
        Select all applicable billing months for the contract.
      </small>
    </div>
  );
};

// This component remains unchanged
const BillingMonthsDisplay = ({ months }) => {
  if (!Array.isArray(months) || months.length === 0) {
    return <p className="text-muted">No billing months calculated yet.</p>;
  }
  return (
    <div className="mt-2">
      <label className="form-label">Predicted Billing Months:</label>
      <div className="border p-2 rounded bg-light">{months.join(", ")}</div>
      <small className="form-text text-muted">
        These months are automatically calculated based on the contract start
        date and frequency.
      </small>
    </div>
  );
};

const SingleBillingConfig = ({ startDate, endDate }) => {
  const { singleBillingConfig, handleChange, setBillingMonths } =
    useDataContext();

  const billingFrequencyOptions = [
    "Full Payment While Signing The Contract", // CHANGED: Added new option
    "50% while signing contract and 50% after 6 months",
    "Quarterly start",
    "Quarterly end",
    "Alternate Monthly",
    "End of contract",
    "Monthly",
    "Bill After Job",
    "NTB", // new option
    "Manual",
  ];

  const {
    frequencyType = "",
    manualDescription = "",
    calculatedBillingMonths = [],
    selectedManualMonths = [],
  } = singleBillingConfig || {};

  const handleManualMonthsChange = useCallback(
    (months) => {
      setBillingMonths("single", months, null, "manual");
    },
    [setBillingMonths]
  );

  useEffect(() => {
    if (!frequencyType || !startDate || !endDate) {
      return;
    }

    if (frequencyType === "Manual") {
      if (
        Array.isArray(calculatedBillingMonths) &&
        calculatedBillingMonths.length > 0
      ) {
        setBillingMonths("single", [], "calculated");
      }
    } else {
      const calculated = calculateBillingMonths(
        new Date(startDate),
        frequencyType,
        endDate
      );
      if (
        JSON.stringify(calculated) !== JSON.stringify(calculatedBillingMonths)
      ) {
        setBillingMonths("single", calculated, "calculated");
      }
      if (
        Array.isArray(selectedManualMonths) &&
        selectedManualMonths.length > 0
      ) {
        setBillingMonths("single", [], "manual");
      }
    }
  }, [
    frequencyType,
    startDate,
    endDate,
    setBillingMonths,
    calculatedBillingMonths,
    selectedManualMonths,
  ]);

  return (
    <div className="single-billing-config border p-3 mb-3 rounded shadow-sm bg-white">
      <h5 className="text-primary mb-3 border-bottom pb-2">
        Single Billing Details
      </h5>
      <div className="row">
        <div className="col-md-12 mb-3">
          <InputSelect
            label="Billing Frequency Type:"
            name="frequencyType"
            id="single-billing-frequency"
            value={frequencyType || ""}
            data={billingFrequencyOptions}
            hasPlaceholder={true}
            placeholderText="-- Select Frequency Type --"
            required={true}
            handleChange={(e) => handleChange(e, { id: "singleBillingConfig" })}
          />
        </div>
      </div>

      {frequencyType === "Manual" ? (
        <>
          <div className="row">
            <div className="col-md-12 mb-3">
              <InputRow
                label="Manual Billing Description:"
                type="text"
                name="manualDescription"
                id="singleBillingConfig"
                value={manualDescription}
                placeholder="e.g., Bill as per service completion (Optional)"
                required={false}
                handleChange={handleChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ManualBillingMonthsPicker
                selectedMonths={selectedManualMonths}
                handleMonthChange={handleManualMonthsChange}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>
        </>
      ) : (
        frequencyType && (
          <div className="row">
            <div className="col-md-12">
              <BillingMonthsDisplay months={calculatedBillingMonths} />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SingleBillingConfig;
