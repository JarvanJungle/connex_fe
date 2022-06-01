import i18next from "i18next";
import { formatDisplayDecimal, roundNumberWithUpAndDown } from "helper/utilities";
import { formatNumber, formatStyleNumber } from "../helper";

const getComparisonSupplierAfterQuoteColDefs = (disabled) => [
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
        valueFormatter: ({ data, value }) => {
            if (data?.itemCode.length === 1) {
                return formatDisplayDecimal(value, 2);
            }
            return "";
        },
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
        field: "itemUnitPrice",
        cellStyle: formatStyleNumber
    },
    {
        headerName: i18next.t("ExchangeRate"),
        field: "exchangeRate",
        cellRenderer: formatNumber,
        editable: (params) => params?.data?.quotedItem && !disabled,
        cellStyle: ({ data }) => {
            const { quotedItem, itemCode } = data;
            if (itemCode.length === 1 && quotedItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return {
                textAlign: "right"
            };
        },
        width: 140
    },
    {
        headerName: i18next.t("QuotedUnitPriceInDocCurrency"),
        field: "quotedUnitPriceInDocCurrency",
        cellRenderer: ({ value }) => roundNumberWithUpAndDown(value),
        cellStyle: formatStyleNumber
    },
    {
        headerName: i18next.t("NetPrice"),
        field: "netPrice",
        cellRenderer: ({ value }) => roundNumberWithUpAndDown(value),
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("QuotedDate"),
        field: "quotedDate",
        valueFormatter: (params) => {
            const { value } = params;
            return value;
        },
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
        field: "quoteItemNote",
        minWidth: 400,
        tooltipField: "quoteItemNote",
        tooltipComponentParams: {
            fieldTooltip: "quoteItemNote",
            isShow: true
        }
    }
];

export default getComparisonSupplierAfterQuoteColDefs;
