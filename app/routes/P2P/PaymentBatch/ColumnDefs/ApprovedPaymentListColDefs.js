import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};

const approvedPaymentListColDefs = (write) => [
    {
        headerName: i18next.t("PaymentNo"),
        field: "paymentNumber",
        minWidth: 220,
        pinned: "left",
        checkboxSelection: (params) => {
            if (write) {
                const { data } = params;
                const { allowSelected } = data;
                return !!allowSelected;
            }
            return write;
        }
    },
    {
        headerName: i18next.t("ApprovalStatus"),
        field: "status",
        valueFormatter: (param) => (param.value ? param.value.replaceAll("_", " ") : "")
    },
    {
        headerName: i18next.t("Beneficiary"),
        field: "beneficiary",
        valueFormatter: (params) => {
            const { data } = params;
            if (data) {
                const { beneficiary } = data;
                const { companyName, supplierCode } = beneficiary;
                return `${supplierCode} (${companyName})`;
            }
            return "";
        }
    },
    {
        headerName: i18next.t("EarliestSystemDueDate"),
        field: "earliestSystemDueDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    },
    {
        headerName: i18next.t("PaymentReferenceNo"),
        field: "refNumber",
        tooltipField: "refNumber",
        tooltipComponentParams: {
            fieldTooltip: "refNumber",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode"
    },
    {
        headerName: i18next.t("TotalAmountToPayInclTax"),
        field: "paymentAmount",
        cellStyle: { textAlign: "right" },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("CreatedBy"),
        field: "createdByName"
    },
    {
        headerName: i18next.t("CreationDate"),
        field: "paymentCreationDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss),
        sort: "desc"
    }
];

export default approvedPaymentListColDefs;
