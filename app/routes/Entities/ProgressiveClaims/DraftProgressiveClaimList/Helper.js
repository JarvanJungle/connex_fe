import i18next from "i18next";
import {
    convertDate2String,
    formatNumberForRow,
    formatNumberPercentForRow,
    toFixedWithoutRounded,
    numberParser,
    numberParserPercent
} from "helper/utilities";
import { formatDateTime, formatMonth } from "../../../P2P/Invoice/helper/utilities";
import CUSTOM_CONSTANTS from "../../../../helper/constantsDefined";

const textCustomStatusComparator = (filter, value, filterText) => {
    const filterTextLowerCase = filterText.toLowerCase().replaceAll(" ", "_");
    const valueLowerCase = value.toString().toLowerCase();
    switch (filter) {
    case "contains":
        return valueLowerCase.indexOf(filterTextLowerCase) >= 0;
    case "notContains":
        return valueLowerCase.indexOf(filterTextLowerCase) === -1;
    case "equals":
        return valueLowerCase === filterTextLowerCase;
    case "notEqual":
        return valueLowerCase != filterTextLowerCase;
    case "startsWith":
        return valueLowerCase.indexOf(filterTextLowerCase) === 0;
    case "endsWith": {
        const index = valueLowerCase.lastIndexOf(filterTextLowerCase);
        const endNum = valueLowerCase.length - filterTextLowerCase.length;
        return index >= 0 && index === endNum;
    }
    default:
        // should never happen
        console.warn(`invalid filter type ${filter}`);
        return false;
    }
};

export const DPC_STATUS = {
    CREATED: "CREATED",
    PENDING_ACKNOWLEDGEMENT: "PENDING_ACKNOWLEDGEMENT",
    SENT_BACK_TO_MAIN_CONTRACTOR: "SENT_BACK_TO_MAIN_CONTRACTOR",
    REJECTED: "REJECTED",
    PENDING_SUBMISSION: "PENDING_SUBMISSION",
    PENDING_VALUATION: "PENDING_VALUATION",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    SENT_BACK: "SENT_BACK",
    RECALLED: "RECALLED",
    PENDING_SUBMISSION_TO_MAIN_QS: "PENDING_SUBMISSION_TO_MAIN_QS",
    SUBMITTED_EVALUATION: "SUBMITTED_EVALUATION",
    PENDING_REVERT: "PENDING_REVERT",
    RECALLED_BY_QS: "RECALLED_BY_QS",
    PENDING_ACKNOWLEDGE_DRAFT_VALUATION: "PENDING_ACKNOWLEDGE_DRAFT_VALUATION",
    PENDING_OFFICIAL_CLAIMS_SUBMISSION: "PENDING_OFFICIAL_CLAIMS_SUBMISSION",
    CONVERTED_TO_OFFICIAL_CLAIMS: "CONVERTED_TO_OFFICIAL_CLAIMS",
    PENDING_ISSUE: "PENDING_ISSUE",
    CANCELLED: "CANCELLED"
};

export const DraftProgressClaimListColumnDefsForSupplier = [
    {
        headerName: i18next.t("Draft Progress Claim No."),
        field: "dpcNumber"
    },
    {
        headerName: i18next.t("Developer Name"),
        field: "developerName"
    },
    {
        headerName: i18next.t("Status"),
        field: "dpcStatus",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.replaceAll("_", " ");
            return value;
        },
        filterParams: {
            textCustomComparator: textCustomStatusComparator
        },
        filter: "agTextColumnFilter"
    },
    {
        headerName: i18next.t("Payment Claim Reference Month"),
        field: "paymentClaimReferenceMonth",
        cellRenderer: formatMonth
    },
    {
        headerName: i18next.t("This Claim"),
        field: "thisClaim",
        cellRenderer: (params) => {
            const { value, data: { currencyCode = "" } } = params;
            return `${currencyCode} ${formatNumberForRow({ value })}`;
        }
    },
    {
        headerName: i18next.t("This Certified"),
        field: "thisCertified",
        cellRenderer: (params) => {
            const { value, data: { currencyCode = "" } } = params;
            return `${currencyCode} ${formatNumberForRow({ value })}`;
        }
    },
    {
        headerName: i18next.t("Payment Claim Reference No."),
        field: "paymentClaimReferenceNo"
    },
    {
        headerName: i18next.t("Developer Work Order No."),
        field: "dwoNumber"
    },
    {
        headerName: i18next.t("Work Order Title"),
        field: "workOrderTitle"
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode"
    },
    {
        headerName: i18next.t("Project Trade"),
        field: "tradeCode"
    },
    {
        headerName: i18next.t("Update at"),
        field: "updatedDate",
        sort: "desc",
        cellRenderer: formatDateTime
    },
    {
        headerName: i18next.t("Issued By"),
        field: "issuedBy"
    },
    {
        headerName: i18next.t("Responded By"),
        field: "respondedBy"
    },
    {
        headerName: i18next.t("Acknowledged By"),
        field: "acknowledgedBy"
    }
];

