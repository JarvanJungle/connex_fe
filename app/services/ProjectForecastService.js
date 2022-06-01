import axios from "axios";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import CONFIG from "./urlConfig";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};
class ProjectForecastService {
    getListProjectColDefs(t) {
        return [
            {
                headerName: t("ProjectForecastCode"),
                field: "projectCode"
            },
            {
                headerName: t("ProjectForecastTitle"),
                field: "projectTitle",
                tooltipField: "projectTitle",
                tooltipComponentParams: {
                    fieldTooltip: "projectTitle",
                    isShow: true
                }
            },
            {
                headerName: t("ProjectForecastStatus"),
                field: "projectStatus",
                valueFormatter: (params) => {
                    if (params.data.projectStatus === "Project Closed") {
                        return "CLOSED";
                    }
                    return params.data.projectStatus;
                }
            },
            {
                headerName: t("ProjectForecastDescription"),
                field: "projectDescription",
                tooltipField: "projectDescription",
                tooltipComponentParams: {
                    fieldTooltip: "projectDescription",
                    isShow: true
                }
            },
            {
                headerName: t("ProjectForecastProjectAdmin"),
                field: "projectAdmin"
            },
            {
                headerName: t("ProjectForecastStartDate"),
                field: "startDate"
            },
            {
                headerName: t("ProjectForecastEndDate"),
                field: "endDate"
            },
            {
                headerName: t("ProjectForecastCurrency"),
                field: "currency",
                width: 120
            },
            {
                headerName: t("ProjectForecastOverallBudget"),
                field: "overallBudget",
                cellStyle: { textAlign: "right" },
                cellRenderer: (params) => formatNumber(params)
            },
            {
                headerName: t("ProjectForecastBudgetUsed"),
                field: "budgetUsed",
                cellStyle: { textAlign: "right" },
                cellRenderer: (params) => formatNumber(params)
            },
            {
                headerName: t("ProjectForecastCreatedOn"),
                field: "createdOn",
                valueFormatter: (param) => convertToLocalTime(param.value),
                sort: "desc"
            },
            {
                headerName: t("ProjectForecastCreatedBy"),
                field: "createdBy"
            },
            {
                headerName: t("ProjectForecastUpdatedOn"),
                field: "updatedOn",
                valueFormatter: (param) => convertToLocalTime(param.value)
            },
            {
                headerName: t("ProjectForecastUpdatedBy"),
                field: "updatedBy"
            }
        ];
    }

    getProjectForecastAuditTrailColDefs(t) {
        return [
            {
                headerName: t("User"),
                field: "user",
                suppressSizeToFit: false
            },
            {
                headerName: t("Role"),
                field: "role",
                suppressSizeToFit: false
            },
            {
                headerName: t("Action"),
                field: "action",
                suppressSizeToFit: false
            },
            {
                headerName: t("Date"),
                field: "date",
                suppressSizeToFit: false
            }
        ];
    }

    getProjectForecastSummaryColDefs(t) {
        return [
            {
                headerName: t("ProjectForecastCode"),
                field: "code"
            },
            {
                headerName: t("ProjectName"),
                field: "name"
            },
            {
                headerName: t("TotalBudgeted"),
                field: "totalBudgeted",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("TotalForecasted"),
                field: "totalForecasted",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("TotalSpend"),
                field: "totalSpend",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("TotalContracted"),
                field: "totalContracted",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("TotalContractedSpend"),
                field: "totalContractedSpend",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("PendingApproveInvoicesContract"),
                field: "pendingApproveInvoicesContract",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("ApproveInvoicesContract"),
                field: "approveInvoicesContract",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("PendingBillingContract"),
                field: "pendingBillingContract",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("ContractedSpendBalance"),
                field: "contractedSpendBalance",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("TotalNonContractedSpend"),
                field: "totalNonContractedSpend",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("PendingApproveInvoicesNonContract"),
                field: "pendingApproveInvoicesNonContract",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("ApproveInvoicesNonContract"),
                field: "approveInvoicesNonContract",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("PendingBillingNonContract"),
                field: "pendingBillingNonContract",
                cellRenderer: "priceValueRenderer",
                cellStyle: { textAlign: "right" }
            }
        ];
    }

