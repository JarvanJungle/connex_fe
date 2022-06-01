import i18next from "i18next";
import { convertDate2String } from "helper/utilities";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const editableQuantity = (context, data, disabled) => !disabled;

const withoutApprovalEditable = (context, data, disabled) => !disabled;

const editableUnitPrice = (context, data, disabled) => {
    const condition1 = !disabled && data.existingItem;
    const condition2 = !disabled && !data.existingItem && data.manualItem;
    const condition3 = !disabled && !data.existingItem && !data.manualItem && data.editableUnitPrice;
    return condition1 || condition2 || condition3;
};

const isPR = (convertFrom) => convertFrom === FEATURE.PR;

const getPOItemsColDefs = (
    uoms,
    currencies,
    addresses,
    glAccounts,
    taxRecords,
    disabled,
    isProject,
    isSupplier,
    listCategory,
    priceTypes,
    convertFrom
) => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        filter: false,
        hide: disabled,
        width: 100
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if (manualItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        }
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if (manualItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        width: 220
    },
    {
        field: "itemCategory",
        headerName: "Category",
        valueFormatter: (params) => (params.value?.categoryName),
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: listCategory,
            getOption: (value) => ({ label: value?.categoryName, value: value?.uuid })
        },
        editable: ({ data }) => data.manualItem && !disabled,
        cellStyle: ({ data }) => {
            const editable = data.manualItem && !disabled;
            if (editable) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        width: 120
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription",
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 250 },
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if (manualItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        tooltipField: "itemDescription",
        tooltipComponentParams: (params) => {
            const { manualItem } = params.data;
            return {
                fieldTooltip: "itemDescription",
                isShow: disabled || !manualItem
            };
        },
        width: 250
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if (manualItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        width: 140
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if (manualItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        width: 140
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if (manualItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        width: 140
    },
    {
        headerName: i18next.t("Trade"),
        field: "projectForecastTradeCode",
        hide: !isProject,
        width: 140
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom",
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: uoms,
            getOption: ({ uomCode }) => ({ label: uomCode, value: uomCode })
        },
        valueGetter: ({ data }) => data?.uom?.uomCode ?? data?.uom ?? "",
        valueFormatter: ({ value }) => value?.uomCode ?? value ?? "",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if (manualItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        width: 140
    },
    {
        headerName: i18next.t("Quantity"),
        field: "itemQuantity",
        editable: ({ context, data }) => editableQuantity(context, data, disabled),
        cellStyle: ({ context, data }) => {
            const editable = editableQuantity(context, data, disabled);
            if (editable) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return { textAlign: "right" };
        },
        width: 140
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrency",
        valueGetter: ({ data }) => (data?.sourceCurrency?.currencyCode ? data?.sourceCurrency?.currencyCode : data?.sourceCurrency ?? ""),
        valueFormatter: ({ value }) => (value?.currencyCode ? value?.currencyCode : value ?? ""),
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: currencies,
            getOption: ({ currencyName, currencyCode }) => ({ label: `${currencyName} (+${currencyCode})`, value: currencyCode })
        },
        // all item use same currency
        editable: false,
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "itemUnitPrice",
        editable: ({ context, data }) => editableUnitPrice(context, data, disabled),
        cellStyle: ({ context, data }) => {
            const editable = editableUnitPrice(context, data, disabled);
            if (editable) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return { textAlign: "right" };
        },
        width: 140,
        hide: !isPR(convertFrom)
    },
    {
        headerName: i18next.t("PriceType"),
        field: "priceType",
        valueGetter: ({ data }) => (
            typeof data?.priceType === "object"
                ? data?.priceType?.priceType || ""
                : data?.priceType ?? ""
        ),
        valueFormatter: ({ value }) => (
            typeof value === "object"
                ? value?.priceType || ""
                : value || ""
        ),
        cellEditor: "agDropdownInput",
        cellEditorParams: {
            values: priceTypes,
            getOption: ({ priceType }) => ({ label: priceType, value: priceType })
        },
        editable: (params) => {
            if (params?.data?.firstTime) {
                return true;
            }
            if (Number(params.data.itemUnitPrice) !== 0) {
                return false;
            }
            return !disabled;
        },
        cellStyle: (params) => {
            if (params.data.firstTime) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            if (Number(params.data.itemUnitPrice) !== 0) {
                return {};
            }
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
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
        cellStyle: {
            textAlign: "right"
        },
        hide: !isProject || !isPR(convertFrom)
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        valueGetter: ({ data }) => data?.taxCode?.taxCode ?? data?.taxCode ?? "",
        valueFormatter: ({ value }) => value?.taxCode ?? value ?? "",
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: taxRecords,
            getOption: ({ taxCode }) => ({ label: taxCode, value: taxCode })
        },
        editable: ({ data }) => !disabled && !data.existingItem,
        cellStyle: ({ data }) => {
            const editable = !disabled && !data.existingItem;
            if (editable) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
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
        editable: (params) => {
            const { manualItem, editableExchangeRate } = params.data;
            return (!!manualItem && !disabled)
                    || (!!editableExchangeRate && !disabled);
        },
        cellStyle: (params) => {
            const { manualItem, editableExchangeRate } = params.data;
            if ((!disabled && manualItem)
                    || (!!editableExchangeRate && !disabled)
            ) {
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
        cellRenderer: formatNumber,
        hide: isSupplier || !isPR(convertFrom),
        width: 140
    },
    {
        headerName: i18next.t("InDocumentCurrencyBeforeTax"),
        field: "inDocumentCurrencyBeforeTax",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        hide: isSupplier || !isPR(convertFrom),
        width: 140
    },
    {
        headerName: i18next.t("TaxAmountInDocumentCurrency"),
        field: "taxAmountInDocumentCurrency",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        hide: isSupplier || !isPR(convertFrom),
        width: 140
    },
    {
        headerName: i18next.t("InDocumentCurrencyAfterTax"),
        field: "inDocumentCurrencyAfterTax",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        hide: isSupplier || !isPR(convertFrom),
        width: 140
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address",
        valueGetter: ({ data }) => data?.address?.addressLabel ?? data?.address ?? "",
        valueFormatter: ({ value }) => (value?.addressLabel ?? value ?? ""),
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: addresses,
            getOption: ({ addressLabel }) => ({ label: addressLabel, value: addressLabel })
        },
        editable: ({ context, data }) => withoutApprovalEditable(context, data, disabled),
        cellStyle: ({ context, data }) => {
            const editable = withoutApprovalEditable(context, data, disabled);
            if (editable) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        }
    },
    {
        headerName: i18next.t("RequestedDeliveryDate"),
        field: "requestedDeliveryDate",
        cellEditor: "datePicker",
        editable: ({ context, data }) => withoutApprovalEditable(context, data, disabled),
        cellStyle: ({ context, data }) => {
            const editable = withoutApprovalEditable(context, data, disabled);
            if (editable) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertDate2String(new Date(value), CUSTOM_CONSTANTS.DDMMYYYY);
            return "";
        },
        width: 160
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "accountNumber",
        valueGetter: ({ data }) => data?.accountNumber?.accountNumber ?? data?.accountNumber ?? "",
        valueFormatter: ({ value }) => (value?.accountNumber ?? value ?? ""),
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: glAccounts,
            getOption: ({ accountNumber }) => ({ label: accountNumber, value: accountNumber })
        },
        editable: ({ context, data }) => withoutApprovalEditable(context, data, disabled),
        cellStyle: ({ context, data }) => {
            const editable = withoutApprovalEditable(context, data, disabled);
            if (editable) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        hide: isSupplier || !isPR(convertFrom),
        width: 160
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "accountNumber",
        valueGetter: ({ data }) => data?.accountNumber?.accountNumber ?? data?.accountNumber ?? "",
        valueFormatter: ({ value }) => (value?.accountNumber ?? value ?? ""),
        hide: isPR(convertFrom),
        width: 160
    },
    {
        headerName: i18next.t("Note"),
        field: "note",
        minWidth: 400,
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 500 },
        editable: ({ context, data }) => withoutApprovalEditable(context, data, disabled),
        cellStyle: ({ context, data }) => {
            const editable = withoutApprovalEditable(context, data, disabled);
            if (editable) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    width: "400px"
                };
            }
            return {};
        },
        tooltipField: "note",
        tooltipComponentParams: {
            fieldTooltip: "note",
            isShow: disabled
        }
    },
    {
        field: "firstTime",
        hide: true
    }
];

export default getPOItemsColDefs;
