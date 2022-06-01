import i18next from "i18next";
import { formatDisplayDecimal, convertToLocalTime } from "helper/utilities";

const ContractListSupplierDefs = [
    {
        headerName: i18next.t("Buyer"),
        field: "createdByName"
    },
    {
        headerName: i18next.t("Contract No."),
        field: "contractNumber"
    },
    {
        headerName: i18next.t("Contract Title"),
        field: "contractTitle",
        tooltipField: "contractTitle",
        tooltipComponentParams: {
            fieldTooltip: "contractTitle"
        }
    },
    {
        headerName: i18next.t("Status"),
        field: "contractStatus",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.toUpperCase();
            return "";
        }
    },
    {
        headerName: i18next.t("Project Title"),
        field: "projectName",
        tooltipField: "projectName",
        tooltipComponentParams: {
            fieldTooltip: "projectName"
        }
    },
    {
        headerName: i18next.t("Total Amount"),
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
        headerName: i18next.t("Total Used"),
        field: "totalUsed",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return formatDisplayDecimal(Number(value), 2);
            return "0.00";
        }
    },
    {
        headerName: i18next.t("Approval Route"),
        field: "approvalRouteName",
        filter: true,
        floatingFilter: true
    },
    {
        headerName: i18next.t("Approval Sequence"),
        field: "approvalRouteSequence"
    },
    {
        headerName: i18next.t("Next Approver"),
        field: "nextApprover"
    },
    {
        headerName: i18next.t("Created By"),
        field: "createdByName"
    },
    {
        headerName: i18next.t("Created Date"),
        field: "createdDate",
        valueFormatter: (param) => convertToLocalTime(param.value)
    },
    {
        headerName: i18next.t("Updated Date"),
        field: "updatedDate",
        valueFormatter: (param) => convertToLocalTime(param.value)
    },
    {
        headerName: i18next.t("Approved Date"),
        field: "approvedDate",
        valueFormatter: (param) => convertToLocalTime(param.value)
    },
    {
        headerName: i18next.t("Acknowledged Date"),
        field: "acknowledgeDate",
        valueFormatter: (param) => convertToLocalTime(param.value)
    },
    {
        headerName: i18next.t("Connected Vendor"),
        field: "connectedVendor"
    },
    {
        headerName: i18next.t("Acknowledged Offline"),
        field: "acknowledgeOffline",
        valueFormatter: (param) => (param.value ? "Yes" : "No")
    },
    {
        headerName: i18next.t("Issue By"),
        field: "issuedBy"
    },
    {
        headerName: i18next.t("Issue Date"),
        field: "issuedDate",
        valueFormatter: (param) => convertToLocalTime(param.value)
    },
];

export default ContractListSupplierDefs;
