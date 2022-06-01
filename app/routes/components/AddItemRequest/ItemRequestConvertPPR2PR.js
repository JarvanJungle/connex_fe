import { convertDate2String, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import i18next from "i18next";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const getItemRequestConvertPPR2PR = (
    suppliers,
    uoms,
    currencies,
    addresses,
    glAccounts,
    taxRecords,
    priceTypes,
    disabled,
    isProject,
    isSupplier,
    listCategory,
    isPrePurchaseOrderItems,
    listAllSuppliers
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
        valueGetter: (params) => params.data?.itemCode?.slice(0, 20),
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
        valueGetter: (params) => params.data?.itemName?.slice(0, 200),
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
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: disabled
        },
        width: 250
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        valueGetter: (params) => params.data?.itemModel?.slice(0, 200),
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
        headerName: i18next.t("Size"),
        field: "itemSize",
        valueGetter: (params) => params.data?.itemSize?.slice(0, 200),
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
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        valueGetter: (params) => params.data?.itemBrand?.slice(0, 200),
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
        headerName: i18next.t("Trade"),
        field: "tradeCode",
        hide: !isProject
    },
    {
        field: "itemCategory",
        headerName: "Category",
        valueFormatter: (params) => (params.value?.categoryName),
        cellRenderer: ({ value }) => value?.categoryName ?? "",
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: listCategory,
            getOption: (value) => ({ label: value?.categoryName, value: value?.uuid })
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
        headerName: i18next.t("Supplier"),
        field: "supplierUuid",
        cellEditorParams: (params) => {
            if (params.data.manualItem) {
                return {
                    values: suppliers.map((item) => ({
                        ...item,
                        supplierName: item.companyName,
                        companyCode: item.companyName,
                        supplierCode: item.companyCode
                    }))
                };
            }
            const selectedSupplier = params.data.itemCode;
            const selectedCatalogue = listAllSuppliers.filter(
                (item) => item.itemCode === selectedSupplier
            );
            return {
                values: selectedCatalogue[0]?.suppliers.length > 0
                    ? selectedCatalogue[0].suppliers.map((item) => ({
                        ...item,
                        companyCode: item.unitPrice ? `${item.supplierName} - ${item.currency || ""} ${formatDisplayDecimal(Number(item.unitPrice), 2) || ""}/${item.uom || ""}` : item.supplierName
                    })) : []
            };
        },
        valueFormatter: (params) => {
            if (params.value) {
                if (typeof (params.value) === "object") {
                    return params.value.companyName
                        ? params.value.companyName
                        : params.value.supplierName;
                }
                return JSON.parse(params.value).supplierName
                    ? JSON.parse(params.value).supplierName
                    : JSON.parse(params.value).companyName;
            }
            return "";
        },
        cellRenderer: "genderCellRenderer",
        cellEditor: "editCell",
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
        headerName: i18next.t("UOM"),
        field: "uom",
        cellRenderer: "uomCellRenderer",
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: uoms,
            getOption: ({ uomCode }) => ({ label: uomCode, value: uomCode })
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
        headerName: i18next.t("Quantity"),
        field: "itemQuantity",
        editable: (params) => {
            const { manualItem } = params.data;
            return (!disabled && !isPrePurchaseOrderItems) || (!disabled && manualItem);
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if ((!disabled && !isPrePurchaseOrderItems)
                || (!disabled && manualItem)) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return {
                textAlign: "right"
            };
        }
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrency",
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: currencies,
            getOption: ({ currencyCode }) => ({ label: currencyCode, value: currencyCode })
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
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                return value.currencyCode;
            }
            return "";
        }
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "itemUnitPrice",
        editable: (params) => {
            const { manualItem } = params.data;
            return (!disabled && !isPrePurchaseOrderItems) || ((!disabled && manualItem));
        },
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if ((!disabled && !isPrePurchaseOrderItems)
                || (!disabled && manualItem)) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return {
                textAlign: "right"
            };
        }
        // cellRenderer: formatNumber
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
            if (!params.data.firstTime) {
                return true;
            }
            if (params.data.itemUnitPrice !== 0 && params.data.itemUnitPrice !== "0") {
                return false;
            }
            return !disabled;
        },
        cellStyle: (params) => {
            if (!params.data.firstTime) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            if (params.data.itemUnitPrice !== 0 && params.data.itemUnitPrice !== "0") {
                return {};
            }
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
        headerName: i18next.t("UOM (Forecast)"),
        field: "uomForecast",
        hide: !isProject
    },
    {
        headerName: i18next.t("Unit Price (Forecasted)"),
        field: "unitPriceForecasted",
        // cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        hide: !isProject
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        cellRenderer: "taxRecordCellRenderer",
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: taxRecords,
            getOption: ({ taxCode }) => ({ label: taxCode, value: taxCode })
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
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate",
        cellStyle: {
            textAlign: "right"
        },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("InSourceCurrencyBeforeTax"),
        field: "inSourceCurrencyBeforeTax",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        }
    },
    {
        headerName: i18next.t("ExchangeRate"),
        field: "exchangeRate",
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
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
        hide: isSupplier
    },
    {
        headerName: i18next.t("InDocumentCurrencyBeforeTax"),
        field: "inDocumentCurrencyBeforeTax",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        hide: isSupplier
    },
    {
        headerName: i18next.t("TaxAmountInDocumentCurrency"),
        field: "taxAmountInDocumentCurrency",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        hide: isSupplier
    },
    {
        headerName: i18next.t("InDocumentCurrencyAfterTax"),
        field: "inDocumentCurrencyAfterTax",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        },
        hide: isSupplier
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address",
        cellRenderer: "addressCellRenderer",
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: addresses,
            getOption: ({ addressLabel, uuid }) => ({ label: addressLabel, value: uuid })
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
        }
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "accountNumber",
        cellRenderer: "accountCellRenderer",
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: glAccounts,
            getOption: ({ accountNumber }) => ({ label: accountNumber, value: accountNumber })
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
        hide: isSupplier
    },
    {
        headerName: i18next.t("Note"),
        field: "note",
        minWidth: 200,
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

export default getItemRequestConvertPPR2PR;