    getProjectForecastDetailBreakdownColDefs(
        t, projectTrades, details, listCategory, uomList, currencies
    ) {
        const filteredArray = projectTrades.filter((item) => details.filter(
            (value) => item.tradeCode === value.code
        ).length === 0);
        return [
            {
                headerName: t("Code"),
                field: "code",
                valueGetter: (params) => params.data?.code?.slice(0, 20),
                editable: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return true;
                    }
                    if (params.data?.isNew && params.data?.path.length !== 2) {
                        return true;
                    }
                    return false;
                },
                cellStyle: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    if (params.data?.isNew && params.data?.path.length !== 2) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                },
                valueFormatter: (params) => (params.value?.tradeCode),
                cellEditorParams: {
                    values: filteredArray,
                    cellRenderer: "genderCellRenderer"
                },
                cellRenderer: "genderCellRenderer",
                cellEditor: "editCell"
            },
            {
                headerName: t("Name"),
                field: "name",
                valueGetter: (params) => params.data?.name?.slice(0, 200),
                editable: (params) => params.data?.path.length === 2 && params.data?.isManual,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                }
            },
            {
                headerName: t("Description"),
                field: "description",
                cellEditor: "agLargeTextCellEditor",
                cellEditorParams: { maxLength: 250 },
                tooltipComponent: "customTooltip",
                tooltipField: "description",
                tooltipComponentParams: {
                    fieldTooltip: "description",
                    isShow: true
                },
                editable: (params) => params.data?.path.length === 2 && params.data?.isManual,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                }
            },
            {
                headerName: t("Model"),
                field: "itemModel",
                valueGetter: (params) => params.data?.itemModel?.slice(0, 200),
                editable: (params) => params.data?.path.length === 2 && params.data?.isManual,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                }
            },
            {
                headerName: t("Size"),
                field: "itemSize",
                valueGetter: (params) => params.data?.itemSize?.slice(0, 200),
                editable: (params) => params.data?.path.length === 2 && params.data?.isManual,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                }
            },
            {
                headerName: t("Brand"),
                field: "itemBrand",
                valueGetter: (params) => params.data?.itemBrand?.slice(0, 200),
                editable: (params) => params.data?.path.length === 2 && params.data?.isManual,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                }
            },
            {
                headerName: t("UOM"),
                field: "uom",
                editable: (params) => params.data?.path.length === 2 && params.data?.isManual,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                },
                valueFormatter: (params) => (params.value?.uomCode),
                cellRenderer: "genderCellRenderer",
                cellEditor: "agDropdownSelection",
                cellEditorParams: {
                    values: uomList,
                    getOption: ({ uomCode }) => ({ label: uomCode, value: uomCode })
                }
            },
            {
                field: "itemCategory",
                colId: "itemCategory",
                headerName: "Category",
                cellRenderer: "genderCellRenderer",
                cellEditor: "agDropdownSelection",
                cellEditorParams: {
                    values: listCategory,
                    getOption: ({ categoryName, uuid }) => ({ label: categoryName, value: uuid })
                },
                valueFormatter: ({ value }) => value?.categoryName || value,
                editable: (params) => params.data?.isManual,
                cellStyle: (params) => {
                    if (params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                },
                width: 120
            },
            {
                headerName: t("SourceCurrency"),
                field: "sourceCurrency",
                colId: "sourceCurrency",
                editable: (params) => params.data?.path.length === 2 && params.data?.isManual,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2 && params.data?.isManual) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                },
                valueFormatter: (params) => (params.value?.currencyCode),
                cellRenderer: "genderCellRenderer",
                cellEditor: "agDropdownSelection",
                cellEditorParams: {
                    values: currencies,
                    getOption: ({ currencyCode }) => ({ label: currencyCode, value: currencyCode })
                }
            },
            {
                headerName: t("UnitPrice"),
                field: "itemUnitPrice",
                // cellRenderer: "priceValueForecastDetailRenderer",
                editable: (params) => params.data?.path.length === 2,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB",
                            textAlign: "right"
                        };
                    }
                    return {
                        textAlign: "right",
                        backgroundColor: "#e6e9ed"
                    };
                }
            },
            {
                headerName: t("Quantity"),
                field: "itemQuantity",
                editable: (params) => params.data?.path.length === 2,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB",
                            textAlign: "right"
                        };
                    }
                    return {
                        textAlign: "right",
                        backgroundColor: "#e6e9ed"
                    };
                }
            },
            {
                headerName: t("TotalForecastedInSourceCurrency"),
                field: "totalForecastedInSourceCurrency",
                cellRenderer: "priceValueForecastDetailRenderer",
                editable: (params) => {
                    if (params.data?.path.length === 1) {
                        return true;
                    }
                    // const arr = details.filter((item) => item.tradeCode === params.data.code);
                    // if (arr.length === 0) return true;
                    return false;
                },
                cellStyle: (params) => {
                    if (params.data?.path.length === 1) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB",
                            textAlign: "right"
                        };
                    }
                    // const arr = details.filter((item) => item.tradeCode === params.data.code);
                    // if (arr.length === 0) {
                    //     return {
                    //         backgroundColor: "#DDEBF7",
                    //         border: "1px solid #E4E7EB",
                    //         textAlign: "right"
                    //     };
                    // }
                    return {
                        backgroundColor: "#e6e9ed",
                        // color: "#e6e9ed",
                        textAlign: "right"
                    };
                }
            },
            {
                headerName: t("ExchangeRate"),
                field: "exchangeRate",
                colId: "exchangeRate",
                cellRenderer: "priceValueForecastDetailRenderer",
                editable: (params) => params.data?.path.length === 2,
                cellStyle: (params) => {
                    if (params.data?.path.length === 2) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB",
                            textAlign: "right"
                        };
                    }
                    return {
                        backgroundColor: "#e6e9ed"
                    };
                }
            },
            {
                headerName: t("TotalForecastedInDocumentCurrency"),
                field: "totalForecastedInDocumentCurrency",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("TotalSpend"),
                field: "totalSpend",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("TotalContracted"),
                field: "totalContracted",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("TotalContractedSpend"),
                field: "totalContractedSpend",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("PendingApproveInvoicesContract"),
                field: "contractPendingApprovalInvoices",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("ApproveInvoicesContract"),
                field: "contractApprovalInvoices",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("PendingBillingContract"),
                field: "contractPendingBilling",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("ContractedSpendBalance"),
                field: "contractedSpendBalance",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("TotalNonContractedSpend"),
                field: "totalNonContractedSpend",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("PendingApproveInvoicesNonContract"),
                field: "nonContractPendingApprovalInvoices",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("ApproveInvoicesNonContract"),
                field: "nonContractApprovalInvoices",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            },
            {
                headerName: t("PendingBillingNonContract"),
                field: "nonContractPendingBilling",
                cellRenderer: "priceValueForecastDetailRenderer",
                cellStyle: { textAlign: "right", backgroundColor: "#e6e9ed" }
            }
        ];
    }

    getProjectTradesColDefs(t) {
        return [
            {
                headerName: t("TradeCode"),
                field: "tradeCode",
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            {
                headerName: t("TradeTitle"),
                field: "tradeTitle"
            },
            {
                headerName: t("Description"),
                field: "description"
            }
        ];
    }

    getCatalogueItemsColDefs(t) {
        return [
            {
                headerName: t("GLAccount"),
                field: "glAccountNumber"
            },
            {
                headerName: t("ItemCode"),
                field: "catalogueItemCode",
                headerComponent: "CheckboxHeader",
                // headerCheckboxSelection: true,
                // headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                minWidth: 200
            },
            {
                headerName: t("ItemName"),
                field: "catalogueItemName"
            },
            {
                headerName: t("Category"),
                field: "itemCategory"
            },
            {
                headerName: t("ItemDescription"),
                field: "description",
                tooltipComponent: "customTooltip",
                tooltipField: "description",
                tooltipComponentParams: {
                    fieldTooltip: "description",
                    isShow: true
                }
            },
            {
                headerName: t("Model"),
                field: "itemModel"
            },
            {
                headerName: t("Size"),
                field: "itemSize"
            },
            {
                headerName: t("Brand"),
                field: "itemBrand"
            },
            {
                headerName: t("Currency"),
                field: "currencyCode"
            },
            {
                headerName: t("UnitPrice"),
                field: "unitPrice",
                minWidth: 150,
                filter: "agNumberColumnFilter",
                valueFormatter: (params) => params.value,
                cellStyle: { textAlign: "right" }
            },
            {
                headerName: t("UOMForecast"),
                field: "uomCode",
                minWidth: 150
            },
            {
                headerName: t("CatalogueType"),
                field: "itemType",
                valueGetter: ({ data }) => (data.supplierUuid ? "Supplier Catalogue" : "Generic"),
                minWidth: 200
            },
            {
                headerName: t("UpdatedOn"),
                field: "updatedOn",
                minWidth: 200
            }
        ];
    }

    getProjects(companyUuid) {
        const url = CONFIG.LIST_PROJECT_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getProjectDetail(companyUuid, projectCode) {
        const url = CONFIG.PROJECT_DETAIL_URL.replace("{companyUuid}", companyUuid).replace("{projectCode}", projectCode);
        return axios.get(url);
    }

    getProjectForecastDetail(companyUuid, projectCode) {
        const url = CONFIG.PROJECT_FORECAST_DETAIL_URL.replace("{companyUuid}", companyUuid).replace("{projectCode}", projectCode);
        return axios.get(url);
    }

    saveProjectForecast(companyUuid, body) {
        const url = CONFIG.PROJECT_FORECAST_SAVE_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    closeProjectForecast(companyUuid, projectCode) {
        const url = CONFIG.PROJECT_CLOSE.replace("{companyUuid}", companyUuid).replace("{projectCode}", projectCode);
        return axios.post(url);
    }
}

export default new ProjectForecastService();
