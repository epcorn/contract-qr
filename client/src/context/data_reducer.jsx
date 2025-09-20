import {
  LOADING,
  FETCH_CONTRACTS,
  FETCH_CONTRACT,
  FETCH_CARD,
  HANDLE_CHANGE,
  CREATE_CONTRACT,
  CREATE_CARD,
  IMAGE_UPLOADED,
  SAME_DETAILS,
  DELETE_CONTRACT,
  DISPLAY_ALERT,
  CLEAR_ALERT,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  FAIL_ALERT,
  LOGOUT,
  CREATE_CARDS,
  CLEAR_VALUES,
  CONTRACT_FAIL,
  FETCH_SERVICES,
  UPDATE_CARD,
  CARD_FAIL,
  FETCH_USERS,
  DELETE_USER,
  RENEW_CONTRACT,
  COPY_CONTRACT,
  ALL_VALUES,
  ADD_VALUE,
  DELETE_SERVICE,
  UPDATE_CONTRACT,
  SERVICE_REPORT,
  CLOSE_MODAL,
  JOB_STATS,
  DOCUMENTS_UPLOAD,
  RENEWAL_FILE,
  JOB_NOT_FILE,
  DOCUMENTS_DELETE,
  UPDATE_CARD_FAIL,
  EDIT_SERVICE,
  ADD_EMAILS,
  REMOVE_EMAILS,
  SCHEDULE_MAIL,
  FEEDBACK_STATS,
  SUBMIT_FEEDBACK,
  SERVICE_INTIMATION,
  SERVICE_INTIMATION_FAIL,
  BRANCH_REPORT,
  BRANCH_REPORT_FAIL,
  TOGGLE_CODE,
  CUSTOM_ALERT,
  ADD_MULTI_BILLING_ENTRY,
  UPDATE_MULTI_BILLING_ENTRY,
  REMOVE_MULTI_BILLING_ENTRY,
  SET_BILLING_MONTHS,
  FETCH_SERVICES_FOR_CONTRACT,
  INITIALIZE_MULTI_BILLING,
} from "./action";
import { initialState } from "./data_context";
// IMPORT THE CALCULATION FUNCTION
import { calculateBillingMonths } from "../../utils/billingUtils";

