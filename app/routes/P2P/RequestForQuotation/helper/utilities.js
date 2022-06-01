import { formatDisplayDecimal, convertToLocalTime } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import RFQ_CONSTANTS from "./constant";

const formatDate = (params) => {
    const { value } = params;
    if (value) return convertToLocalTime(value, CUSTOM_CONSTANTS.DDMMYYYY);
    return "";
};

const formatDateTime = (params) => {
    const { value } = params;
    if (value) return convertToLocalTime(value, CUSTOM_CONSTANTS.DDMMYYYHHmmss);
    return "";
};

const formatNumber = (params, formatDefault = "0.00") => {
    if (params?.node?.rowPinned === "bottom") {
        return "";
    }
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return formatDefault;
};

const formatStyleNumber = () => ({
    textAlign: "right"
});

const convertActionAuditTrail = (action) => {
    switch (action) {
    case RFQ_CONSTANTS.CLOSE:
        return "Closed RFQ";
    case RFQ_CONSTANTS.SUBMIT:
        return "Submitted RFQ";
    case RFQ_CONSTANTS.SAVE_AS_DRAFT:
        return "Saved RFQ As Draft";
    case RFQ_CONSTANTS.EDIT:
        return "Updated RFQ";
    case RFQ_CONSTANTS.CANCEL:
        return "Canceled RFQ";
    case RFQ_CONSTANTS.EDIT_QUOTATION:
        return "Updated Quotation";
    case RFQ_CONSTANTS.SUBMIT_QUOTATION:
        return "Submitted Quotation";
    case RFQ_CONSTANTS.APPROVED:
        return "Approved RFQ";
    case RFQ_CONSTANTS.SHORTLIST:
        return "Shortlisted RFQ";
    case RFQ_CONSTANTS.RECALL:
        return "Recalled RFQ";
    case RFQ_CONSTANTS.SEND_BACK:
        return "Sent Back RFQ";
    case RFQ_CONSTANTS.CONVERTED_TO_PO:
        return "Converted to PO";
    case RFQ_CONSTANTS.CONVERTED_TO_CONTRACT:
        return "Converted to Contract";
    default:
        return action;
    }
};

export {
    formatDate,
    formatDateTime,
    formatNumber,
    formatStyleNumber,
    convertActionAuditTrail
};
