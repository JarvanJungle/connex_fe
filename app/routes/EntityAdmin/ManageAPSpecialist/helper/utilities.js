import { formatDisplayDecimal, convertToLocalTime } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const formatNumber = (params, formatDefault = "0.00") => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return formatDefault;
};

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

const formatStyleNumber = () => ({
    textAlign: "right"
});

export {
    formatNumber,
    formatDate,
    formatStyleNumber,
    formatDateTime
};
