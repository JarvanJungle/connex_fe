import { convertToLocalTime } from "helper/utilities";
import i18next from "i18next";

const POListColDefs = [
    {
        headerName: i18next.t("PurchaseOrderNo"),
        field: "poNumber",
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: (params) => {
            const { data } = params;
            const { allowSelect } = data;
            return allowSelect;
        },
        pinned: "left",
        width: 220
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        valueFormatter: (params) => params?.data?.status?.replaceAll("_", " "),
        valueGetter: (params) => params?.data?.status?.replaceAll("_", " "),
        width: 180
    },
    {
        headerName: i18next.t("SupplierName"),
        field: "supplierName"
    },
    {
        headerName: i18next.t("Type"),
        field: "type",
        width: 140,
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.toUpperCase();
            return value;
        }
    },
    {
        headerName: i18next.t("Requester"),
        field: "requester",
        width: 140
    },
    {
        headerName: i18next.t("ApprovalRoute"),
        field: "approvalRoute",
        width: 160
    },
    {
        headerName: i18next.t("ApprovalSequence"),
        field: "approvalSequence"
    },
    {
        headerName: i18next.t("IssuedDate"),
        field: "issuedDate",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertToLocalTime(value);
            return "";
        },
        sort: "desc"
    },
    {
        headerName: i18next.t("UpdatedOn"),
        field: "updatedOn",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertToLocalTime(value);
            return "";
        }
    }
];

export default POListColDefs;
