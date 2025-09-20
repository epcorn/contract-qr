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
      // Only add the month if it's within the contract period
      if (sixMonthsLater.isBefore(endMoment)) {
        billingMonths.add(sixMonthsLater.format("MMM YYYY"));
      }
      break;
    }

    case "Quarterly start": {
      // Bill at the start of every 3-month period from the start date
      while (currentMoment.isBefore(endMoment)) {
        billingMonths.add(currentMoment.format("MMM YYYY"));
        currentMoment.add(3, "months");
      }
      break;
    }

    case "Quarterly end": {
      // Bill at the end of every 3-month period from the start date
      let quarterEndMoment = moment(startMoment).add(2, "months");
      while (quarterEndMoment.isBefore(endMoment)) {
        billingMonths.add(quarterEndMoment.format("MMM YYYY"));
        quarterEndMoment.add(3, "months");
      }
      break;
    }

    case "Alternate Monthly": {
      // Bill every other month from the start date
      while (currentMoment.isBefore(endMoment)) {
        billingMonths.add(currentMoment.format("MMM YYYY"));
        currentMoment.add(2, "months");
      }
      break;
    }

    case "End of contract": {
      // The billing month is the end date of the contract
      billingMonths.add(moment(endDate).format("MMM YYYY"));
      break;
    }

    case "Monthly": {
      // Add each month from start to end date
      while (currentMoment.isBefore(endMoment)) {
        billingMonths.add(currentMoment.format("MMM YYYY"));
        currentMoment.add(1, "month");
      }
      break;
    }

    case "Bill After Job":
    case "Manual":
      // No automatic calculation for these options
      return [];

    default:
      return [];
  }

  // Sort the results chronologically before returning
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
