import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { convertDate2String, timeComparator } from "helper/utilities";
import i18next from "i18next";

const NegotiationColDefs = [
    {
        headerName: i18next.t("User"),
        field: "uploadedBy",
        suppressSizeToFit: false,
        minWidth: 150
    },
    {
        headerName: i18next.t("Role"),
        field: "uploaderRole",
        suppressSizeToFit: false,
        valueFormatter: ({ data }) => data.role || data.userRole,
        minWidth: 150
    },
    {
        headerName: i18next.t("Date"),
        field: "uploadedOn",
        suppressSizeToFit: false,
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                if (typeof value === "string") return value;
                if (value instanceof Date) {
                    return convertDate2String(
                        value,
                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                    );
                }
            }
            return "";
        },
        comparator: timeComparator,
        sort: "desc",
        minWidth: 150
    },
    {
        headerName: i18next.t("Comment"),
        field: "comment",
        suppressSizeToFit: false,
        tooltipField: "comment",
        tooltipComponentParams: {
            fieldTooltip: "comment",
            isShow: true
        },
        minWidth: 250
    },
    {
        headerName: i18next.t("Attachment"),
        field: "fileLabel",
        cellRenderer: "attachment",
        suppressSizeToFit: false,
        minWidth: 250
    }
];

export default NegotiationColDefs;
