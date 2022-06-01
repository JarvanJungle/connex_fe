import CUSTOM_CONSTANTS from "helper/constantsDefined";
import {
    convertToLocalTime,
    formatDateTime
} from "helper/utilities";
import i18next from "i18next";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

/**
 * @data auditTrailDtoList
 * @structure
 * {
    "userName": string,
    "role": string,
    "action": string,
    "date": string (ISO 8601)
   }
   @example
   {
    "userName": "John Smith",
    "role": "PPRCREATOR",
    "action": "SUBMITTED",
    "date": "2021-05-27T02:29:49.723706"
    }
 */
const columnDefs = [
    {
        headerName: i18next.t("User"),
        field: "userName"
    },
    {
        headerName: i18next.t("Role"),
        field: "role"
    },
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: (params) => {
            const { value } = params;
            return value.replaceAll("_", " ");
        }
    },
    {
        headerName: i18next.t("Date"),
        field: "date",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
    }
];

export {
    defaultColDef,
    columnDefs
};