const data_reducer = (state, action) => {
  switch (action.type) {
    case LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    case CLEAR_ALERT: {
      return {
        ...state,
        loading: false,
        showAlert: false,
        alertText: "",
        alertType: "",
      };
    }
    case CUSTOM_ALERT: {
      return {
        ...state,
        alertText: action.payload,
        alertType: "danger",
        showAlert: true,
      };
    }
    case DISPLAY_ALERT: {
      return {
        ...state,
        loading: true,
        showAlert: true,
      };
    }
    case REGISTER_SUCCESS: {
      return {
        ...state,
        loading: false,
        alertText: action.payload.msg,
        alertType: "success",
        showAlert: true,
      };
    }
    case REGISTER_FAIL: {
      return {
        ...state,
        loading: false,
        alertText: action.payload.msg,
        alertType: "danger",
        showAlert: true,
      };
    }
    case LOGIN_SUCCESS: {
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        user: action.payload.name,
        role: action.payload.role,
        alertText: "Redirecting To Dashboard",
        alertType: "success",
        showAlert: true,
      };
    }
    case LOGIN_FAIL: {
      return {
        ...state,
        loading: false,
        alertText: action.payload.msg,
        alertType: "danger",
        showAlert: true,
      };
    }
    case FAIL_ALERT: {
      return {
        ...state,
        loading: false,
        alertText: action.payload.msg,
        alertType: "danger",
        showAlert: true,
      };
    }
    case LOGOUT: {
      return {
        ...initialState,
        loading: false,
        user: null,
        token: null,
      };
    }
    case FETCH_CONTRACTS: {
      return {
        ...state,
        loading: false,
        contracts: action.payload,
      };
    }
    case RENEWAL_FILE: {
      return {
        ...state,
        loading: false,
        renewalFile: action.payload,
      };
    }
    case FETCH_SERVICES: {
      return {
        ...state,
        loading: false,
        allServices: action.payload,
      };
    }
    case FETCH_SERVICES_FOR_CONTRACT: {
      return {
        ...state,
        loading: false,
        servicesForContract: action.payload,
      };
    }
    case INITIALIZE_MULTI_BILLING: {
      const services = action.payload || [];
      const newMultiBillingConfig = services.map((service) => ({
        serviceId: service._id,
        serviceName: service.service,
        frequencyType: "",
        calculatedBillingMonths: [],
        manualDescription: "",
        selectedManualMonths: [],
      }));
      return {
        ...state,
        multiBillingConfig: newMultiBillingConfig,
      };
    }
    case SET_BILLING_MONTHS: {
      const { configType, monthsArray, index, monthType } = action.payload;

      if (configType === "single") {
        const keyToUpdate =
          monthType === "manual"
            ? "selectedManualMonths"
            : "calculatedBillingMonths";
        const keyToClear =
          monthType === "manual"
            ? "calculatedBillingMonths"
            : "selectedManualMonths";
        return {
          ...state,
          singleBillingConfig: {
            ...state.singleBillingConfig,
            [keyToUpdate]: monthsArray,
            [keyToClear]: [],
          },
        };
      }

      if (configType === "multi" && index !== null) {
        const keyToUpdate =
          monthType === "manual"
            ? "selectedManualMonths"
            : "calculatedBillingMonths";
        const keyToClear =
          monthType === "manual"
            ? "calculatedBillingMonths"
            : "selectedManualMonths";
        const newMultiConfig = state.multiBillingConfig.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              [keyToUpdate]: monthsArray,
              [keyToClear]: [],
            };
          }
          return item;
        });
        return { ...state, multiBillingConfig: newMultiConfig };
      }

      return state;
    }
    case FETCH_CONTRACT: {
      const contract = action.payload.contract;
      const initialBillingType =
        contract.billingType || initialState.billingType;
      const initialSingleBillingConfig = {
        ...initialState.singleBillingConfig,
        ...(contract.singleBillingConfig || {}),
        calculatedBillingMonths: Array.isArray(
          contract.singleBillingConfig?.calculatedBillingMonths
        )
          ? contract.singleBillingConfig.calculatedBillingMonths
          : [],
        selectedManualMonths: Array.isArray(
          contract.singleBillingConfig?.selectedManualMonths
        )
          ? contract.singleBillingConfig.selectedManualMonths
          : [],
      };

      const initialMultiBillingConfig = Array.isArray(
        contract.multiBillingConfig
      )
        ? contract.multiBillingConfig.map((config) => ({
            ...initialState.multiBillingConfig[0],
            ...config,
            serviceCardNumber: config.serviceCardNumber
              ? String(config.serviceCardNumber)
              : "",
            calculatedBillingMonths: Array.isArray(
              config.calculatedBillingMonths
            )
              ? config.calculatedBillingMonths
              : [],
            selectedManualMonths: Array.isArray(config.selectedManualMonths)
              ? config.selectedManualMonths
              : [],
          }))
        : initialState.multiBillingConfig;

      return {
        ...state,
        loading: false,
        singleContract: contract,
        contract: action.payload.id,
        billToAddress: contract.billToAddress || initialState.billToAddress,
        billToContact1: contract.billToContact1 || initialState.billToContact1,
        billToContact2: contract.billToContact2 || initialState.billToContact2,
        billToContact3: contract.billToContact3 || initialState.billToContact3,
        shipToAddress: contract.shipToAddress || initialState.shipToAddress,
        shipToContact1: contract.shipToContact1 || initialState.shipToContact1,
        shipToContact2: contract.shipToContact2 || initialState.shipToContact2,
        shipToContact3: contract.shipToContact3 || initialState.shipToContact3,
        preferred: contract.preferred || initialState.preferred,
        sales: contract.sales || initialState.sales,
        company: contract.company || initialState.company,
        branch: contract.branch || initialState.branch,
        contractCode: contract.contractCode || initialState.contractCode,
        specialInstruction: Array.isArray(contract.specialInstruction)
          ? contract.specialInstruction.join(", ")
          : contract.specialInstruction || "",
        startDate: contract.startDate
          ? contract.startDate.slice(0, 10)
          : initialState.startDate,
        billingType: initialBillingType,
        singleBillingConfig: initialSingleBillingConfig,
        multiBillingConfig: initialMultiBillingConfig,
      };
    }
    case FETCH_CARD: {
      return {
        ...state,
        loading: false,
        card: action.payload,
      };
    }
    case FETCH_USERS: {
      return {
        ...state,
        loading: false,
        users: action.payload,
      };
    }
    case DELETE_USER: {
      return {
        ...state,
        loading: false,
        alertText: action.payload,
        alertType: "danger",
        showAlert: true,
        del: true,
      };
    }
    case HANDLE_CHANGE: {
      const { name, value, id, index, startDate, endDate } = action.payload;

      if (name === "billingType") {
        return {
          ...state,
          billingType: value,
          singleBillingConfig: { ...initialState.singleBillingConfig },
          multiBillingConfig: initialState.multiBillingConfig,
        };
      }

      if (id === "singleBillingConfig") {
        return {
          ...state,
          singleBillingConfig: value,
        };
      }

      if (id === "multiBillingConfig" && typeof index === "number") {
        // --- ADD THIS LINE ---
        console.log("4. Reducer: Matched multiBillingConfig logic.");

        const newMultiBillingConfig = [...state.multiBillingConfig];
        const currentEntry = newMultiBillingConfig[index];

        if (currentEntry) {
          const updatedEntry = {
            ...currentEntry,
            [name]: value,
          };

          if (name === "frequencyType") {
            // --- ADD THESE LINES ---
            console.log("5. Reducer: Recalculating months with:", {
              startDate,
              endDate,
              newFrequency: value,
            });
            const calculated = calculateBillingMonths(
              new Date(startDate),
              value,
              endDate
            );
            console.log("6. Reducer: Calculation result is:", calculated);
            // --- END OF ADDED LINES ---

            if (value && value !== "Manual" && value !== "Bill After Job") {
              updatedEntry.calculatedBillingMonths = calculated;
              updatedEntry.selectedManualMonths = [];
            } else {
              updatedEntry.calculatedBillingMonths = [];
            }
          }

          newMultiBillingConfig[index] = updatedEntry;
        }

        return {
          ...state,
          multiBillingConfig: newMultiBillingConfig,
        };
      }

      if (name?.includes("-")) {
        const [parent, child] = name.split("-");
        const newValue = {
          ...state[parent],
          [child]: value,
        };
        return {
          ...state,
          [parent]: newValue,
        };
      }

      return { ...state, [name]: value };
    }
    case SAME_DETAILS: {
      return {
        ...state,
        loading: false,
        shipToAddress: state.billToAddress,
        shipToContact1: state.billToContact1,
        shipToContact2: state.billToContact2,
        shipToContact3: state.billToContact3,
      };
    }
    case CREATE_CONTRACT: {
      return {
        ...state,
        loading: false,
        contractCreated: true,
        contract: action.payload.contractId,
        alertText: "Contract Created Successfully",
        alertType: "success",
        showAlert: true,
      };
    }
    case CONTRACT_FAIL: {
      return {
        ...state,
        loading: false,
        alertText: action.payload.msg,
        alertType: "danger",
        showAlert: true,
      };
    }
    case DELETE_CONTRACT: {
      return {
        ...state,
        loading: false,
        contract: 1,
        alertText: "Contract has been deleted",
        alertType: "danger",
        showAlert: true,
        del: true,
      };
    }

    case DELETE_SERVICE: {
      return {
        ...state,
        loading: false,
        alertText: action.payload.msg,
        alertType: "danger",
        showAlert: true,
        del: true,
      };
    }

    case EDIT_SERVICE: {
      return {
        ...state,
        loading: false,
        treatmentLocation: action.payload.treatmentLocation,
        frequency: action.payload.frequency,
        business: action.payload.business,
        edit: true,
        area: action.payload.area.split(" ")[0],
        cardId: action.payload._id,
      };
    }
    case CREATE_CARD: {
      return {
        ...state,
        loading: false,
        contractCreated: false,
        alertText: "Card has been saved",
        alertType: "success",
        showAlert: true,
        ratrid: "No",
        edit: false,
        cardId: "",
      };
    }
    case CARD_FAIL: {
      return {
        ...state,
        loading: false,
        alertText: "Ratrid cannot be added with other services ",
        alertType: "danger",
        showAlert: true,
      };
    }
    case CREATE_CARDS: {
      return {
        ...state,
        loading: false,
        alertText: action.payload,
        alertType: "success",
        showAlert: true,
      };
    }

    case RENEW_CONTRACT: {
      return {
        ...state,
        renew: true,
      };
    }

    case COPY_CONTRACT: {
      const singleContract = state.singleContract;
      return {
        ...state,
        loading: false,
        contractNo: singleContract.contractNo,
        type: singleContract.type,
        sales: singleContract.sales,
        startDate: singleContract.startDate.slice(0, 10),
        business: singleContract.business,
        preferred: {
          day: singleContract.preferred?.day || "",
          time: singleContract.preferred?.time || "10 am - 12 pm",
        },
        branch: singleContract.branch,
        contractCode: singleContract.contractCode,
        area: singleContract.area,
        billingType: singleContract.billingType || initialState.billingType,
        singleBillingConfig: {
          ...initialState.singleBillingConfig,
          ...(singleContract.singleBillingConfig || {}),
          calculatedBillingMonths: Array.isArray(
            singleContract.singleBillingConfig?.calculatedBillingMonths
          )
            ? [...singleContract.singleBillingConfig.calculatedBillingMonths]
            : [],
          selectedManualMonths: Array.isArray(
            singleContract.singleBillingConfig?.selectedManualMonths
          )
            ? [...singleContract.singleBillingConfig.selectedManualMonths]
            : [],
        },
        multiBillingConfig: Array.isArray(singleContract.multiBillingConfig)
          ? singleContract.multiBillingConfig.map((config) => ({
              ...initialState.multiBillingConfig[0],
              ...config,
              serviceCardNumber: config.serviceCardNumber
                ? String(config.serviceCardNumber)
                : "",
              calculatedBillingMonths: Array.isArray(
                config.calculatedBillingMonths
              )
                ? [...config.calculatedBillingMonths]
                : [],
              selectedManualMonths: Array.isArray(config.selectedManualMonths)
                ? [...config.selectedManualMonths]
                : [],
            }))
          : initialState.multiBillingConfig,

        specialInstruction: Array.isArray(singleContract.specialInstruction)
          ? singleContract.specialInstruction.join(", ")
          : singleContract.specialInstruction || "",

        billToAddress: { ...singleContract.billToAddress },
        billToContact1: { ...singleContract.billToContact1 },
        billToContact2: { ...singleContract.billToContact2 },
        billToContact3: { ...singleContract.billToContact3 },
        shipToAddress: { ...singleContract.shipToAddress },
        shipToContact1: { ...singleContract.shipToContact1 },
        shipToContact2: { ...singleContract.shipToContact2 },
        shipToContact3: { ...singleContract.shipToContact3 },
      };
    }

    case CLEAR_VALUES: {
      return {
        ...state,
        loading: false,
        frequency: "Daily",
        service: [],
        comments: "All job done",
        type: "NC",
        completion: "Completed",
        image: [],
        contractNo: "",
        sales: "",
        business: "1 RK",
        area: "",
        endContract: "1 Year",
        specialInstruction: "",
        renew: false,
        billToAddress: { ...initialState.billToAddress },
        shipToAddress: { ...initialState.shipToAddress },
        billToContact1: { ...initialState.billToContact1 },
        billToContact2: { ...initialState.billToContact2 },
        billToContact3: { ...initialState.billToContact3 },
        shipToContact1: { ...initialState.shipToContact1 },
        shipToContact2: { ...initialState.shipToContact2 },
        shipToContact3: { ...initialState.shipToContact3 },
        startDate: new Date().toISOString().slice(0, 10),
        preferred: { ...initialState.preferred },
        contractCreated: false,
        search: "",
        searchSD: "",
        searchED: "",
        del: false,
        branch: "MUM - 1",
        contractCode: "",
        billingType: initialState.billingType,
        singleBillingConfig: { ...initialState.singleBillingConfig },
        multiBillingConfig: initialState.multiBillingConfig,
      };
    }
    case UPDATE_CONTRACT: {
      return {
        ...state,
        loading: false,
        alertText: "Contract has been updated",
        alertType: "success",
        showAlert: true,
      };
    }
    case IMAGE_UPLOADED: {
      return {
        ...state,
        loading: false,
        image: action.payload,
      };
    }
    case UPDATE_CARD: {
      return {
        ...state,
        loading: false,
        alertText: "Email Has Been Sent",
        alertType: "success",
        showAlert: true,
      };
    }
    case UPDATE_CARD_FAIL: {
      return {
        ...state,
        loading: false,
        alertText: "Input Updated. Email Not Sent",
        alertType: "success",
        showAlert: true,
      };
    }

    case SERVICE_REPORT: {
      return {
        ...state,
        loading: false,
        serviceReport: action.payload,
        modal: true,
      };
    }

    case CLOSE_MODAL: {
      return {
        ...state,
        loading: false,
        modal: false,
        serviceReport: "",
      };
    }

    case ALL_VALUES: {
      return {
        ...state,
        loading: false,
        adminList: action.payload,
      };
    }
    case TOGGLE_CODE: {
      return {
        ...state,
        adminList: state.adminList.map((item) =>
          item._id === action.payload.id ? action.payload.data : item
        ),
      };
    }

    case ADD_VALUE: {
      return {
        ...state,
        loading: false,
        addComment: "",
        addSale: "",
        addBusines: "",
        addCode: "",
        serviceChemicals: {
          label: "",
          value: "",
          chemical: "",
        },
        alertText: action.payload.msg,
        alertType: "success",
        showAlert: true,
        adminList: [...state.adminList, action.payload.data],
      };
    }
    case JOB_STATS: {
      return {
        ...state,
        loading: false,
        jobStats: action.payload.allJobs,
        serviceStats: action.payload.allService,
        businessCount: action.payload.allBusinessCount,
      };
    }

    case DOCUMENTS_UPLOAD: {
      return {
        ...state,
        loading: false,
        alertText: "Document has been uploaded",
        alertType: "success",
        showAlert: true,
      };
    }

    case DOCUMENTS_DELETE: {
      return {
        ...state,
        loading: false,
        alertText: action.payload.msg,
        alertType: "danger",
        showAlert: true,
      };
    }

    case JOB_NOT_FILE: {
      return {
        ...state,
        loading: false,
        serviceReport: action.payload.link,
        modal: true,
        searchSD: "",
        searchED: "",
      };
    }
    case ADD_EMAILS: {
      const { emails } = action.payload;

      return {
        ...state,
        feedbackEmails: state.feedbackEmails.concat(emails),
      };
    }

    case REMOVE_EMAILS: {
      return {
        ...state,
        feedbackEmails: state.feedbackEmails.filter(
          (item) => item.email !== action.payload.email
        ),
      };
    }

    case SCHEDULE_MAIL: {
      return {
        ...state,
        loading: false,
        alertText: "Email has been schedule for tomorrow at 8am",
        alertType: "success",
        showAlert: true,
        feedbackEmails: [],
      };
    }

    case FEEDBACK_STATS: {
      return {
        ...state,
        loading: false,
        allRatings: action.payload.result1,
        pestRatings: action.payload.result,
        feedbackFile: action.payload.link,
      };
    }

    case SUBMIT_FEEDBACK: {
      return {
        ...state,
        feedbackSubmitted: true,
      };
    }

    case SERVICE_INTIMATION: {
      return {
        ...state,
        loading: false,
        alertText: "Email Has Been Sent",
        alertType: "success",
        showAlert: true,
      };
    }

    case SERVICE_INTIMATION_FAIL: {
      return {
        ...state,
        loading: false,
        alertText: "Please try today/tomorrow after 4pm",
        alertType: "danger",
        showAlert: true,
      };
    }

    case BRANCH_REPORT: {
      return {
        ...state,
        loading: false,
        alertText: "Report Generated",
        alertType: "success",
        showAlert: true,
      };
    }

    case BRANCH_REPORT_FAIL: {
      return {
        ...state,
        loading: false,
        alertText: action.payload.msg,
        alertType: "danger",
        showAlert: true,
      };
    }
    case ADD_MULTI_BILLING_ENTRY: {
      return {
        ...state,
        multiBillingConfig: [
          ...state.multiBillingConfig,
          {
            serviceCardNumber: "",
            frequencyType: "",
            calculatedBillingMonths: [],
            manualDescription: "",
            selectedManualMonths: [],
          },
        ],
      };
    }

    case UPDATE_MULTI_BILLING_ENTRY: {
      const { index, field, value } = action.payload;
      const newMultiBillingConfig = [...state.multiBillingConfig];
      if (newMultiBillingConfig[index]) {
        newMultiBillingConfig[index] = {
          ...newMultiBillingConfig[index],
          [field]: value,
        };
      }
      return {
        ...state,
        multiBillingConfig: newMultiBillingConfig,
      };
    }

    case REMOVE_MULTI_BILLING_ENTRY: {
      const { index } = action.payload;
      const newMultiBillingConfig = state.multiBillingConfig.filter(
        (_, i) => i !== index
      );
      return {
        ...state,
        multiBillingConfig: newMultiBillingConfig,
      };
    }

    default:
      throw new Error(`No Matching "${action.type}" - action type`);
  }
};

export default data_reducer;