export const DraftProgressClaimListColumnDefsForBuyer = [
    {
        headerName: i18next.t("Draft Progress Claim No."),
        field: "dpcNumber"
    },
    {
        headerName: i18next.t("Main contractor Name"),
        field: "mainContractorName"
    },
    {
        headerName: i18next.t("Status"),
        field: "dpcStatus",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.replaceAll("_", " ");
            return value;
        },
        filterParams: {
            textCustomComparator: textCustomStatusComparator
        },
        filter: "agTextColumnFilter"
    },
    {
        headerName: i18next.t("Payment Claim Reference Month"),
        field: "paymentClaimReferenceMonth",
        cellRenderer: formatMonth
    },
    {
        headerName: i18next.t("This Claim"),
        field: "thisClaim",
        cellRenderer: (params) => {
            const { value, data: { currencyCode = "" } } = params;
            return `${currencyCode} ${formatNumberForRow({ value })}`;
        }
    },
    {
        headerName: i18next.t("This Certified"),
        field: "thisCertified",
        cellRenderer: (params) => {
            const { value, data: { currencyCode = "" } } = params;
            return `${currencyCode} ${formatNumberForRow({ value })}`;
        }
    },
    {
        headerName: i18next.t("Payment Claim Reference No."),
        field: "paymentClaimReferenceNo"
    },
    {
        headerName: i18next.t("Developer Work Order No."),
        field: "dwoNumber"
    },
    {
        headerName: i18next.t("Work Order Title"),
        field: "workOrderTitle"
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode"
    },
    {
        headerName: i18next.t("Update at"),
        field: "updatedDate",
        sort: "desc",
        cellRenderer: formatDateTime
    },
    {
        headerName: i18next.t("Claimed By"),
        field: "claimedBy"
    },
    {
        headerName: i18next.t("Responded By"),
        field: "respondedBy"
    },
    {
        headerName: i18next.t("Acknowledged By"),
        field: "acknowledgedBy"
    }
];

export const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

export const initialValues = {
    dpcNumber: "",
    dwoNumber: "",
    dpcStatus: "",
    vendorCode: "",
    vendorName: "",
    contactName: "",
    contactEmail: "",
    contactNumber: "",
    countryName: "",
    companyRegistrationNo: "",
    paymentClaimReferenceNo: "",
    paymentClaimReferenceMonth: "",
    claimPeriodStartDate: "",
    claimPeriodEndDate: "",
    workOrderTitle: "",
    contractType: "",
    paymentResponseReferenceNo: "",
    claimDate: "",
    approvalRouteUuid: "",
    originalContractSum: "",
    bqContingencySum: "",
    remeasuredContractSum: "",
    agreedVariationOrderSum: "",
    adjustedContractSum: "",
    retentionPercentage: "",
    retentionCappedPercentage: "",
    retentionAmountCappedAt: "",
    cumulativeCertMainconWorks: "",
    cumulativeCertUnfixedGoodsMaterials: "",
    cumulativeAgreedVariationOrder: "",
    cumulativeClaimed: ""
};

