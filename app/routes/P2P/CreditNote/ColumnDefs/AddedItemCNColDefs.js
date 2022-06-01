import i18next from "i18next";
import { formatNumber } from "../helper/utilities";
import { CREDIT_NOTE_CONSTANTS } from "../helper";

const properties = (disabled, isNumber = false) => ({
    editable: (params) => {
        const { manualItem } = params.data;
        return manualItem && !disabled;
    },
    cellStyle: (params) => {
        const { manualItem } = params.data;
        if (manualItem && !disabled) {
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB",
                textAlign: isNumber ? "right" : "left"
            };
        }
        return { textAlign: isNumber ? "right" : "left" };
    }
});

const getAddedItemCNColDefs = (
    uoms,
    taxRecords,
    glAccounts,
    currencies,
    disabled,
    status,
    isBuyer
) => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        hide: disabled,
        width: 100,
        filter: false
    },
    {
        headerName: i18next.t("Description"),
        field: "itemDescription",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Quantity"),
        field: "itemQuantity",
        // cellRenderer: formatNumber,
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
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
        field: "currencyCode",
        ...properties(disabled),
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                return (typeof value === "object") ? `${value.currencyName} (+${value.currencyCode})` : value;
            }
            return value;
        },
        cellRenderer: (params) => {
            const { value } = params;
            if (value) {
                return (typeof value === "object") ? `${value.currencyCode}` : value;
            }
            return value;
        },
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: currencies,
            getOption: ({ currencyCode }) => ({ label: currencyCode, value: currencyCode })
        },
        width: 140
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "unitPrice",
        // cellRenderer: formatNumber,
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
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
        headerName: i18next.t("ExchangeRate"),
        field: "exchangeRate",
        cellRenderer: formatNumber,
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return { textAlign: "right" };
        },
        width: 160
    },
    {
        headerName: i18next.t("NetPrice"),
        field: "netPrice",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        width: 140
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode",
        ...properties(disabled),
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                return (typeof value === "object") ? `${value.uomCode}` : value;
            }
            return value;
        },
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: uoms,
            getOption: ({ uomCode }) => ({ label: uomCode, value: uomCode })
        },
        width: 140
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        ...properties(disabled),
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                return (typeof value === "object") ? `${value.taxCode}` : value;
            }
            return value;
        },
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: taxRecords,
            getOption: ({ taxCode }) => ({ label: taxCode, value: taxCode })
        },
        width: 140
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "taxPercent",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        width: 140
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "glAccount",
        hide: !isBuyer,
        cellEditor: "agDropdownSelection",
        valueFormatter: (params) => {
            const { value } = params;
            if (!glAccounts || glAccounts.length === 0) {
                return value;
            }
            if (typeof value === "string" && glAccounts) {
                const gl = glAccounts.find((item) => item.accountNumber === value);
                return `${gl?.accountNumber} ${gl?.description}`;
            }
            if (typeof value === "object") {
                return `${value.accountNumber ?? ""} ${value.description ?? ""}`;
            }
            return value;
        },
        cellEditorParams: {
            values: glAccounts,
            getOption: ({ accountNumber, description }) => ({ label: `${accountNumber ?? ""} ${description ? `(${description})` : ""}`, value: accountNumber })
        },
        editable: !disabled || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL) || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_CN_APPROVAL),
        cellStyle: () => {
            if (!disabled || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL) || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_CN_APPROVAL)) {
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
        headerName: i18next.t("Cost Code"),
        field: "costCode",
        hide: !isBuyer,
        cellEditor: "agDropdownSelection",
        valueFormatter: (params) => {
            const { value } = params;
            if (!value) return "";
            return typeof value === "object" ? value?.code : value;
        },
        cellEditorParams: (params) => {
            const { glAccount } = params.data;
            let costs;
            if (typeof glAccount === "string") {
                costs = glAccounts.find((item) => item.accountNumber === glAccount)?.costCodeDtoList || [];
            } else {
                costs = params.data?.glAccount?.costCodeDtoList || [];
            }
            return ({
                values: costs,
                getOption: ({ code }) => ({ label: code, value: code })
            });
        },
        editable: !disabled || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL) || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_CN_APPROVAL),
        cellStyle: () => {
            if (!disabled || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL) || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_CN_APPROVAL)) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        }
    },
    {
        headerName: i18next.t("Department Code"),
        field: "departmentCode",
        hide: !isBuyer,
        cellEditor: "agDropdownSelection",
        valueFormatter: (params) => {
            const { value } = params;
            if (!value) return "";
            return typeof value === "object" ? value?.code : value;
        },
        cellEditorParams: (params) => {
            const { glAccount } = params.data;
            let departments;
            if (typeof glAccount === "string") {
                departments = glAccounts.find((item) => item.accountNumber === glAccount)?.departmentCodeDtoList || [];
            } else {
                departments = params.data?.glAccount?.departmentCodeDtoList || [];
            }
            return ({
                values: departments,
                getOption: ({ code }) => ({ label: code, value: code })
            });
        },
        editable: !disabled || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL) || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_CN_APPROVAL),
        cellStyle: () => {
            if (!disabled || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL) || (disabled && status === CREDIT_NOTE_CONSTANTS.PENDING_CN_APPROVAL)) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        }
    },
    {
        headerName: i18next.t("Notes"),
        field: "notes",
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 500 },
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
        tooltipField: "notes",
        tooltipComponentParams: {
            fieldTooltip: "notes",
            isShow: disabled
        }
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "invItemCode",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "invItemDescription",
        tooltipField: "invItemDescription",
        tooltipComponentParams: (params) => {
            const { manualItem } = params.data;
            return {
                fieldTooltip: "invItemDescription",
                isShow: !manualItem || disabled
            };
        },
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Model"),
        field: "invItemModel",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Size"),
        field: "invItemSize",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Brand"),
        field: "invItemBrand",
        ...properties(disabled)
    }
];

export default getAddedItemCNColDefs;
