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

const formatMonth = (params) => {
    const { value } = params;
    if (value) return convertToLocalTime(value, CUSTOM_CONSTANTS.YYYYMM);
    return "";
};

const formatStyleNumber = () => ({
    textAlign: "right"
});

const textCustomStatusComparator = (filter, value, filterText) => {
    const filterTextLowerCase = filterText.toLowerCase().replaceAll(" ", "_");
    const valueLowerCase = value.toString().toLowerCase();
    switch (filter) {
    case "contains":
        return valueLowerCase.indexOf(filterTextLowerCase) >= 0;
    case "notContains":
        return valueLowerCase.indexOf(filterTextLowerCase) === -1;
    case "equals":
        return valueLowerCase === filterTextLowerCase;
    case "notEqual":
        return valueLowerCase != filterTextLowerCase;
    case "startsWith":
        return valueLowerCase.indexOf(filterTextLowerCase) === 0;
    case "endsWith": {
        const index = valueLowerCase.lastIndexOf(filterTextLowerCase);
        const endNum = valueLowerCase.length - filterTextLowerCase.length;
        return index >= 0 && index === endNum;
    }
    default:
        // should never happen
        console.warn(`invalid filter type ${filter}`);
        return false;
    }
};

export {
    formatNumber,
    formatDate,
    formatStyleNumber,
    formatDateTime,
    formatMonth,
    textCustomStatusComparator
};
