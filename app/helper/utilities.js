import React from "react";
import {
    Media,
    Button
} from "components";
import moment from "moment";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import i18next from "i18next";
import { debounce as _debounce } from "lodash";
import CUSTOM_CONSTANTS from "./constantsDefined";

export const notification = (title, text, type = "success") => {
    const swal = Swal.mixin({
        title,
        text,
        confirmButtonColor: type === "success" ? "#AEC57D" : "#DE3535",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "swal-btn--confirm",
            title: "swal-title",
            htmlContainer: "swal-html-container"
        },
        buttonsStyling: true
    });

    return swal.fire({});
};

const allAvatars = ((ctx) => {
    const keys = ctx.keys();
    return keys.map(ctx);
})(require.context("../images/avatars", true, /.*/));

export function randomArray(arr) {
    const index = Math.round(Math.random() * (arr.length - 1));
    return arr[index];
}

export function randomAvatar() {
    return randomArray(allAvatars);
}

export const contentError = ({ closeToast, message }) => (
    <Media>
        <Media middle left className="mr-3">
            <i className="fa fa-fw fa-2x fa-close" />
        </Media>
        <Media body>
            <Media heading tag="h6">
                Error!
            </Media>
            <p>
                {message}
            </p>
            <div className="d-flex mt-2">
                <Button color="danger" onClick={() => { closeToast; }}>
                    OK
                </Button>
            </div>
        </Media>
    </Media>
);

export const contentInfo = ({ message }) => (
    <Media>
        <Media middle left className="mr-3">
            <i className="fa fa-fw fa-2x fa-check" />
        </Media>
        <Media body>
            <Media heading tag="h6">
                Success!
            </Media>
            <p>
                {message}
            </p>
            <div className="d-flex mt-2">
                <Button color="success">
                    I Understand
                </Button>
                <Button color="link" className="ml-2 text-success">
                    Cancel
                </Button>
            </div>
        </Media>
    </Media>
);

export const convertDate2String = (date, format) => (
    date ? moment(date).local()
        .format(format || CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
        .toString()
        : null
);

export const formatDateString = (dateString, format) => (
    dateString ? moment(new Date(dateString))
        .format(format || CUSTOM_CONSTANTS.DDMMYYYHHmmss) : null
);

export const formatDateTime = (dateValue, format) => {
    if (dateValue) {
        const arr = dateValue.split("/");
        arr.reverse();
        const date = arr.join("-");
        const dateMoment = moment(date);
        return dateMoment.format(format);
    }

    return null;
};

export const formatDateTimeUpdated = (dateValue, format) => {
    if (dateValue) {
        const timeZone = (new Date()).getTimezoneOffset() / (-60);
        const arr = dateValue.split(" ");
        const arrNumber = arr[0].split("/");
        arrNumber.reverse();
        const date = `${arrNumber.join("-")} ${arr[1]}`;
        const dateMoment = new Date(date);
        dateMoment.setHours(dateMoment.getHours() + timeZone);
        return moment(dateMoment).format(format);
    }
    return "";
};

export const setToLS = (key, value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
};

export const getFromLS = (key) => {
    const value = window.localStorage.getItem(key);

    if (value) {
        return JSON.parse(value);
    }
};

export const stringCompareIgnoreCase = (string1, string2) => {
    string1 = string1.replace(/ +(?= )/g, "");
    string2 = string2.replace(/ +(?= )/g, "");
    return string1.toLowerCase() === string2.toLowerCase();
};

export const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    sortable: true
};

export const defaultColDefNoResize = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    sortable: true
};

/**
 *
 * @param {*} value
 * @returns boolean
 * @description check if the value is null or undefined
 */
export const isNullOrUndefined = (value) => {
    if (value === null || value === undefined) {
        return true;
    }
    return false;
};

/**
 *
 * @param {*} value
 * @returns boolean
 * @description check if the value is null
 * or undefined or empty (as string == "", as array length == 0)
 */
