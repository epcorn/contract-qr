import React from "react";
import { useDataContext } from "../context/data_context";
import { InputRow, InputSelect } from ".";
import Select from "react-select";
import moment from "moment";

// Reusable component for the manual month-year picker
const ManualBillingMonthsPicker = ({
  selectedMonths,
  handleMonthChange,
  startDate,
  endDate,
  serviceId,
}) => {
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
    ? selectedMonths.map((monthStr) => ({ value: monthStr, label: monthStr }))
    : [];

  return (
    <div className="form-group mb-3">
      <label htmlFor={`manual-months-${serviceId}`} className="form-label">
        Select Billing Months:
      </label>
      <Select
        id={`manual-months-${serviceId}`}
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
    </div>
  );
};

// Reusable component to display calculated months
const BillingMonthsDisplay = ({ months }) => {
  if (!Array.isArray(months) || months.length === 0) {
    return <p className="text-muted mt-2">No billing months calculated.</p>;
  }
  return (
    <div className="mt-2">
      <label className="form-label">Predicted Billing Months:</label>
      <div className="border p-2 rounded bg-light">{months.join(", ")}</div>
    </div>
  );
};

// --- The Main MultiBillingConfig Component ---
const MultiBillingConfig = ({ services, startDate, endDate }) => {
  const { multiBillingConfig, handleChange, setBillingMonths } =
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
    "NTB",
    "Manual",
  ];

  if (!services || services.length === 0) {
    return (
      <p className="text-center text-muted">
        No service cards found for this contract. Please add service cards first
        to enable multi-billing.
      </p>
    );
  }

  return (
    <div className="multi-billing-config">
      <h5 className="text-primary mb-3 border-bottom pb-2">
        Multi-Billing Details
      </h5>
      {services.map((service, index) => {
        const entry = multiBillingConfig[index] || {};

        return (
          <div
            key={service._id}
            className="multi-billing-entry border p-3 mb-3 rounded shadow-sm bg-light"
          >
            <h6 className="text-secondary fw-bold">
              Card #{index + 1}:{" "}
              <span className="text-dark">{service.service.join(", ")}</span>
            </h6>
            <p className="mb-2 small text-muted">
              Service Frequency: {service.frequency}
            </p>

            <div className="row">
              <div className="col-md-12 mb-3">
                <InputSelect
                  label="Billing Frequency Type:"
                  name="frequencyType"
                  value={entry.frequencyType || ""}
                  data={billingFrequencyOptions}
                  hasPlaceholder={true}
                  placeholderText="-- Select Billing Frequency --"
                  required={true}
                  handleChange={(e) => {
                    console.log(`1. onChange triggered for Card #${index + 1}`);
                    handleChange(e, { id: "multiBillingConfig", index });
                  }}
                />
              </div>
            </div>

            {entry.frequencyType === "Manual" ? (
              <>
                <InputRow
                  label="Manual Billing Description:"
                  type="text"
                  name="manualDescription"
                  value={entry.manualDescription || ""}
                  placeholder="Optional: e.g., Bill upon completion"
                  required={false}
                  handleChange={(e) =>
                    handleChange(e, { id: "multiBillingConfig", index })
                  }
                />
                <ManualBillingMonthsPicker
                  selectedMonths={entry.selectedManualMonths || []}
                  handleMonthChange={(months) =>
                    setBillingMonths("multi", months, index, "manual")
                  }
                  startDate={startDate}
                  endDate={endDate}
                  serviceId={service._id}
                />
              </>
            ) : (
              entry.frequencyType && (
                <BillingMonthsDisplay
                  months={entry.calculatedBillingMonths || []}
                />
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MultiBillingConfig;
