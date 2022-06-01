import React, { useState, useImperativeHandle } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { AgGridTable } from "routes/components";
import {
    Col,
    Row
} from "components";
import { formatNumberForRow } from "helper/utilities";
import { ACE_STATUS } from "../../Helper";

const ArchitectCertificateDetails = (props) => {
    const {
        defaultExpanded,
        borderTopColor,
        isArchitect = true,
        detailDataState,
        refCb
    } = props;
    const [gridAPI, setGridApi] = useState({
        details: null,
        lessCumulative: null
    });

    const { t } = useTranslation();

    const onGridReady = (gridApiName, params, columnFit = false) => {
        if (columnFit) {
            params.api.sizeColumnsToFit();
        }
        gridAPI[gridApiName] = params.api;
        gridAPI[gridApiName].columnApi = params.columnApi;
        setGridApi(gridAPI);
    };

    const GroupCellRenderer = (params) => {
        const {
            data,
            agGridReact
        } = params;
        const { row } = agGridReact.props;
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

    const checkRenderStatus = (status) => [
        ACE_STATUS.PENDING_ARCHITECT_ACKNOWLEDGEMENT,
        ACE_STATUS.PENDING_AC_APPROVAL,
        ACE_STATUS.PENDING_ISSUE_ARCHITECT_CERT,
        ACE_STATUS.PENDING_MC_AC_ACKNOWLEDGEMENT,
        ACE_STATUS.PENDING_CONVERT_TO_INVOICE
    ].includes(status);

    const ArchitectCertificateCumulativeColumnDef = [
        {
            headerName: "Description",
            field: "description"
        },
        {
            headerName: "Amount Claimed For Item",
            field: "amountClaimedForItem",
            cellRenderer: (params) => {
                const { value, data } = params;
                if (value) return `${data.currencyCode} ${formatNumberForRow(params)}`;
                return "";
            },
            cellStyle: () => ({
                textAlign: "right"
            })
        },
        {
            headerName: "Response Amount For Item",
            field: "responseAmountForItem",
            cellRenderer: (params) => {
                const { value, data } = params;
                if (value) return `${data.currencyCode} ${formatNumberForRow(params)}`;
                return "";
            },
            cellStyle: () => ({
                textAlign: "right"
            })
        },
        {
            headerName: "Reason for Difference",
            field: "reasonForDifference",
            editable: () => {
                if (checkRenderStatus(detailDataState.aceStatus)) {
                    return false;
                }

                return true;
            },
            cellStyle: () => {
                if (checkRenderStatus(detailDataState.aceStatus)) {
                    return {};
                }
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
        }
    ];
    const ArchitectCertificateLessCumulativeColumnDef = [
        {
            headerName: "Amount",
            field: "amount",
            cellRenderer: (params) => {
                const { value, data } = params;
                if (value) return `${data.currencyCode} ${formatNumberForRow(params)}`;
                return "";
            },
            cellStyle: () => ({
                textAlign: "right"
            })
        },
        {
            headerName: "Reason for Withheld",
            field: "reasonForWithheld",
            editable: (params) => {
                if (!Reflect.has(params.data, "reasonForWithheld")) {
                    return false;
                }
                if (checkRenderStatus(detailDataState.aceStatus)) {
                    return false;
                }

                return true;
            },
            cellStyle: (params) => {
                if (!Reflect.has(params.data, "reasonForWithheld")) {
                    return false;
                }
                if (checkRenderStatus(detailDataState.aceStatus)) {
                    return {};
                }
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
        }

    ];
    const dataCumulativeCertificateDetails = [
        {
            description: "Cumulative Contractor Works",
            amountClaimedForItem:
                detailDataState.aceWorkSpaceDto.cumulativeMainConWorks,
            responseAmountForItem:
                detailDataState.aceWorkSpaceDto.cumulativeCertMainconWorks,
            reasonForDifference:
                detailDataState.aceWorkSpaceDto.cumulativeContractorWorksReasonForDifference,
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        },
        {
            description: "Cumulative Unfixed Goods and Materials on Site",
            amountClaimedForItem:
                detailDataState.aceWorkSpaceDto.cumulativeUnfixedGoodsAndMaterials,
            responseAmountForItem:
                detailDataState.aceWorkSpaceDto.cumulativeCertUnfixedGoodsMaterials,
            reasonForDifference:
                detailDataState.aceWorkSpaceDto
                    .cumulativeUnfixedGoodsandMaterialsonSiteReasonForDifference,
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        },
        {
            description: "Cumulative Variation Order",
            amountClaimedForItem:
                detailDataState.aceWorkSpaceDto.cumulativeAgreedVariationOrder,
            responseAmountForItem:
                detailDataState.aceWorkSpaceDto.cumulativeCertAgreedVarOrder,
            reasonForDifference:
                detailDataState.aceWorkSpaceDto.cumulativeVariationOrderReasonForDifference,
            editable: true,
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        },
        {
            description: "Retention Release: - Retention of Work Done",
            amountClaimedForItem: "",
            responseAmountForItem:
                detailDataState.aceWorkSpaceDto.addCertRetentionWorkDone,
            reasonForDifference:
                detailDataState.aceWorkSpaceDto.retentionReleaseReasonForDifference,
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        },
        {
            description: "Sub Total For Response Amount [Excl GST]",
            amountClaimedForItem:
                Number(detailDataState.aceWorkSpaceDto.cumulativeMainConWorks)
                + Number(
                    detailDataState.aceWorkSpaceDto.cumulativeUnfixedGoodsAndMaterials
                )
                + Number(
                    detailDataState.aceWorkSpaceDto.cumulativeAgreedVariationOrder
                ),
            responseAmountForItem:
                Number(detailDataState.aceWorkSpaceDto.cumulativeCertMainconWorks)
                + Number(
                    detailDataState.aceWorkSpaceDto.cumulativeCertUnfixedGoodsMaterials
                )
                + Number(detailDataState.aceWorkSpaceDto.cumulativeCertAgreedVarOrder)
                + Number(detailDataState.aceWorkSpaceDto.addCertRetentionWorkDone),
            reasonForDifference:
                detailDataState.aceWorkSpaceDto.subTotalForResponseAmountReasonForDifference,
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        }
    ];
    const dataLessCumulativeCertificateDetails = [
        {
            amount:
                Number(detailDataState.aceWorkSpaceDto.cumulativeCertMainconWorks)
                + Number(
                    detailDataState.aceWorkSpaceDto.cumulativeCertUnfixedGoodsMaterials
                )
                + Number(detailDataState.aceWorkSpaceDto.cumulativeCertAgreedVarOrder)
                + Number(detailDataState.aceWorkSpaceDto.addCertRetentionWorkDone),
            groupNumber: ["Sub Total For Response Amount [Excl GST]"],
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        },
        {
            amount: detailDataState.aceWorkSpaceDto.lessFinalRetentionAmnt,
            groupNumber: ["Sub Total For Response Amount [Excl GST]", `Less: Retention (Capped at ${formatNumberForRow({ value: detailDataState.aceWorkSpaceDto.retentionAmountCappedAt })})`],
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        },
        {
            amount: detailDataState.aceWorkSpaceDto.lessPrevCumulPayments,
            groupNumber: ["Sub Total For Response Amount [Excl GST]", "Less: Sums previously deducted"],
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        },
        {
            groupNumber: ["Amount Due[Excl GST]"],
            amount:
                Number(detailDataState.aceWorkSpaceDto.cumulativeCertMainconWorks)
                + Number(
                    detailDataState.aceWorkSpaceDto.cumulativeCertUnfixedGoodsMaterials
                )
                + Number(detailDataState.aceWorkSpaceDto.cumulativeCertAgreedVarOrder)
                + Number(detailDataState.aceWorkSpaceDto.addCertRetentionWorkDone)
                - Number(detailDataState.aceWorkSpaceDto.lessFinalRetentionAmnt)
                - Number(detailDataState.aceWorkSpaceDto.lessPrevCumulPayments),
            reasonForWithheld:
                detailDataState.aceWorkSpaceDto.amountDueReasonForWithheld,
            currencyCode: detailDataState.aceWorkSpaceDto.currencyCode
        }
    ];

    const getAllRowNodeDatas = (gridApi) => {
        const nodeData = [];
        gridApi?.forEachNode((node) => nodeData.push(node.data));
        return nodeData;
    };

    useImperativeHandle(refCb, () => ({
        getSubmitArchitectCertifyData() {
            if (gridAPI.details || gridAPI.lessCumulative) {
                const detailsReason = getAllRowNodeDatas(gridAPI.details)
                    .map((item) => item.reasonForDifference);
                const lessCumulativeReason = getAllRowNodeDatas(gridAPI.lessCumulative)
                    .map((item) => item.reasonForWithheld || "").filter((item) => item);
                const cols = [
                    "cumulativeContractorWorksReasonForDifference",
                    "cumulativeUnfixedGoodsandMaterialsonSiteReasonForDifference",
                    "cumulativeVariationOrderReasonForDifference",
                    "retentionReleaseReasonForDifference",
                    "subTotalForResponseAmountReasonForDifference",
                    "amountDueReasonForWithheld"
                ];
                const result = [
                    ...detailsReason,
                    ...lessCumulativeReason
                ].reduce((prev, field, index) => {
                    prev[cols[index]] = field;
                    return prev;
                }, {});
                return result;
            }

            return {};
        }
    }));

    return (
        <>
            {
                isArchitect
                    ? (
                        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
                            <AccordionDetails style={{ display: "block" }}>
                                <Row>
                                    <Col xs={12}>
                                        <AgGridTable
                                            defaultColDef={{
                                                flex: 1,
                                                enableValue: true,
                                                enableRowGroup: true,
                                                filter: true,
                                                sortable: true,
                                                resizable: true
                                            }}
                                            className="ag-theme-custom-react"
                                            columnDefs={ArchitectCertificateCumulativeColumnDef}
                                            rowData={dataCumulativeCertificateDetails}
                                            pagination={false}
                                            gridHeight={350}
                                            onGridReady={(params) => onGridReady("details", params, true)}
                                            sizeColumnsToFit
                                            onComponentStateChanged={(params) => {
                                                params.api.sizeColumnsToFit();
                                            }}
                                            animateRows
                                            groupDefaultExpanded={-1}
                                            stopEditingWhenCellsLoseFocus
                                        />
                                    </Col>
                                    <Col xs={12} className="mt-4">
                                        <AgGridTable
                                            defaultColDef={{
                                                flex: 1,
                                                enableValue: true,
                                                enableRowGroup: true,
                                                filter: true,
                                                sortable: true,
                                                resizable: true
                                            }}
                                            className="ag-theme-custom-react"
                                            columnDefs={ArchitectCertificateLessCumulativeColumnDef}
                                            rowData={dataLessCumulativeCertificateDetails}
                                            pagination={false}
                                            gridHeight={350}
                                            onGridReady={(params) => onGridReady("lessCumulative", params, true)}
                                            sizeColumnsToFit
                                            onComponentStateChanged={(params) => {
                                                params.api.sizeColumnsToFit();
                                            }}
                                            animateRows
                                            groupDefaultExpanded={-1}
                                            stopEditingWhenCellsLoseFocus
                                            treeData
                                            frameworkComponents={{
                                                groupCellRenderer: GroupCellRenderer
                                            }}
                                            autoGroupColumnDef={{
                                                headerName: t("Description"),
                                                minWidth: 300,
                                                cellRendererParams: {
                                                    suppressCount: true,
                                                    innerRenderer: "groupCellRenderer"
                                                }
                                            }}
                                            getDataPath={(data) => data.groupNumber}
                                        />
                                    </Col>
                                </Row>
                            </AccordionDetails>
                        </Accordion>
                    ) : null
            }
        </>

    );
};

export default ArchitectCertificateDetails;
