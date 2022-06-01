import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { convertToLocalTime } from "helper/utilities";
import i18next from "i18next";

const DOListColDefs = [
    {
        headerName: i18next.t("DeliveryOrderNo"),
        field: "doNumber",
        checkboxSelection: (params) => {
            const { data } = params;
            const { allowSelect } = data;
            return !!allowSelect;
        },
        pinned: "left",
        minWidth: 220
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        minWidth: 220
    },
    {
        headerName: i18next.t("PurchaseOrderNo"),
        field: "poNumbers",
        minWidth: 220
    },
    {
        headerName: i18next.t("SupplierName"),
        field: "supplierName",
        minWidth: 220
    },
    {
        headerName: i18next.t("Type"),
        field: "procurementType",
        minWidth: 160,
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.toUpperCase();
            return value;
        }
    },
    {
        headerName: i18next.t("DeliveryDate"),
        field: "deliveryDate",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertToLocalTime(value, CUSTOM_CONSTANTS.DDMMYYYY);
            return "";
        },
        minWidth: 160
    },
    {
        headerName: i18next.t("ContactPerson"),
        field: "contactPerson",
        minWidth: 200
    },
    {
        headerName: i18next.t("ContactNumber"),
        field: "contactPersonWorkNo",
        valueFormatter: (params) => `+${params.value}`
    },
    {
        headerName: i18next.t("IssuedDate"),
        sort: "desc",
        field: "issuedDate",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertToLocalTime(value, CUSTOM_CONSTANTS.DDMMYYYHHmmss);
            return "";
        },
        minWidth: 160,
        hide: true
    }
];

export default DOListColDefs;
