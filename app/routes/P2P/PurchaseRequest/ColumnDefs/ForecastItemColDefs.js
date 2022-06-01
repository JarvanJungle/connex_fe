import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const ForecastItemColDefs = [
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: (params) => {
            const { data } = params;
            return !data.isSelected;
        },
        minWidth: 200
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName"
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription",
        tooltipField: "itemDescription",
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel"
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize"
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand"
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom"
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrency"
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "itemUnitPrice",
        cellStyle: { textAlign: "center" }
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("Category"),
        field: "categoryName"
    },
    {
        headerName: i18next.t("TradeCode"),
        field: "projectForecastTradeCode"
    }
];

export default ForecastItemColDefs;
