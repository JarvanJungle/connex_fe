import i18next from "i18next";
import { formatNumber, formatStyleNumber, formatDateTime } from "../helper/utilities";

const SelectItemDOColDefs = [
    {
        headerName: i18next.t("PONo"),
        field: "poNumber",
        checkboxSelection: (params) => {
            const { data } = params;
            const { allowSelected } = data;
            return !!allowSelected;
        }
    },
    {
        headerName: i18next.t("DONo"),
        field: "deliveryOrderNumber",
        tooltipField: "deliveryOrderNumber",
        tooltipComponentParams: {
            fieldTooltip: "deliveryOrderNumber",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode"
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.replaceAll("_", " ");
            return "";
        }
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode"
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber
    },
    {
        headerName: i18next.t("PendingInvoiceAmount"),
        field: "pendingInvoiceAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber
    },
    {
        headerName: i18next.t("IssuedDate"),
        field: "issuedDate",
        cellRenderer: formatDateTime,
        sort: "desc",
        hide: true
    }
];

export default SelectItemDOColDefs;
