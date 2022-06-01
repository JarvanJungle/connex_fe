import React, { useEffect, useState, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { AgGridTable } from "routes/components";
import {
    Col,
    Row
} from "components";
import {
    formatNumberForRow,
    formatNumberPercentForRow,
    toFixedWithoutRounded,
    numberParser,
    numberParserPercent
} from "helper/utilities";
import CustomTooltip from "./CustomTooltip";

const TEXT_NO_CHOICE = "No selection as tax applicable is no";
const SummaryInvoiceTable = (props) => {
    const {
        rowData,
        defaultExpanded,
        borderTopColor,
        onDeleteItem,
        onAddChildItem,
        refCb,
        invoiceDetails,
        viewMode = false,
        taxRecords
    } = props;
    const [gridAPI, setGridApi] = useState();
    const [disabledTaxCode, setDisabledTaxCode] = useState(false);
    const [dataSummary, setDataSummary] = useState([]);
    const { t } = useTranslation();

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
    };

    const GroupCellRenderer = (params) => {
        const {
            data
        } = params;
        const {
            groupNumber
        } = data;
        const value = groupNumber.at(-1);
        return (
            <>
                <span>
                    {value}
                    &nbsp;
                </span>
            </>
        );
    };
    const TaxCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {
                    (value != null && typeof value === "object") ? value.taxCode : value
                }
            </span>
        );
    };
    const IsTaxCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {value ? "YES" : "NO"}
            </span>
        );
    };
    const getRowData = () => {
        const array = [];
        gridAPI?.forEachNode((node) => {
            array.push(node.data);
        });
        return array;
    };

    const buildSubmitData = () => {
        const datas = getRowData();
        const dataSubmit = {
            cumulativeContractorWorksInvoiceTaxUuid: null,
            cumulativeVariationWorksInvoiceTaxUuid: null,
            retentionOfWorkDoneInvoiceTaxUuid: null,
            cumulativeUnfixedGoodsInvoiceTaxUuid: null,
            messageError: ""
        };
        datas.forEach((item) => {
            const { description } = item;
            if (description === "Cumulative Contractor Works") {
                dataSubmit.cumulativeContractorWorksInvoiceTaxApplicable = item.taxApplicable;
                dataSubmit.cumulativeContractorWorksInvoiceTaxUuid = item && item?.taxCode && item?.taxCode?.uuid ? item?.taxCode?.uuid : "";
            }
            if (description === "Cumulative Unfixed Goods and Materials on Site") {
                dataSubmit.cumulativeUnfixedGoodsInvoiceTaxApplicable = item.taxApplicable;
                dataSubmit.cumulativeUnfixedGoodsInvoiceTaxUuid = item && item?.taxCode && item?.taxCode?.uuid ? item?.taxCode?.uuid : "";
            }
            if (description === "Cumulative Variation Order") {
                dataSubmit.cumulativeVariationWorksInvoiceTaxApplicable = item.taxApplicable;
                dataSubmit.cumulativeVariationWorksInvoiceTaxUuid = item && item?.taxCode && item?.taxCode?.uuid ? item?.taxCode?.uuid : "";
            }
            if (description === "- Retention of Work Done") {
                dataSubmit.retentionOfWorkDoneInvoiceTaxApplicable = item.taxApplicable;
                dataSubmit.retentionOfWorkDoneInvoiceTaxUuid = item && item?.taxCode && item?.taxCode?.uuid ? item?.taxCode?.uuid : "";
            }
        });
        if (dataSubmit.cumulativeContractorWorksInvoiceTaxApplicable && !dataSubmit.cumulativeContractorWorksInvoiceTaxUuid) {
            dataSubmit.messageError = "Plase choice Cumulative Contractor Works TaxCode";
        }
        if (dataSubmit.cumulativeUnfixedGoodsInvoiceTaxApplicable && !dataSubmit.cumulativeUnfixedGoodsInvoiceTaxUuid) {
            dataSubmit.messageError = "Plase choice Cumulative Unfixed Goods and Materials on Site TaxCode";
        }
        if (dataSubmit.cumulativeVariationWorksInvoiceTaxApplicable && !dataSubmit.cumulativeVariationWorksInvoiceTaxUuid) {
            dataSubmit.messageError = "Plase choice Cumulative Variation Order TaxCode";
        }
        if (dataSubmit.retentionOfWorkDoneInvoiceTaxApplicable && !dataSubmit.retentionOfWorkDoneInvoiceTaxUuid) {
            dataSubmit.messageError = "Plase choice Retention of Work Done TaxCode";
        }
        return dataSubmit;
    };

    useImperativeHandle(refCb, () => ({
        getSubmitSummaryInvoice() {
            return buildSubmitData();
        }
    }));

    const onCellValueChanged = (params) => {
        console.log("onCellValueChanged", params);
        const { value, rowIndex } = params;
        const column = params.colDef.field;
        const allRowData = getRowData();
        const newRowData = [];
        const valueTaxApplicable = params.data.taxApplicable;

        switch (column) {
        case "taxCode":
            // newRowData = allRowData.map((item, i) => {
            //     if (rowIndex === i) {
            //         return {
            //             ...item,
            //             taxRate: `Y (${value && value.taxRate}%)`
            //         };
            //     } return item;
            // });
            if (valueTaxApplicable) params.node.setDataValue("taxRate", value?.taxRate);
            break;
        case "taxApplicable":
            if (value) {
                params.node.setDataValue("taxRate", null);
                params.node.setDataValue("taxCode", null);
            } else {
                params.node.setDataValue("taxRate", TEXT_NO_CHOICE);
                params.node.setDataValue("taxCode", TEXT_NO_CHOICE);
            }
            break;
        default:
            break;
        }
    };

    const getRowDataByParams = (params) => {
        const array = [];
        params.api?.forEachNode((node) => {
            array.push(node.data);
        });
        return array;
    };

    const getDataByDes = (des, params) => getRowDataByParams(params).find((item) => item.description === des);
    const getAmoutInvoiceByRate = (item) => {
        const rate = item && item.taxApplicable && item?.taxCode && item.taxRate ? (item.taxRate / 100) : 0;
        return item && item.amountTaxInvoice ? item.amountTaxInvoice * rate : 0;
    };

    const convertDetailToData = (detail) => {
        if (detail) {
            const dataSummaryCovert = [
                {
                    description: "Cumulative Contractor Works",
                    amountContract: detail.cumulativeContractorWorksContractAmount || 0,
                    amountTaxInvoice: detail.cumulativeContractorWorksInvoiceAmount || 0,
                    taxApplicable: detail.cumulativeContractorWorksInvoiceTaxApplicable,
                    taxCode: detail.cumulativeContractorWorksInvoiceTaxCode || "",
                    taxRate: detail.cumulativeContractorWorksInvoiceTaxRate || ""
                },
                {
                    description: "Cumulative Unfixed Goods and Materials on Site",
                    amountContract: detail.cumulativeUnfixedGoodsContractAmount || 0,
                    amountTaxInvoice: detail.cumulativeUnfixedGoodsInvoiceAmount || 0,
                    taxApplicable: detail.cumulativeUnfixedGoodsInvoiceTaxApplicable,
                    taxCode: detail.cumulativeUnfixedGoodsInvoiceTaxCode || "",
                    taxRate: detail.cumulativeUnfixedGoodsInvoiceTaxRate || ""
                },
                {
                    description: "Cumulative Variation Order",
                    amountContract: detail.cumulativeVariationWorksContractAmount || 0,
                    amountTaxInvoice: detail.cumulativeVariationWorksInvoiceAmount || 0,
                    taxApplicable: detail.cumulativeVariationWorksInvoiceTaxApplicable,
                    taxCode: detail.cumulativeVariationWorksInvoiceTaxCode || "",
                    taxRate: detail.cumulativeVariationWorksInvoiceTaxRate || ""
                },
                {
                    description: "Retention Release",
                    amountContract: null,
                    amountTaxInvoice: null
                },
                {
                    description: "- Retention of Work Done",
                    amountContract: "-",
                    amountTaxInvoice: detail.retentionOfWorkDoneInvoiceAmount || 0,
                    taxApplicable: detail.retentionOfWorkDoneInvoiceTaxApplicable,
                    taxCode: detail.retentionOfWorkDoneInvoiceTaxCode || "",
                    taxRate: detail.retentionOfWorkDoneInvoiceTaxRate || ""
                },
                {
                    description: "Sub Total For Response Amount",
                    amountContract: "-",
                    amountTaxInvoice: detail.subTotalForResponseInvoiceAmount || 0,
                    taxApplicable: null
                },
                {
                    description: `Less: Retention (Capped at ${detail.lessRetentionCappedAmount})`,
                    amountContract: "-",
                    amountTaxInvoice: detail.lessRetentionInvoiceAmount || 0,
                    taxApplicable: null
                },
                {
                    description: "Sub-Total for Amount Withheld, if any",
                    amountContract: "-",
                    amountTaxInvoice: detail.subtotalAmountWithheld || 0,
                    taxApplicable: null
                },
                {
                    description: "Less : Amount Previously Paid, if any",
                    amountContract: "-",
                    amountTaxInvoice: detail.lessAmountPreviouslyPaid || 0,
                    taxApplicable: null
                },
                {
                    description: "Total Response Amount (Excl. Tax)",
                    amountContract: "-",
                    amountTaxInvoice: detail.totalResponseAmountExTax || 0,
                    taxApplicable: null
                },
                {
                    description: "Net Total Amount Due",
                    amountContract: "-",
                    amountTaxInvoice: detail.netTotalAmountDue || 0,
                    taxApplicable: null
                },
                {
                    description: "Tax Amount",
                    amountContract: "-",
                    amountTaxInvoice: detail.taxAmount || 0,
                    taxApplicable: null
                },
                {
                    description: "Total Amount Due (Incl. Tax)",
                    amountContract: "-",
                    amountTaxInvoice: detail.totalAmountIncludeTax || 0,
                    taxApplicable: null
                }
            ];
            setDataSummary(dataSummaryCovert);
        }
    };

    const summaryColumnDefs = [
        {
            headerName: "Description",
            field: "description",
            minWidth: 400,
            cellStyle: (params) => {
                if (["Sub Total For Response Amount",
                    "Sub-Total for Amount Withheld, if any",
                    "Total Response Amount (Excl. Tax)",
                    "Net Total Amount Due", "Tax Amount", "Total Amount Due (Incl. Tax)"].includes(params.value)
                ) {
                    return {
                        fontWeight: "bold",
                        textAlign: "right"
                    };
                }
                return {};
            }
        },
        {
            headerName: "Contract",
            children: [
                {
                    headerName: "Amount (Excl. Tax)",
                    minWidth: 150,
                    field: "amountContract",
                    cellRenderer: formatNumberForRow
                }
            ]
        }, {
            headerName: "Invoice",
            children: [
                {
                    headerName: "Amount (Excl. Tax)",
                    minWidth: 150,
                    field: "amountTaxInvoice",
                    valueGetter: (params) => {
                        const {
                            data: {
                                description, amountTaxInvoice, taxRate, taxApplicable
                            }
                        } = params;
                        if (viewMode) return amountTaxInvoice || 0;
                        const itemSubTotalForResponseAmount = getDataByDes("Sub Total For Response Amount", params)?.amountTaxInvoice || 0; // [A]
                        const itemSubtotalAmountWithheld = getDataByDes("Sub-Total for Amount Withheld, if any", params)?.amountTaxInvoice || 0; // [B]
                        const itemLessAmountPreviouslyPaid = getDataByDes("Less : Amount Previously Paid, if any", params)?.amountTaxInvoice || 0; // [C]
                        const DAmount = itemSubTotalForResponseAmount - itemSubtotalAmountWithheld - itemLessAmountPreviouslyPaid;
                        const EAmount = getAmoutInvoiceByRate(getDataByDes("Cumulative Contractor Works", params)) + getAmoutInvoiceByRate(getDataByDes("Cumulative Unfixed Goods and Materials on Site", params)) + getAmoutInvoiceByRate(getDataByDes("Cumulative Variation Order", params)) + getAmoutInvoiceByRate(getDataByDes("- Retention of Work Done", params));
                        const FAmount = DAmount + EAmount;
                        if (["Total Response Amount (Excl. Tax)", "Net Total Amount Due"].includes(description)) {
                            return DAmount;
                        }
                        if (["Tax Amount"].includes(description)) {
                            return EAmount;
                        }
                        if (["Total Amount Due (Incl. Tax)"].includes(description)) {
                            return FAmount;
                        }
                        return amountTaxInvoice || 0;
                    },
                    cellRenderer: formatNumberForRow
                },
                {
                    headerName: "Tax Applicable",
                    minWidth: 150,
                    field: "taxApplicable",
                    cellEditor: "agRichSelectCellEditor",
                    editable: (params) => {
                        const value = params.data.description;
                        if (["Cumulative Contractor Works",
                            "Cumulative Unfixed Goods and Materials on Site",
                            "Cumulative Variation Order",
                            "- Retention of Work Done"
                        ].includes(value) && !viewMode) {
                            return true;
                        } return false;
                    },
                    cellStyle: (params) => {
                        const value = params.data.description;
                        if (["Cumulative Contractor Works",
                            "Cumulative Unfixed Goods and Materials on Site",
                            "Cumulative Variation Order",
                            "- Retention of Work Done"
                        ].includes(value) && !viewMode) {
                            return {
                                backgroundColor: "#DDEBF7",
                                border: "1px solid #E4E7EB"
                            };
                        } return {};
                    },
                    cellEditorParams: {
                        values: [true, false],
                        cellRenderer: "isTaxCellRenderer"
                    },
                    cellRenderer: (params) => {
                        const { value } = params;
                        if (value === undefined || value === null || value === "") return "";
                        return value ? "YES" : "NO";
                    }
                },
                {
                    headerName: "Tax Code",
                    minWidth: 150,
                    field: "taxCode",
                    cellEditor: "agRichSelectCellEditor",
                    cellEditorParams: {
                        values: taxRecords,
                        cellRenderer: "taxCellRenderer"
                    },
                    tooltipField: "taxCode",
                    tooltipComponentParams: {
                        fieldTooltip: "taxCode",
                        isShow: true
                    },
                    editable: (params) => {
                        const value = params.data.description;
                        const valueTaxApplicable = params.data.taxApplicable;
                        if (["Cumulative Contractor Works",
                            "Cumulative Unfixed Goods and Materials on Site",
                            "Cumulative Variation Order",
                            "- Retention of Work Done"
                        ].includes(value) && valueTaxApplicable && !viewMode) {
                            return true;
                        } return false;
                    },
                    cellStyle: (params) => {
                        console.log("params cellStyle===================", params);
                        const value = params.data.description;
                        const valueTaxApplicable = params.data.taxApplicable;
                        if (["Cumulative Contractor Works",
                            "Cumulative Unfixed Goods and Materials on Site",
                            "Cumulative Variation Order",
                            "- Retention of Work Done"
                        ].includes(value) && valueTaxApplicable && !viewMode) {
                            return {
                                backgroundColor: "#DDEBF7",
                                border: "1px solid #E4E7EB"
                            };
                        }
                        return {
                            backgroundColor: "unset",
                            border: "unset"
                        };
                    },
                    cellRenderer: (params) => {
                        const { value = {}, data: { taxApplicable } } = params;
                        if (taxApplicable === false) {
                            return TEXT_NO_CHOICE;
                        }
                        return value ? (typeof value === "string" ? value : value?.taxCode): "";
                    }
                },
                {
                    headerName: "Tax Rate",
                    minWidth: 150,
                    field: "taxRate",
                    tooltipField: "taxRate",
                    tooltipComponentParams: {
                        fieldTooltip: "taxRate",
                        isShow: true
                    },
                    cellRenderer: (params) => {
                        const { value = {}, data: { taxApplicable } } = params;
                        if (taxApplicable === false) {
                            return TEXT_NO_CHOICE;
                        }
                        return value && typeof value === "number" ? `Y (${value || ""}%)` : "";
                    }
                }
            ]
        }];

    useEffect(() => {
        if (invoiceDetails) convertDetailToData(invoiceDetails);
    }, [invoiceDetails]);
    return (

        <Row className="mb-4">
            <Col xs={12}>
                <AgGridTable
                    defaultColDef={{
                        flex: 1,
                        enableValue: true,
                        enableRowGroup: true,
                        filter: true,
                        sortable: true,
                        resizable: true,
                        tooltipComponent: "customTooltip"
                    }}
                    className="ag-theme-custom-react"
                    columnDefs={summaryColumnDefs}
                    rowData={dataSummary}
                    pagination={false}
                    gridHeight={680}
                    onGridReady={onGridReady}
                    sizeColumnsToFit
                    onComponentStateChanged={(params) => {
                        params.api.sizeColumnsToFit();
                    }}
                    frameworkComponents={{
                        customTooltip: CustomTooltip,
                        groupCellRenderer: GroupCellRenderer,
                        taxCellRenderer: TaxCellRenderer,
                        isTaxCellRenderer: IsTaxCellRenderer
                    }}
                    onCellValueChanged={onCellValueChanged}
                    tooltipShowDelay={0}
                    animateRows
                    stopEditingWhenCellsLoseFocus
                />
            </Col>
        </Row>
    );
};

export default SummaryInvoiceTable;
