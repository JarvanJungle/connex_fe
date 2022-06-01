import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { DO_FE_STATUS, DO_STATUS } from "../doConfig";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};

const DeliveryOrderListColDefs = [
    {
        headerName: i18next.t("DeliveryOrderNo"),
        field: "deliveryOrderNumber",
        minWidth: 220
    },
    {
        headerName: i18next.t("DeliveryOrderStatus"),
        field: "status",
        valueGetter: (params) => {
            switch (params.data.status) {
            case DO_STATUS.PENDING_ISSUE:
            {
                return DO_FE_STATUS.PENDING_ISSUE;
            }
            case DO_STATUS.PENDING_RECEIPT:
            {
                return DO_FE_STATUS.PENDING_RECEIPT;
            }
            case DO_STATUS.DELIVERED:
            {
                return DO_FE_STATUS.DELIVERED;
            }
            case DO_STATUS.PARTIALLY_DELIVERED:
            {
                return DO_FE_STATUS.PARTIALLY_DELIVERED;
            }
            default: return params.data.status;
            }
        },
        minWidth: 220
    },
    {
        headerName: i18next.t("PurchaseOrderNo"),
        field: "poList",
        width: 150
    },
    {
        headerName: i18next.t("Qty Converted"),
        field: "qtyConverted",
        cellStyle: { textAlign: "right" },
        width: 150
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("Qty Rejected"),
        field: "qtyRejected",
        cellStyle: { textAlign: "right" },
        width: 150
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("Qty Received"),
        field: "qtyReceived",
        cellStyle: { textAlign: "right" },
        width: 150
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("BuyerName"),
        field: "buyerCompanyName",
        valueFormatter: ({ value }) => value.toUpperCase()
    },
    {
        headerName: i18next.t("DeliveryDate"),
        field: "deliveryDate",
        width: 150,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("ContactPerson"),
        field: "buyerContactName",
        width: 200
    },
    {
        headerName: i18next.t("ContactNumber"),
        valueGetter: ({ data }) => `${data.buyerCountryCode ? `+${data.buyerCountryCode} ` : ""}${data.buyerContactNumber || ""}`,
        width: 200
    },
    {
        headerName: i18next.t("CreatedDate"),
        field: "createdDate",
        valueFormatter: (param) => convertToLocalTime(param.value),
        sort: "desc"
    },
    {
        headerName: i18next.t("IssuedDate"),
        field: "issuedDate",
        valueFormatter: (param) => convertToLocalTime(param.value)
    }
];

export default DeliveryOrderListColDefs;
