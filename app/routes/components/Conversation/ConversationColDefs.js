import i18next from "i18next";
import { convertDate2String, timeComparator } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const ConversationColDefs = [
    {
        headerName: i18next.t("User"),
        field: "userName"
    },
    {
        headerName: i18next.t("Role"),
        field: "userRole"
    },
    {
        headerName: i18next.t("Date"),
        field: "dateTime",
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
        sort: "desc"
    },
    {
        headerName: i18next.t("Comment"),
        field: "comment",
        minWidth: 400,
        tooltipField: "comment",
        tooltipComponentParams: {
            fieldTooltip: "comment",
            isShow: true
        }
    }
];

export default ConversationColDefs;