export const isNullOrUndefinedOrEmpty = (value) => {
    if (
        isNullOrUndefined(value)
        || (!isNullOrUndefined(value.length) && value.length === 0)
        || value === ""
    ) {
        return true;
    }
    return false;
};

export const clearNumber = (value) => (value ? value.toString().replace(/,/g, "") : value);

export function formatCurrenciesForDropbox(arrCurrencies) {
    const newCurrencies = [];
    for (let i = 0; i < arrCurrencies.length; i++) {
        newCurrencies.push({ ...arrCurrencies[i], currencyLabel: `${arrCurrencies[i].currencyName} (${arrCurrencies[i].currencyCode})` });
    }
    return newCurrencies;
}

export function formatDisplayDecimal(num, decimals, currency = "") {
    if (num === 0 || num === "0") return `${currency} 0.00`;
    if (!num || Number.isNaN(clearNumber(num))) return "";
    return (currency !== "" ? `${currency} ` : currency) + Number(clearNumber(num)).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

export const formatNumberForRow = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

export const formatNumberPercentForRow = (params) => {
    const { value } = params;
    if (value) return `${formatDisplayDecimal(Number(value), 2)} %`;
    return "0.00 %";
};

export const formatBudget = (number) => Number(number).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export function dateTimeComparator(valueA, valueB, nodeA, nodeB, isInverted) {
    const nodeAValue = moment(nodeA.data.createdOn).valueOf();
    const nodeBValue = moment(nodeB.data.createdOn).valueOf();
    return (nodeAValue > nodeBValue) ? 1 : -1;
}

export function timeComparator(valueA, valueB) {
    const dateMomentObjectA = moment(valueA, "DD/MM/YYYY HH:mm:ss");
    const dateMomentObjectB = moment(valueB, "DD/MM/YYYY HH:mm:ss");
    const dateObjectA = dateMomentObjectA.toDate();
    const dateObjectB = dateMomentObjectB.toDate();
    const timeDiff = dateObjectA.getTime() > dateObjectB.getTime();
    if (timeDiff > 0) return 1;
    if (timeDiff < 0) return -1;
    return 0;
}

export function toFixedWithoutRounded(num, fixed) {
    const re = new RegExp(`^-?\\d+(?:\.\\d{0,${fixed || -1}})?`);
    return num.toString().match(re)[0];
}
/**
 * @return string format YYYY-MM-DD
 */
export const formatDateStringSlashDDMMYYYY = (value) => {
    if (!isNullOrUndefined(value)) {
        const regex = /[0-9]+/g;
        const splitDate = value.match(regex);
        return `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
    }
    return null;
};

/**
 * @param {Date} date The date
 * @param {string | null} type The string
 * @returns {string} string format local date
 */
export const convertToLocalTime = (date, format = null, type = null) => {
    if (!date) return "";
    if (type === "pdf") {
        return `${moment.utc(date).local().format(format || CUSTOM_CONSTANTS.DDMMYYYHHmmss).toString()} ${CUSTOM_CONSTANTS.CURRENCY}`;
    }
    return moment.utc(date).local()
        .format(format || CUSTOM_CONSTANTS.DDMMYYYHHmmss)
        .toString();
};

/**
 * @param {array} array original
 * @param {string | null} name The attributes name in object
 * @returns {array} sort from A to Z
 */
export const sortArrayByName = (array, name, orderString = true) => array.sort((a, b) => {
    const nameA = orderString ? a[name].toString().toUpperCase() : a[name];
    const nameB = orderString ? b[name].toString().toUpperCase() : b[name];
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    // names must be equal
    return 0;
});

export const sortArrayByNameFloat = (array, name, orderString = true) => array.sort((a, b) => {
    let nameA = orderString ? a[name].toString().toUpperCase() : a[name];
    let nameB = orderString ? b[name].toString().toUpperCase() : b[name];
    nameA = nameA.split(".");
    nameB = nameB.split(".");
    while (nameA.length) {
        const result = nameA.shift() - (nameB.shift() || 0);
        if (result) {
            return result;
        }
    }
    return -nameB.length;
});

export const sumArray = (array) => array?.reduce((prev, add) => Number(prev) + Number(add), 0) || 0;

export const getCurrentCompanyUUIDByStore = (permissionReducer) => permissionReducer
    ?.currentCompany?.companyUuid;

/**
 *
 * @param {number} number
 * @param {number} decimalPlaces Default to 2
 * @param {"up" | "down" | null} type Round up or round down or normal round
 * @returns number
 * @description Round number to specific decimal places
 */

export const parseNumber = (number, decimalPlaces = 15) => parseFloat(
    number.toPrecision(decimalPlaces)
);
export const roundNumberWithUpAndDown = (number, decimalPlaces = 2, type = null) => {
    // I don't have any idea for this variable name
    const temp = 10 ** decimalPlaces;
    const newNumber = parseFloat((Number(number) || 0).toPrecision(15));
    const result = {
        up: (Math.ceil(parseNumber((newNumber) * temp)) / temp),
        down: (Math.floor(parseNumber((newNumber) * temp)) / temp),
        normal: (Math.round(parseNumber((newNumber) * temp)) / temp)
    };
    return result[type] || result.normal;
};

export const multiplyRound = (a, b, dp = 2) => {
    let result = a * b;
    const factor = 10 ** dp;
    const scale = Number((Math.abs(result) * factor).toPrecision(15));
    result = ((Math.round(scale) / factor) * Math.sign(result)).toFixed(dp);
    return result;
};
export const plusRound = (a, b, dp = 2) => {
    let result = a + b;
    const factor = 10 ** dp;
    const scale = Number((Math.abs(result) * factor).toPrecision(15));
    result = ((Math.round(scale) / factor) * Math.sign(result)).toFixed(dp);
    return result;
};

export const countDecimals = (value) => {
    if (Math.floor(value) === value) return 0;
    return value.toString().split(".")[1]?.length || 0;
};

export const minusToPrecise = (a, b) => {
    let result = a - b;
    const dp = Math.max(countDecimals(a), countDecimals(b));
    const factor = 10 ** dp;
    const scale = Number((Math.abs(result) * factor).toPrecision(15));
    result = ((Math.round(scale) / factor) * Math.sign(result)).toFixed(dp);
    return result;
};

export const formatStyleNumber = {
    textAlign: "right"
};

export const agGridLinkRenderer = ({
    value, endPoint, uuidField, data, state
}) => (
    <>
        {
            !state
            && (
                <Link to={`${endPoint}?uuid=${data[uuidField]}`} style={{ textDecoration: "underline", color: "#4472C4" }}>
                    {value}
                </Link>
            )
        }
        {
            state
            && (
                <Link
                    to={{
                        pathname: endPoint,
                        search: `?uuid=${data[uuidField]}`,
                        state
                    }}
                    style={{ textDecoration: "underline", color: "#4472C4" }}
                >
                    {value}
                </Link>
            )
        }
    </>
);

export const numberParser = (params) => Number(params.newValue);
export const numberParserPercent = (params) => Number(params.newValue) * 100;

// validate row data attachment
export const itemAttachmentSchema = Yup.array()
    .of(
        Yup.object().shape({
            guid: Yup.string()
                .test(
                    "missing-attachment",
                    i18next.t("PleaseUploadYourAttachment"),
                    (guid) => !!guid
                )
        })
    );

// filter by multi conditions
export const filter = (array, condition) => {
    if (condition) {
        return array.filter(
            (item) => Object.keys(condition).every((key) => condition[key] === item[key])
        );
    }
    return array;
};

export const debounce = (func, timeout = 500) => (typeof func === "function" ? _debounce(func, timeout) : func);
