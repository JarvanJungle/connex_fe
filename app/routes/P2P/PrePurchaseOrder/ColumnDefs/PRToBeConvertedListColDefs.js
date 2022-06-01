import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";

const PRToBeConvertedListColDefs = [
    {
        headerName: i18next.t("PurchaseRequisitionNo"),
        field: "prNumber",
        minWidth: 220
    },
    {
        headerName: i18next.t("Requester"),
        field: "requestorName",
        maxWidth: 150
    },
    {
        headerName: i18next.t("PurchaseRequestTitle"),
        field: "prTitle",
        tooltipField: "prTitle",
        tooltipComponentParams: {
            fieldTooltip: "prTitle",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Status"),
        field: "prStatus",
        valueGetter: (params) => {
            const value = params.data.prStatus;
            if (value) return value.replaceAll("_", " ");
            return value;
        },
        minWidth: 300
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        maxWidth: 120
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return formatDisplayDecimal(Number(value), 2);
            return "0.00";
        },
        maxWidth: 150
    },
    {
        headerName: i18next.t("Type"),
        field: "procurementType",
        maxWidth: 120,
        valueFormatter: (params) => params?.value?.toUpperCase()
    },
    {
        headerName: i18next.t("ApprovedDate"),
        field: "approvedDate",
        maxWidth: 180,
        valueFormatter: (params) => convertToLocalTime(params?.value),
        sort: "desc"
    }
];

export default PRToBeConvertedListColDefs;
