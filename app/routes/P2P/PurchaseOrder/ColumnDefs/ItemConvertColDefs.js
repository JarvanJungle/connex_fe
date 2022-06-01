import i18next from "i18next";
import { convertDate2String } from "helper/utilities";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const isPR = (convertFrom) => convertFrom === FEATURE.PR;

const getItemConvertColDefs = (isProject, convertFrom) => [
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
        field: "itemCategory",
        headerName: "Category",
        valueFormatter: (params) => (params.value?.categoryName),
        width: 120
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
        headerName: i18next.t("Trade"),
        field: "projectForecastTradeCode",
        hide: !isProject,
        width: 140
    },
    {
        headerName: i18next.t("Supplier"),
        field: "supplierUuid",
        width: 160
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom",
        width: 140
    },
    {
        headerName: i18next.t("Quantity"),
        field: "itemQuantity",
        cellStyle: { textAlign: "right" },
        width: 140
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrency",
        valueFormatter: ({ value }) => value?.currencyCode,
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "itemUnitPrice",
        cellStyle: { textAlign: "right" },
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("Price Type"),
        field: "priceType",
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("UOM (Forecast)"),
        field: "uomForecast",
        hide: !isProject || !isPR(convertFrom)
    },
    {
        headerName: i18next.t("Unit Price (Forecasted)"),
        field: "unitPriceForecasted",
        cellStyle: { textAlign: "right" },
        hide: !isProject || !isPR(convertFrom)
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate",
        cellStyle: { textAlign: "right" },
        cellRenderer: formatNumber,
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("InSourceCurrencyBeforeTax"),
        field: "inSourceCurrencyBeforeTax",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        width: 160,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("ExchangeRate"),
        field: "exchangeRate",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("InDocumentCurrencyBeforeTax"),
        field: "inDocumentCurrencyBeforeTax",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("TaxAmountInDocumentCurrency"),
        field: "taxAmountInDocumentCurrency",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("InDocumentCurrencyAfterTax"),
        field: "inDocumentCurrencyAfterTax",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address"
    },
    {
        headerName: i18next.t("RequestedDeliveryDate"),
        field: "requestedDeliveryDate",
        cellRenderer: ({ value }) => {
            if (value) return convertDate2String(new Date(value), CUSTOM_CONSTANTS.DDMMYYYY);
            return "";
        },
        width: 160
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "accountNumber",
        width: 160
    },
    {
        headerName: i18next.t("Note"),
        field: "note",
        minWidth: 400,
        tooltipField: "note",
        tooltipComponentParams: {
            fieldTooltip: "note",
            isShow: true
        }
    }
];

export default getItemConvertColDefs;
