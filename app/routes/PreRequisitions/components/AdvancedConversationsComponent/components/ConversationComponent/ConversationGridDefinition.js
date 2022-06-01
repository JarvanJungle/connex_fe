import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { formatDateTime } from "helper/utilities";
import i18next from "i18next";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

/**
 * @data ConversationDto
 * @structure
 * {
    "userName": string,
    "userUuid": string,
    "role": string,
    "comment": string,
    "submitOn": string (ISO 8601)
    }
    @example
    {
        "userName": "John Doe",
        "userUuid": "444",
        "role": "PR_APPROVER",
        "comment": "I need more information to approved",
        "submitOn": "2021-05-27T02:36:56.985882"
    }
 */
const columnDefs = [
    {
        headerName: i18next.t("User"),
        field: "user"
    },
    {
        headerName: i18next.t("Role"),
        field: "role"
    },
    {
        headerName: i18next.t("Date"),
        field: "submitOn",
        valueFormatter: (param) => formatDateTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("Comment"),
        field: "comment"
    }
];

export {
    defaultColDef,
    columnDefs
};
