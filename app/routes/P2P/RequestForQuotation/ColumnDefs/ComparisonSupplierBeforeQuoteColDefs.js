import i18next from "i18next";
import {
    formatNumber,
    formatStyleNumber,
    formatDate
} from "../helper";

const ComparisonSupplierBeforeQuoteColDefs = [
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode"
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName",
        width: 220
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription",
        tooltipField: "itemDescription",
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: true
        },
        width: 250
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        width: 140
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        width: 140
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        width: 140
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom",
        width: 140
    },
    {
        headerName: i18next.t("RequestedQuantity"),
        field: "itemQuantity",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("QuotedCurrency"),
        field: "sourceCurrency",
        width: 140
    },
    {
        headerName: i18next.t("QuotedUnitPriceInSourceCurrency"),
        field: "quotedUnitPriceInSourceCurrency",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber
    },
    {
        headerName: i18next.t("ExchangeRate"),
        field: "exchangeRate",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("QuotedUnitPriceInDocCurrency"),
        field: "quotedUnitPriceInDocCurrency",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber
    },
    {
        headerName: i18next.t("NetPrice"),
        field: "netPrice",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("Date"),
        field: "date",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        width: 140
    },
    {
        headerName: i18next.t("TaxPercentage%"),
        field: "taxPercentage",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("SuppliersNote"),
        field: "note",
        minWidth: 400,
        tooltipField: "note",
        tooltipComponentParams: {
            fieldTooltip: "note",
            isShow: true
        }
    }
];

export default ComparisonSupplierBeforeQuoteColDefs;
