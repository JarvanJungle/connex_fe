import i18next from "i18next";
import { convertDate2String } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const getAddItemReqColDefs = (
    suppliers,
    uoms,
    currencies,
    addresses,
    glAccounts,
    taxRecords,
    disabled,
    isPurchaseOrderItems,
    isProject,
    isSupplier,
    listCategory,
    isPrePurchaseOrderItems,
    priceTypes,
    isPendingSubmission,
    pendingReviewPO
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
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: listCategory
        },
        editable: (params) => params.data.isManual,
        cellStyle: (params) => {
            if (params.data.isManual) {
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
        headerName: i18next.t("Supplier"),
        field: "supplierUuid",
        cellRenderer: "supplerCellRenderer",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: suppliers,
            cellRenderer: "supplerCellRenderer"
        },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        hide: isPurchaseOrderItems,
        width: 160
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom",
        cellRenderer: "uomCellRenderer",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: uoms,
            cellRenderer: "uomCellRenderer"
        },
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
        editable: !disabled,
        cellStyle: () => {
            if (!disabled && !pendingReviewPO) {
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
        // cellRenderer: formatNumber,
        width: 140
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrency",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: currencies,
            cellRenderer: "currencyCellRenderer"
        },
        editable: (params) => {
            const { manualItem, editableCurrency } = params.data;
            return (!!manualItem && !disabled)
                    || (!!editableCurrency && !disabled);
        },
        cellStyle: (params) => {
            const { manualItem, editableCurrency } = params.data;
            if ((!disabled && manualItem)
                    || (!!editableCurrency && !disabled)
            ) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                return value.currencyCode;
            }
            return "";
        },
        width: 140
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "itemUnitPrice",
        editable: (params) => {
            const { manualItem, editableUnitPrice } = params.data;
            return (!disabled && !isPrePurchaseOrderItems && !!editableUnitPrice)
                    || (!disabled)
                    || (!!editableUnitPrice && !disabled);
        },
        cellStyle: (params) => {
            const { manualItem, editableUnitPrice } = params.data;
            if (((!disabled && !isPrePurchaseOrderItems && !!editableUnitPrice)
                    || (!disabled)
                    || (!!editableUnitPrice && !disabled))
                    && !pendingReviewPO
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
        // cellRenderer: formatNumber,
        width: 140
    },
    {
        headerName: i18next.t("Price Type"),
        field: "priceType",
        cellRenderer: "priceTypeCellRenderer",
        cellEditor: "agDropdownInput",
        cellEditorParams: {
            values: priceTypes,
            getOption: ({ priceType }) => ({ label: priceType, value: priceType })
        },
        editable: (params) => {
            if (disabled || pendingReviewPO) {
                return false;
            }
            if (!params.data.firstTime) {
                return true;
            }
            if (params.data.itemUnitPrice !== 0 && params.data.itemUnitPrice !== "0") {
                return false;
            }
            return false;
        },
        cellStyle: (params) => {
            if (disabled || pendingReviewPO) {
                return {};
            }
            if (!params.data.firstTime) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            if (params.data.itemUnitPrice !== 0 && params.data.itemUnitPrice !== "0") {
                return {};
            }
            return {};
        },
        hide: isPrePurchaseOrderItems
    },
    {
        headerName: i18next.t("UOM (Forecast)"),
        field: "uomForecast",
        hide: !isProject || !isPendingSubmission
    },
    {
        headerName: i18next.t("Unit Price (Forecasted)"),
        field: "unitPriceForecasted",
        // cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        hide: !isProject || !isPendingSubmission
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        cellRenderer: "taxRecordCellRenderer",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: taxRecords,
            cellRenderer: "taxRecordCellRenderer"
        },
        editable: !disabled && !pendingReviewPO,
        cellStyle: () => {
            if (!disabled && !pendingReviewPO) {
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
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate",
        cellStyle: {
            textAlign: "right"
        },
        cellRenderer: formatNumber,
        width: 140
    },
    {
        headerName: i18next.t("InSourceCurrencyBeforeTax"),
        field: "inSourceCurrencyBeforeTax",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        width: 160
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
        hide: isSupplier,
        width: 140
    },
    {
        headerName: i18next.t("InDocumentCurrencyBeforeTax"),
        field: "inDocumentCurrencyBeforeTax",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        hide: isSupplier,
        width: 140
    },
    {
        headerName: i18next.t("TaxAmountInDocumentCurrency"),
        field: "taxAmountInDocumentCurrency",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        hide: isSupplier,
        width: 140
    },
    {
        headerName: i18next.t("InDocumentCurrencyAfterTax"),
        field: "inDocumentCurrencyAfterTax",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        hide: isSupplier,
        width: 140
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address",
        cellRenderer: "addressCellRenderer",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: addresses,
            cellRenderer: "addressCellRenderer"
        },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
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
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
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
        cellRenderer: "accountCellRenderer",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: glAccounts,
            cellRenderer: "accountCellRenderer"
        },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        hide: isSupplier,
        width: 160
    },
    {
        headerName: i18next.t("Note"),
        field: "note",
        minWidth: 400,
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 500 },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
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
    }
];

export default getAddItemReqColDefs;
