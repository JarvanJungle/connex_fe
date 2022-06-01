import i18next from "i18next";
import { convertToLocalTime } from "helper/utilities";

const RolesListColDefs = [
    {
        headerName: i18next.t(""),
        field: "selected",
        cellRenderer: "checkboxRenderer",
        filter: false,
        suppressSizeToFit: true,
        width: 100,
        cellStyle: (params) => {
            const style = {
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            };
            if (params?.data?.disabled) {
                return {
                    ...style,
                    "pointer-events": "none",
                    opacity: "0.6"
                };
            }
            return style;
        }
    },
    {
        headerName: i18next.t("Role"),
        field: "name",
        cellRenderer: "agGroupCellRenderer"
    },
    {
        headerName: i18next.t("Status"),
        field: "status"
    },
    {
        headerName: i18next.t("CreatedOn"),
        field: "createdAt",
        valueFormatter: (params) => convertToLocalTime(params?.data?.createdAt),
        sort: "desc"
    }
];

export default RolesListColDefs;
