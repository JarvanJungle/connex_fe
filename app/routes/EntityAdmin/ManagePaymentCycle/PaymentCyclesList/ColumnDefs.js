import i18next from "i18next";
import { convertToLocalTime } from "helper/utilities";

export default (hasWritePermission) => [
    {
        headerName: i18next.t("PaymentCycleCode"),
        field: "paymentCycleCode",
        headerCheckboxSelection: hasWritePermission,
        headerCheckboxSelectionFilteredOnly: hasWritePermission,
        checkboxSelection: hasWritePermission
    },
    {
        headerName: i18next.t("PaymentCycleDate"),
        field: "paymentCycleDate",
        valueFormatter: ({ value }) => (value === 31 ? "END MTH" : value)
    },
    {
        headerName: i18next.t("Description"),
        field: "description",
        tooltipComponent: "customTooltip",
        tooltipField: "description",
        tooltipComponentParams: {
            fieldTooltip: "description",
            isShow: true
        }
    },
    {
        headerName: i18next.t("UpdatedOn"),
        field: "updatedOn",
        sort: "desc",
        valueFormatter: ({ value }) => convertToLocalTime(value)
    },
    {
        headerName: i18next.t("Action"),
        cellRenderer: "actionColRenderer",
        hide: !hasWritePermission
    }
];