export const workSpaceConvertColumnDef = [
    {
        headerName: "MAIN-CON CLAIM",
        children: [
            {
                headerName: "Previously Cumulative Claimed",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "previouslyActualCumulativeClaimedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "previouslyActualCumulativeClaimedAmount",
                        cellRenderer: formatNumberPercentForRow
                    }
                ]
            },
            {
                headerName: "Cumulative Claimed",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "cumulativeDraftClaimedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "cumulativeDraftClaimedAmount",
                        cellRenderer: formatNumberPercentForRow
                    }
                ]
            },
            {
                headerName: "Current Claim",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "currentDraftClaimedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "currentDraftClaimedAmount",
                        cellRenderer: formatNumberPercentForRow
                    }
                ]
            }
        ]
    },
    {
        headerName: "DEVELOPER CERTIFICATION",
        children: [
            {
                headerName: "Previously Cumulative Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "previouslyActualCumulativeCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "previouslyActualCumulativeCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            },
            {
                headerName: "Cumulative Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "cumulativeDraftCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "cumulativeDraftCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            },
            {
                headerName: "Current Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "currentDraftCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "currentDraftCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            }
        ]
    },
    {
        headerName: "ARCHITECT CERTIFICATION",
        children: [
            {
                headerName: "Previously Cumulative Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "previouslyActualCumulativeCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "previouslyActualCumulativeCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            },
            {
                headerName: "Cumulative Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "cumulativeDraftCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "cumulativeDraftCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            },
            {
                headerName: "Current Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "currentDraftCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "currentDraftCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            }
        ]
    },
    {
        headerName: "Total Contract",
        children: [
            {
                headerName: "",
                children: [
                    {
                        headerName: "Weightage",
                        minWidth: 150,
                        field: "weightage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "amount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            }
        ]
    }
];

export const workSpaceColumnDef = [
    {
        headerName: "MAIN-CON CLAIM",
        children: [
            {
                headerName: "Previously Cumulative Claimed",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "previouslyActualCumulativeClaimedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "previouslyActualCumulativeClaimedAmount",
                        cellRenderer: formatNumberPercentForRow
                    }
                ]
            },
            {
                headerName: "Cumulative Claimed",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "cumulativeDraftClaimedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "cumulativeDraftClaimedAmount",
                        cellRenderer: formatNumberPercentForRow
                    }
                ]
            },
            {
                headerName: "Current Claim",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "currentDraftClaimedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "currentDraftClaimedAmount",
                        cellRenderer: formatNumberPercentForRow
                    }
                ]
            }
        ]
    },
    {
        headerName: "ARCHITECT CERTIFICATION",
        children: [
            {
                headerName: "Previously Cumulative Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "previouslyActualCumulativeCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "previouslyActualCumulativeCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            },
            {
                headerName: "Cumulative Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "cumulativeDraftCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "cumulativeDraftCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            },
            {
                headerName: "Current Certified",
                children: [
                    {
                        headerName: "Percentage",
                        minWidth: 150,
                        field: "currentDraftCertifiedPercentage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "currentDraftCertifiedAmount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            }
        ]
    },
    {
        headerName: "Total Contract",
        children: [
            {
                headerName: "",
                children: [
                    {
                        headerName: "Weightage",
                        minWidth: 150,
                        field: "weightage",
                        cellRenderer: formatNumberPercentForRow
                    },
                    {
                        headerName: "Amount",
                        minWidth: 150,
                        field: "amount",
                        cellRenderer: formatNumberForRow
                    }
                ]
            }
        ]
    }
];

export const originalSummary = [
    {
        headerName: i18next.t("Work Code"),
        field: "workCode"
    },
    {
        headerName: i18next.t("Description"),
        field: "description"
    },
    {
        headerName: i18next.t("Weightage"),
        field: "weightage",
        valueParser: numberParser,
        valueGetter: (params) => (params.data.weightage || 0) * 100,
        cellRenderer: formatNumberPercentForRow
    },
    {
        headerName: i18next.t("Total Amount"),
        field: "totalAmount",
        valueParser: numberParser,
        cellRenderer: formatNumberForRow
    },
    {
        headerName: i18next.t("Retention Percentage (%)"),
        field: "retentionPercentage",
        valueParser: numberParser,
        cellRenderer: formatNumberPercentForRow
    },
    {
        headerName: i18next.t("Select Evaluators"),
        field: "evaluators",
        editable: false,
        cellRenderer: "evaluatorCellRenderer"
    },
    {
        headerName: i18next.t("Selected Evaluator(s)"),
        field: "evaluators",
        editable: false,
        cellRenderer: "evaluatorSelectedCellRenderer"
    }
];

export const originalOrder = [
    {
        headerName: "Work",
        children: [
            {
                headerName: "Work Code",
                minWidth: 150,
                field: "workCode"
            },
            {
                headerName: "Work Description",
                minWidth: 150,
                field: "description"
            },
            {
                headerName: "UOM",
                minWidth: 150,
                field: "uom",
                valueFormatter: (params) => params.value?.uomName,
                cellEditor: "agRichSelectCellEditor",
                cellEditorParams: {
                    values: []
                }
            },
            {
                headerName: "Weightage",
                minWidth: 150,
                field: "weightage",
                valueParser: numberParser,
                valueGetter: (params) => {
                    let total = 0;
                    params.api.forEachNode((item) => {
                        const { level, aggData, data: { quantity = 0, unitPrice = 0, totalAmount = 0 } } = item;
                        if (level === 0) {
                            total += (aggData?.totalAmount || (quantity * unitPrice) || totalAmount || 0);
                        }
                    });
                    const { data } = params;
                    const { aggData } = params.node;
                    const { totalAmount = 0, quantity = 0, unitPrice = 0 } = data;
                    const totalAmountValue = Number(quantity) * Number(unitPrice) || aggData?.totalAmount || totalAmount;
                    return (totalAmountValue / total) * 100;
                },
                cellRenderer: (params) => {
                    const { value = 0 } = params;
                    return value ? `${(value).toFixed(2)} %` : "";
                }
            }
        ]
    },
    {
        headerName: "Contract",
        children: [
            // [A]
            {
                headerName: "Quantity",
                minWidth: 150,
                field: "quantity",
                valueParser: numberParser
            },
            // [B]
            {
                headerName: "Unit Price",
                minWidth: 150,
                field: "unitPrice",
                valueParser: numberParser
            },
            // [C] = [A] * [B]
            {
                headerName: "Total Amount",
                field: "totalAmount",
                minWidth: 150,
                valueParser: numberParser,
                valueGetter: (params) => {
                    const { data } = params;
                    const { totalAmount = 0, quantity = 0, unitPrice = 0 } = data;
                    const totalAmountValue = Number(quantity) * Number(unitPrice) || totalAmount;
                    params.data.totalAmount = totalAmountValue;
                    return totalAmountValue;
                },
                aggFunc: "sum",
                cellRenderer: formatNumberForRow
            },
            {
                headerName: "Remarks",
                minWidth: 150,
                field: "remarks"
            }
        ]
    },
    {
        headerName: "Retention",
        minWidth: 150,
        editable: true,
        field: "retention",
        cellRenderer: "haveRetentionRenderer",
        cellClass: "d-flex align-items-center pb-4"
    },
    {
        headerName: "MAIN-CONTRACTOR CLAIM",
        children: [
            {
                headerName: "Previously Cumulative Claimed",
                children: [
                    {
                        headerName: "Actual Claim",
                        children: [
                            // [1]
                            {
                                headerName: "Quantity",
                                minWidth: 150,
                                field: "previouslyActualCumulativeClaimedQty",
                                valueParser: numberParser,
                                cellRenderer: (params) => {
                                    if (params.node.__hasChildren) {
                                        return null;
                                    }
                                    return params.value ? `${(params.value).toFixed(2)} %` : "";
                                }
                            },
                            // [2]
                            {
                                headerName: "Percentage",
                                minWidth: 150,
                                field: "previouslyActualCumulativeClaimedPercentage",
                                valueParser: numberParser,
                                cellRenderer: formatNumberPercentForRow
                            },
                            // [3]
                            {
                                headerName: "Amount",
                                minWidth: 150,
                                editable: true,
                                field: "previouslyActualCumulativeClaimedAmount",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        previouslyActualCumulativeClaimedQty = 0,
                                        unitPrice = 0
                                    } = data;
                                    return Number(previouslyActualCumulativeClaimedQty)
                                        * Number(unitPrice);
                                },
                                aggFunc: "sum",
                                cellRenderer: formatNumberForRow
                            }
                        ]
                    }
                ]
            },
            {
                headerName: "Cumulative Claimed",
                children: [
                    {
                        headerName: "Draft Claim",
                        children: [
                            // [4]
                            {
                                headerName: "Quantity",
                                minWidth: 150,
                                field: "cumulativeDraftClaimedQty",
                                valueParser: numberParser,
                                onCellValueChanged: (params) => {
                                    const { data, node, api } = params;
                                    const { quantity = 0, cumulativeDraftClaimedPercentage = 0, cumulativeDraftClaimedQty = 0 } = data;
                                    const valueCal = Number(cumulativeDraftClaimedQty) / Number(quantity) * 100;
                                    if (valueCal != cumulativeDraftClaimedPercentage) {
                                        params.node.setDataValue("cumulativeDraftClaimedPercentage", valueCal);
                                        setTimeout(() => api.refreshClientSideRowModel("aggregate"), 100);
                                    }
                                },
                                cellRenderer: (params) => {
                                    if (params.node.__hasChildren) {
                                        return null;
                                    }
                                    return params && params.value ? `${params.value.toFixed(2)}` : 0;
                                }
                            },
                            // [5]
                            {
                                headerName: "Percentage",
                                minWidth: 150,
                                field: "cumulativeDraftClaimedPercentage",
                                valueParser: numberParser,
                                onCellValueChanged: (params) => {
                                    const { data, api } = params;
                                    const { quantity = 0, cumulativeDraftClaimedPercentage = 0, cumulativeDraftClaimedQty = 0 } = data;
                                    const valueCal = Number(quantity) * Number(cumulativeDraftClaimedPercentage) / 100;
                                    if (valueCal != cumulativeDraftClaimedQty) {
                                        params.node.setDataValue("cumulativeDraftClaimedQty", valueCal);
                                        setTimeout(() => api.refreshClientSideRowModel("aggregate"), 100);
                                    }
                                },
                                aggFunc: (params) => {
                                    const { rowNode, data, api } = params;
                                    if (data) {
                                        const valueCal = Number(rowNode?.aggData?.cumulativeDraftClaimedAmount || 0) / (Number(rowNode?.aggData?.totalAmount || 1) || 1) * 100;
                                        return valueCal;
                                    }
                                },
                                cellRenderer: formatNumberPercentForRow
                            },
                            // [6] = [4] * [B]
                            {
                                headerName: "Amount",
                                minWidth: 150,
                                field: "cumulativeDraftClaimedAmount",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const { cumulativeDraftClaimedAmount = 0, cumulativeDraftClaimedQty = 0, unitPrice = 0 } = data;
                                    const totalAmountValue = Number(cumulativeDraftClaimedQty) * Number(unitPrice) || cumulativeDraftClaimedAmount;
                                    params.data.cumulativeDraftClaimedAmount = totalAmountValue;
                                    return totalAmountValue;
                                },
                                aggFunc: "sum",
                                cellRenderer: formatNumberForRow
                            }
                        ]
                    }
                ]
            },
            {
                headerName: "Current Claim",
                children: [
                    {
                        headerName: "Draft Claim",
                        children: [
                            // [7] = [4] - [1]
                            {
                                headerName: "Quantity",
                                minWidth: 150,
                                field: "currentDraftClaimedQty",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftClaimedQty = 0,
                                        previouslyActualCumulativeClaimedQty = 0
                                    } = data;
                                    const currentDraftClaimedQty = Number(cumulativeDraftClaimedQty) - Number(previouslyActualCumulativeClaimedQty);
                                    params.data.currentDraftClaimedQty = currentDraftClaimedQty;
                                    return currentDraftClaimedQty;
                                },
                                cellRenderer: (params) => {
                                    if (params.node.__hasChildren) {
                                        return null;
                                    }
                                    return params && params.value ? `${params.value.toFixed(2)}` : 0;
                                }
                            },
                            // [8] = [5] - [2]
                            {
                                headerName: "Percentage",
                                minWidth: 150,
                                field: "currentDraftClaimedPercentage",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftClaimedPercentage = 0,
                                        previouslyActualCumulativeClaimedPercentage = 0
                                    } = data;
                                    const currentDraftClaimedPercentage = Number(cumulativeDraftClaimedPercentage) - Number(previouslyActualCumulativeClaimedPercentage);
                                    params.data.currentDraftClaimedPercentage = currentDraftClaimedPercentage;
                                    return currentDraftClaimedPercentage;
                                },
                                aggFunc: (params) => {
                                    const { rowNode, data, api } = params;
                                    if (data) {
                                        const valueCal = Number(rowNode?.aggData?.cumulativeDraftClaimedPercentage || 0) - (Number(rowNode?.aggData?.previouslyActualCumulativeClaimedPercentage || 0));
                                        return valueCal;
                                    }
                                },
                                cellRenderer: formatNumberPercentForRow
                            },
                            // [9] = [6] - [3]
                            {
                                headerName: "Amount",
                                minWidth: 150,
                                field: "currentDraftClaimedAmount",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftClaimedAmount = 0,
                                        previouslyActualCumulativeClaimedAmount = 0
                                    } = data;
                                    const currentDraftClaimedAmount = Number(cumulativeDraftClaimedAmount) - Number(previouslyActualCumulativeClaimedAmount);
                                    params.data.currentDraftClaimedAmount = currentDraftClaimedAmount;
                                    return currentDraftClaimedAmount;
                                },
                                aggFunc: (params) => {
                                    const { rowNode, data, api } = params;
                                    if (data) {
                                        const valueCal = Number(rowNode?.aggData?.cumulativeDraftClaimedAmount || 0) - (Number(rowNode?.aggData?.previouslyActualCumulativeClaimedAmount || 0));
                                        return valueCal;
                                    }
                                },
                                cellRenderer: formatNumberForRow
                            },
                            {
                                headerName: "Remarks",
                                field: "currentDraftClaimedRemarks",
                                minWidth: 150
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        headerName: "ARCHITECT CERTIFICATION",
        children: [
            {
                headerName: "Previously Cumulative Certified",
                children: [
                    {
                        headerName: "Actual Certification",
                        children: [
                            // [10]
                            {
                                headerName: "Quantity",
                                minWidth: 150,
                                editable: true,
                                field: "previouslyActualCumulativeCertifiedQty",
                                valueParser: numberParser,
                                cellRenderer: (params) => {
                                    if (params.node.__hasChildren) {
                                        return null;
                                    }
                                    return params && params.value ? `${params.value.toFixed(2)}` : 0;
                                }
                            },
                            // [11]
                            {
                                headerName: "Percentage",
                                minWidth: 150,
                                editable: true,
                                field: "previouslyActualCumulativeCertifiedPercentage",
                                valueParser: numberParser,
                                cellRenderer: formatNumberPercentForRow
                            },
                            // [12]
                            {
                                headerName: "Amount",
                                minWidth: 150,
                                editable: true,
                                field: "previouslyActualCumulativeCertifiedAmount",
                                valueParser: numberParser,
                                cellRenderer: formatNumberForRow
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        headerName: "QS CERTIFICATION",
        children: [
            {
                headerName: "Cumulative Certified",
                children: [
                    {
                        headerName: "Draft Certification",
                        children: [
                            {
                                headerComponent: "haveCertifyHeaderRenderer",
                                headerName: "Certified All",
                                minWidth: 150,
                                field: "certify",
                                cellRenderer: "haveCertifyRenderer",
                                cellClass: "d-flex align-items-center pb-4"
                            },
                            // [13]
                            {
                                headerName: "Quantity",
                                minWidth: 150,
                                editable: true,
                                field: "cumulativeDraftCertifiedQty",
                                valueParser: numberParser,
                                onCellValueChanged: (params) => {
                                    const { data, node, api } = params;
                                    const {
                                        quantity = 0, cumulativeDraftCertifiedQty = 0, cumulativeDraftCertifiedPercentage = 0, cumulativeDraftClaimedPercentage = 0
                                    } = data;
                                    const valueCal = Number(cumulativeDraftCertifiedQty) / (Number(quantity) || 1) * 100;
                                    if (valueCal != cumulativeDraftCertifiedPercentage) {
                                        params.node.setDataValue("certify", valueCal == (cumulativeDraftClaimedPercentage || 0).toFixed(2));
                                        params.node.setDataValue("cumulativeDraftCertifiedPercentage", valueCal);
                                        setTimeout(() => api.refreshClientSideRowModel("aggregate"), 100);
                                    }
                                    params.data.cumulativeDraftCertifiedQty = cumulativeDraftCertifiedQty;
                                },
                                cellRenderer: (params) => {
                                    if (params.node.__hasChildren) {
                                        return null;
                                    }
                                    return params && params.value ? `${params.value.toFixed(2)}` : 0;
                                }
                            },
                            // [14]
                            {
                                headerName: "Percentage",
                                minWidth: 150,
                                editable: true,
                                field: "cumulativeDraftCertifiedPercentage",
                                valueParser: numberParser,
                                onCellValueChanged: (params) => {
                                    const { data, api } = params;
                                    const {
                                        quantity = 0, cumulativeDraftCertifiedPercentage = 0, cumulativeDraftCertifiedQty = 0, cumulativeDraftClaimedQty = 0
                                    } = data;
                                    const valueCal = Number(quantity) * Number(cumulativeDraftCertifiedPercentage) / 100;
                                    if (valueCal != cumulativeDraftCertifiedQty) {
                                        params.node.setDataValue("certify", valueCal == (cumulativeDraftClaimedQty || 0).toFixed(2));
                                        params.node.setDataValue("cumulativeDraftCertifiedQty", valueCal);
                                        setTimeout(() => api.refreshClientSideRowModel("aggregate"), 100);
                                    }
                                    params.data.cumulativeDraftCertifiedPercentage = cumulativeDraftCertifiedPercentage;
                                },
                                aggFunc: (params) => {
                                    const { rowNode, data, api } = params;
                                    if (data) {
                                        const valueCal = Number(rowNode?.aggData?.cumulativeDraftCertifiedAmount || 0) / (Number(rowNode?.aggData?.totalAmount || 1) || 1) * 100;
                                        return valueCal;
                                    }
                                },
                                cellRenderer: formatNumberPercentForRow
                            },
                            // [15]
                            {
                                headerName: "Amount",
                                minWidth: 150,
                                editable: true,
                                field: "cumulativeDraftCertifiedAmount",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const { cumulativeDraftCertifiedAmount = 0, cumulativeDraftCertifiedQty = 0, unitPrice = 0 } = data;
                                    const totalAmountValue = Number(cumulativeDraftCertifiedQty) * Number(unitPrice) || cumulativeDraftCertifiedAmount;
                                    params.data.cumulativeDraftCertifiedAmount = totalAmountValue;
                                    return totalAmountValue;
                                },
                                aggFunc: "sum",
                                cellRenderer: formatNumberForRow
                            }
                        ]
                    }
                ]
            },
            {
                headerName: "Current Certified",
                children: [
                    {
                        headerName: "Draft Certification",
                        children: [
                            // [16] = [13] - [10]
                            {
                                headerName: "Quantity",
                                minWidth: 150,
                                editable: true,
                                field: "currentDraftCertifiedQty",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftCertifiedQty = 0, currentDraftCertifiedQty = 0, previouslyActualCumulativeCertifiedQty = 0, unitPrice = 0
                                    } = data;
                                    const totalAmountValue = Number(cumulativeDraftCertifiedQty) - Number(previouslyActualCumulativeCertifiedQty) || currentDraftCertifiedQty;
                                    params.data.currentDraftCertifiedQty = totalAmountValue;
                                    return totalAmountValue;
                                },
                                cellRenderer: (params) => {
                                    if (params.node.__hasChildren) {
                                        return null;
                                    }
                                    return params.value ? params.value.toFixed(2) : 0;
                                }
                            },
                            // [17] = [14] - [11]
                            {
                                headerName: "Percentage",
                                minWidth: 150,
                                editable: true,
                                field: "currentDraftCertifiedPercentage",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftCertifiedPercentage = 0, currentDraftCertifiedPercentage = 0, previouslyActualCumulativeCertifiedPercentage = 0, unitPrice = 0
                                    } = data;
                                    const totalAmountValue = Number(cumulativeDraftCertifiedPercentage) - Number(previouslyActualCumulativeCertifiedPercentage) || currentDraftCertifiedPercentage;
                                    params.data.currentDraftCertifiedPercentage = totalAmountValue;
                                    return totalAmountValue;
                                },
                                aggFunc: (params) => {
                                    const { rowNode, data, api } = params;
                                    if (data) {
                                        const valueCal = Number(rowNode?.aggData?.cumulativeDraftCertifiedPercentage || 0) - (Number(rowNode?.aggData?.previouslyActualCumulativeCertifiedPercentage || 0));
                                        return valueCal;
                                    }
                                },
                                cellRenderer: formatNumberPercentForRow
                            },
                            // [18] = [15] - [12]
                            {
                                headerName: "Amount",
                                minWidth: 150,
                                editable: true,
                                field: "currentDraftCertifiedAmount",
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftCertifiedAmount = 0, currentDraftCertifiedAmount = 0, previouslyActualCumulativeCertifiedAmount = 0, unitPrice = 0
                                    } = data;
                                    const totalAmountValue = Number(cumulativeDraftCertifiedAmount) - Number(previouslyActualCumulativeCertifiedAmount) || currentDraftCertifiedAmount;
                                    params.data.currentDraftCertifiedAmount = totalAmountValue;
                                    return totalAmountValue;
                                },
                                aggFunc: (params) => {
                                    const { rowNode, data, api } = params;
                                    if (data) {
                                        const valueCal = Number(rowNode?.aggData?.cumulativeDraftCertifiedAmount || 0) - (Number(rowNode?.aggData?.previouslyActualCumulativeCertifiedAmount || 0));
                                        params.data.currentDraftCertifiedAmount = valueCal;
                                        return valueCal;
                                    }
                                },
                                cellRenderer: formatNumberForRow
                            },
                            {
                                headerName: "Remarks",
                                minWidth: 150,
                                editable: true,
                                field: "currentDraftCertifiedRemarks"
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        headerName: "Claim vs Certification",
        children: [
            {
                headerName: "Pending to Certify",
                children: [
                    {
                        headerName: "",
                        children: [
                            // [19] = [4] - [13]
                            // [19] = [4] - [10] Supplier and Status is CREATED, RECALLED, PENDING_ACKNOWLEDGEMENT, SENT_BACK
                            {
                                headerName: "Quantity",
                                minWidth: 150,
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftClaimedQty = 0,
                                        cumulativeDraftCertifiedQty = 0,
                                        previouslyActualCumulativeCertifiedQty = 0,
                                        isPendingItemStatus
                                    } = data;
                                    const devideNumber = isPendingItemStatus ? previouslyActualCumulativeCertifiedQty : cumulativeDraftCertifiedQty;
                                    return Number(cumulativeDraftClaimedQty) - Number(devideNumber);
                                },
                                cellRenderer: (params) => {
                                    if (params.node.__hasChildren) {
                                        return null;
                                    }
                                    return params.value ? params.value.toFixed(2) : 0;
                                }
                            },
                            // [21] = [5] - [14]
                            // [21] = [5] - [11] Supplier and Status is CREATED, RECALLED, PENDING_ACKNOWLEDGEMENT, SENT_BACK
                            {
                                headerName: "Percentage",
                                valueParser: numberParser,
                                minWidth: 150,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftClaimedPercentage = 0,
                                        cumulativeDraftCertifiedPercentage = 0,
                                        previouslyActualCumulativeCertifiedPercentage = 0,
                                        isPendingItemStatus
                                    } = data;
                                    const devideNumber = isPendingItemStatus ? previouslyActualCumulativeCertifiedPercentage : cumulativeDraftCertifiedPercentage;
                                    return Number(cumulativeDraftClaimedPercentage) - Number(devideNumber);
                                },
                                aggFunc: (params) => {
                                    const { rowNode, data, api } = params;
                                    if (data) {
                                        const devideNumber = data.isPendingItemStatus ? rowNode?.aggData?.previouslyActualCumulativeCertifiedPercentage : rowNode?.aggData?.cumulativeDraftCertifiedPercentage;
                                        const valueCal = Number(rowNode?.aggData?.cumulativeDraftClaimedPercentage || 0) - (Number(devideNumber || 0));
                                        return valueCal;
                                    }
                                },
                                cellRenderer: formatNumberPercentForRow
                            },
                            // [22] = [6] - [15]
                            // [22] = [6] - [12] Supplier and Status is CREATED, RECALLED, PENDING_ACKNOWLEDGEMENT, SENT_BACK
                            {
                                headerName: "Amount",
                                minWidth: 150,
                                valueParser: numberParser,
                                valueGetter: (params) => {
                                    const { data } = params;
                                    const {
                                        cumulativeDraftClaimedAmount = 0,
                                        cumulativeDraftCertifiedAmount = 0,
                                        previouslyActualCumulativeCertifiedAmount = 0,
                                        isPendingItemStatus
                                    } = data;
                                    const devideNumber = isPendingItemStatus ? previouslyActualCumulativeCertifiedAmount : cumulativeDraftCertifiedAmount;
                                    return Number(cumulativeDraftClaimedAmount) - Number(devideNumber);
                                },
                                aggFunc: (params) => {
                                    const { rowNode, data, api } = params;
                                    if (data) {
                                        const devideNumber = data.isPendingItemStatus ? rowNode?.aggData?.previouslyActualCumulativeCertifiedAmount : rowNode?.aggData?.cumulativeDraftCertifiedAmount;
                                        const valueCal = Number(rowNode?.aggData?.cumulativeDraftClaimedAmount || 0) - (Number(devideNumber || 0));
                                        return valueCal;
                                    }
                                },
                                cellRenderer: formatNumberForRow
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

export const unfixedSummary = [
    {
        headerName: i18next.t("Work Code"),
        field: "workCode",
        minWidth: 150
    },
    {
        headerName: i18next.t("Description"),
        field: "description",
        minWidth: 150
    },
    {
        headerName: i18next.t("Weightage"),
        field: "weightage",
        minWidth: 150,
        valueParser: numberParser,
        valueGetter: (params) => (params.data.weightage || 0) * 100,
        cellRenderer: formatNumberPercentForRow
    },
    {
        headerName: i18next.t("Total Amount"),
        field: "totalAmount",
        minWidth: 150,
        valueParser: numberParser,
        cellRenderer: formatNumberForRow
    },
    {
        headerName: i18next.t("Retention Percentage (%)"),
        field: "retentionPercentage",
        minWidth: 150,
        cellRenderer: (params) => {
            const { value = 0 } = params;
            return value ? `${toFixedWithoutRounded(value, 2)} %` : "";
        },
        editable: (params) => !params.draftItem,
        valueParser: numberParser
    },
    {
        headerName: i18next.t("Select Evaluators"),
        field: "quantitySurveyors",
        cellRenderer: "evaluatorCellRenderer",
        minWidth: 150
    },
    {
        headerName: i18next.t("Selected Evaluator(s)"),
        field: "quantitySurveyors",
        minWidth: 150,
        cellRenderer: "SelectedEvaluatorRenderer"
    }
];

export const unfixedGroup = [
    {
        headerName: "MAIN-CONTRACTOR CLAIM",
        children: [
            {
                headerName: "Code",
                minWidth: 150,
                field: "workCode"
            },
            {
                headerName: "Description",
                minWidth: 150,
                field: "description"
            },
            {
                headerName: "UOM",
                minWidth: 150,
                field: "uom",
                valueFormatter: (params) => params.value?.uomName,
                cellEditor: "agRichSelectCellEditor",
                cellEditorParams: {
                    values: []
                }
            },
            {
                headerName: "Delivery Order No.",
                minWidth: 150,
                field: "deliveryOrder"
            },
            {
                headerName: "Delivery Order Date",
                minWidth: 150,
                field: "deliveryOrderDate",
                cellEditor: "datePicker",
                cellRenderer: (params) => {
                    const { value } = params;
                    if (value) {
                        return convertDate2String(
                            new Date(value),
                            CUSTOM_CONSTANTS.DDMMYYYY
                        );
                    }
                    return convertDate2String(new Date(), CUSTOM_CONSTANTS.DDMMYYYY);
                }
                // valueGetter: (params) => {
                //     if (!params.data.deliveryOrderDate) {
                //         params.data.deliveryOrderDate = convertDate2String(
                //             new Date(),
                //             CUSTOM_CONSTANTS.DDMMYYYY
                //         );
                //     }
                //     return params.data.deliveryOrderDate;
                // }
            },
            {
                headerName: "Attachment",
                minWidth: 350,
                field: "attachment",
                cellRenderer: "addAttachment",
                cellStyle: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }
            },
            {
                headerName: "Qty Claim",
                minWidth: 150,
                field: "mainConClaimQty",
                valueParser: numberParser
            },
            {
                headerName: "Unit Price",
                minWidth: 150,
                field: "mainConClaimUnitPrice",
                valueParser: numberParser
            },
            {
                headerName: "Total Amount",
                minWidth: 150,
                valueGetter: (params) => {
                    const { data } = params;
                    const { mainConClaimQty = 0, mainConClaimUnitPrice = 0 } = data;
                    return Number(mainConClaimQty) * Number(mainConClaimUnitPrice);
                },
                field: "mainConClaimTotalAmount",
                aggFunc: "sum",
                cellRenderer: formatNumberForRow
            },
            {
                headerName: "Remarks",
                minWidth: 150,
                field: "mainConClaimRemarks"
            }
        ]
    },
    {
        headerName: "Retention",
        minWidth: 150,
        cellRenderer: "haveRetentionRenderer",
        cellClass: "d-flex align-items-center pb-4",
        field: "retention"
    },
    {
        headerName: "CERTIFICATION",
        children: [
            {
                headerComponent: "haveCertifyHeaderRenderer",
                headerName: "Certified All",
                minWidth: 150,
                field: "certify",
                cellRenderer: "haveCertifyRenderer",
                cellClass: "d-flex align-items-center pb-4"
            },
            {
                headerName: "Qty Certified",
                minWidth: 150,
                field: "cetifiedQty",
                valueParser: numberParser
            },
            {
                headerName: "Unit Price",
                minWidth: 150,
                field: "cetifiedUnitPrice",
                valueParser: numberParser
            },
            {
                headerName: "Total Amount",
                minWidth: 150,
                valueGetter: (params) => {
                    const { data } = params;
                    const { cetifiedQty = 0, cetifiedUnitPrice = 0 } = data;
                    return Number(cetifiedQty) * Number(cetifiedUnitPrice);
                },
                field: "cetifiedTotalAmount",
                aggFunc: "sum",
                cellRenderer: formatNumberForRow
            },
            {
                headerName: "Remarks",
                minWidth: 150,
                field: "cetifiedRemarks"
            }
        ]
    },
    {
        headerName: "Total Cumulative Balance",
        minWidth: 250,
        field: "totalCumulativeBalance",
        cellRenderer: formatNumberForRow
    }
];

export const unfixedGroupHistory = [
    {
        headerName: "Record Date",
        minWidth: 200,
        field: "unfixedClaimDate"
    },
    {
        headerName: "Description",
        minWidth: 200,
        field: "description"
    },
    {
        headerName: "Attachment",
        minWidth: 200,
        field: "attachment"
    },
    {
        headerName: "Qty Installed",
        minWidth: 200,
        field: "qtyInstalled"
    },
    {
        headerName: "Balance to install",
        minWidth: 200,
        field: "balanceToInstall"
    },
    {
        headerName: "Unit Price",
        minWidth: 200,
        field: "unitPrice"
    },
    {
        headerName: "To Release",
        minWidth: 200,
        field: "toRelease",
        cellRenderer: formatNumberForRow,
        valueGetter: (params) => {
            const { data } = params;
            const { qtyInstalled = 0, unitPrice = 0 } = data;
            return Number(qtyInstalled) * Number(unitPrice);
        }
    },
    {
        headerName: "Total Cumulative Balance",
        minWidth: 200,
        field: "totalCumulativeBalance"
    }
];

export const devVariationGroup = [
    {
        headerName: "Work",
        children: [
            {
                headerName: "Work Code",
                minWidth: 150
            },
            {
                headerName: "Work Description",
                minWidth: 150
            },
            {
                headerName: "UOM",
                minWidth: 150
            },
            {
                headerName: "Weightage",
                minWidth: 150
            }
        ]
    },
    {
        headerName: "Contract",
        children: [
            {
                headerName: "Quantity",
                minWidth: 150
            },
            {
                headerName: "Unit Price",
                minWidth: 150
            },
            {
                headerName: "Total Amount",
                minWidth: 150
            },
            {
                headerName: "Remarks",
                minWidth: 150
            }
        ]
    },
    {
        headerName: "Retention",
        minWidth: 150
    },
    {
        headerName: "MAIN-CONTRACTOR CLAIM",
        children: [
            {
                headerName: "Previously Cumulative Claimed",
                children: [
                    {
                        headerName: "Actual Claim",
                        children: [
                            {
                                headerName: "Quantity",
                                minWidth: 150
                            },
                            {
                                headerName: "Percentage",
                                minWidth: 150
                            },
                            {
                                headerName: "Amount",
                                minWidth: 150
                            }
                        ]
                    }
                ]
            },
            {
                headerName: "Cumulative Claimed",
                children: [
                    {
                        headerName: "Draft Claim",
                        children: [
                            {
                                headerName: "Quantity",
                                minWidth: 150
                            },
                            {
                                headerName: "Percentage",
                                minWidth: 150
                            },
                            {
                                headerName: "Amount",
                                minWidth: 150
                            }
                        ]
                    }
                ]
            },
            {
                headerName: "Current Claim",
                children: [
                    {
                        headerName: "Draft Claim",
                        children: [
                            {
                                headerName: "Quantity",
                                minWidth: 150
                            },
                            {
                                headerName: "Percentage",
                                minWidth: 150
                            },
                            {
                                headerName: "Amount",
                                minWidth: 150
                            },
                            {
                                headerName: "Remarks",
                                minWidth: 150
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        headerName: "DEVELOPER CERTIFICATION",
        children: [
            {
                headerName: "Previously Cumulative Certified",
                children: [
                    {
                        headerName: "Actual Certification",
                        children: [
                            {
                                headerName: "Quantity",
                                minWidth: 150
                            },
                            {
                                headerName: "Percentage",
                                minWidth: 150
                            },
                            {
                                headerName: "Amount",
                                minWidth: 150
                            }
                        ]
                    }
                ]
            },
            {
                headerName: "Cumulative Certified",
                children: [
                    {
                        headerName: "Draft Certification",
                        children: [
                            {
                                headerName: "Quantity",
                                minWidth: 150
                            },
                            {
                                headerName: "Percentage",
                                minWidth: 150
                            },
                            {
                                headerName: "Amount",
                                minWidth: 150
                            }
                        ]
                    }
                ]
            },
            {
                headerName: "Current Certified",
                children: [
                    {
                        headerName: "Draft Certification",
                        children: [
                            {
                                headerName: "Quantity",
                                minWidth: 150
                            },
                            {
                                headerName: "Percentage",
                                minWidth: 150
                            },
                            {
                                headerName: "Amount",
                                minWidth: 150
                            },
                            {
                                headerName: "Remarks",
                                minWidth: 150
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        headerName: "Claim vs Certification",
        children: [
            {
                headerName: "Pending to Certify",
                children: [
                    {
                        headerName: "",
                        children: [
                            {
                                headerName: "Quantity",
                                minWidth: 150
                            },
                            {
                                headerName: "Percentage",
                                minWidth: 150
                            },
                            {
                                headerName: "Amount",
                                minWidth: 150
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

export const paymentClaimColumnDefs = [
    {
        headerName: i18next.t("S/N"),
        valueGetter: "node.rowIndex + 1"
    },
    {
        headerName: i18next.t("Draft Progress Claim No."),
        field: "dpcNumber"
    },
    {
        headerName: i18next.t("Developer Progress Claim No."),
        field: "dvpcNumber"
    },
    {
        headerName: i18next.t("Payment Claim Reference No."),
        field: "paymentClaimReferenceNo"
    },
    {
        headerName: i18next.t("Payment Claim Reference Month"),
        field: "paymentClaimReferenceMonth",
        cellRenderer: formatMonth
    }
];

export const PAGE_STAGE = {
    DETAIL: "DETAIL",
    CREATE: "CREATE",
    EDIT: "EDIT"
};
