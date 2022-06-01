import i18next from "i18next";
import { convertToLocalTime } from "helper/utilities";

const DeliveryOrderCreateColDefs = [
    {
        headerName: i18next.t("PurchaseOrderNo"),
        field: "poNumber",
        minWidth: 220,
        headerCheckboxSelection: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: (params) => {
            const { data } = params;
            if (!data.canSelect) {
                return false;
            }
            return data.isSelected;
        },
        sort: "desc"
    },
    {
        headerName: i18next.t("StatusOfDeliveryOrder"),
        field: "doStatus"
    },
    {
        headerName: i18next.t("DeliveryOrderNo"),
        field: "deliveryOrderNumber",
        minWidth: 220
    },
    {
        headerName: i18next.t("BuyerName"),
        field: "buyerCompanyName",
        valueFormatter: (param) => (param.value ? param.value.toUpperCase() : ""),
        minWidth: 220
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode"
    },
    {
        headerName: i18next.t("Type"),
        field: "procurementType",
        valueFormatter: (param) => (param.value ? param.value.toUpperCase() : ""),
        minWidth: 150
    },
    {
        headerName: i18next.t("IssuedDate"),
        field: "issuedDate",
        valueFormatter: (param) => convertToLocalTime(param.value),
        sort: "desc",
        sortIndex: 0
    },
    {
        headerName: i18next.t("UpdatedDate"),
        field: "updatedOn",
        valueFormatter: (param) => convertToLocalTime(param.value)
    }
];

export default DeliveryOrderCreateColDefs;
