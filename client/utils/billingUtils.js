// src/utils/billingUtils.js
import moment from "moment";

/**
 * Calculates the predicted billing months based on start date, frequency, and a final end date,
 * according to specific business rules.
 * @param {Date} startDate - The contract start date.
 * @param {string} frequencyType - The billing frequency type.
 * @param {Date} endDate - The contract's calculated end date.
 * @returns {string[]} An array of formatted month and year strings (e.g., "Jan 2026", "Feb 2026").
 */
export const calculateBillingMonths = (startDate, frequencyType, endDate) => {
  if (!startDate || !(startDate instanceof Date) || !endDate) {
    console.warn("Invalid dates provided to calculateBillingMonths.");
    return [];
  }

  const billingMonths = new Set();
  const startMoment = moment(startDate).startOf("day");
  const endMoment = moment(endDate).endOf("day");
  let currentMoment = moment(startMoment);

  switch (frequencyType) {
    case "50% while signing contract and 50% after 6 months": {
      const sixMonthsLater = moment(startMoment).add(6, "months");
      if (sixMonthsLater.isBefore(endMoment)) {
        billingMonths.add(sixMonthsLater.format("MMM YYYY"));
      }
      break;
    }

    case "Quarterly start": {
      while (currentMoment.isBefore(endMoment)) {
        billingMonths.add(currentMoment.format("MMM YYYY"));
        currentMoment.add(3, "months");
      }
      break;
    }

    case "Quarterly end": {
      let quarterEndMoment = moment(startMoment).add(2, "months");
      while (quarterEndMoment.isBefore(endMoment)) {
        billingMonths.add(quarterEndMoment.format("MMM YYYY"));
        quarterEndMoment.add(3, "months");
      }
      break;
    }

    case "Alternate Monthly": {
      while (currentMoment.isBefore(endMoment)) {
        billingMonths.add(currentMoment.format("MMM YYYY"));
        currentMoment.add(2, "months");
      }
      break;
    }

    case "End of contract": {
      billingMonths.add(moment(endDate).format("MMM YYYY"));
      break;
    }

    case "Monthly": {
      while (currentMoment.isBefore(endMoment)) {
        billingMonths.add(currentMoment.format("MMM YYYY"));
        currentMoment.add(1, "month");
      }
      break;
    }

    // CHANGED: Added the new option here
    case "Full payment in advance":
    case "Bill After Job":
    case "Manual":
      // No automatic calculation for these options
      return [];

    default:
      return [];
  }

  return Array.from(billingMonths).sort((a, b) =>
    moment(a, "MMM YYYY").diff(moment(b, "MMM YYYY"))
  );
};

/**
 * Returns the full name of a month from its 0-indexed number.
 * @param {number} monthIndex - The 0-indexed month number (0-11).
 * @returns {string} The month name.
 */
export const getMonthName = (monthIndex) => {
  const date = new Date();
  date.setMonth(monthIndex);
  return date.toLocaleString("en-US", { month: "long" });
};
