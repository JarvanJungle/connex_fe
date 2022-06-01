import React, { useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { AgGridTable } from "routes/components";
import {
    Col,
    Row
} from "components";
import IconButton from "@material-ui/core/IconButton";
import { workSpaceColumnDef } from "../../Helper";

const ArchitectCertificateDetails = (props) => {
    const {
        rowData,
        defaultExpanded,
        borderTopColor,
        onDeleteItem,
        onAddChildItem,
        isArchitect = true
    } = props;
    const [gridAPI, setGridApi] = useState();

    const { t } = useTranslation();

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
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

    const ArchitectCertificateCumulativeColumnDef = [
        {
            headerName: "Description",
            field: "description"
        },
        {
            headerName: "Amount Claimed For Item",
            field: "amountClaimedForItem"
            // cellStyle: { textAlign: "right" }
        },
        {
            headerName: "Response Amount For Item",
            field: "responseAmountForItem"
        },
        {
            headerName: "Reason for Difference",
            field: "reasonForDifference",
            editable: true,
            cellStyle: { background: "#DDEBF7" }
        }
    ];
    const ArchitectCertificateLessCumulativeColumnDef = [
        // {
        //     headerName: "Description",
        //     field: "description"
        // },
        {
            headerName: "Amount",
            field: "amount"
        },
        {
            headerName: "Reason for Withheld",
            field: "reasonForWithheld",
            editable: (params) => {
                console.log("params", params);
                return true;
            },
            cellStyle: { background: "#DDEBF7" }
        }

    ];
    const dataCumulativeCertificateDetails = [
        {
            description: "Cumulative Contractor Works",
            amountClaimedForItem: 10
        },
        {
            description: "Cumulative Unfixed Goods and Materials on Site",
            amountClaimedForItem: 20

        },
        {
            description: "Cumulative Variation Order",
            amountClaimedForItem: 40,
            editable: true
        },
        {
            description: "Sub Total For Response Amount [Excl GST]",
            amountClaimedForItem: 40
        }

    ];
    const dataLessCumulativeCertificateDetails = [
        {
            amountClaimedForItem: 10,
            groupNumber: ["Sub Total For Response Amount [Excl GST]"]

        },
        {
            amountClaimedForItem: 10,
            groupNumber: ["Sub Total For Response Amount [Excl GST]", "Less: Retention (Capped at $35,570.00)"]

        },
        {
            amountClaimedForItem: 20,
            groupNumber: ["Sub Total For Response Amount [Excl GST]", "Less: Sums previously deducted"]

        },
        {
            groupNumber: ["Amount Due[Excl GST]"],
            amountClaimedForItem: 40
        }
    ];
    return (
        <>
            {
                isArchitect
                    ? (
                        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>{t("Architect's Certificate Details")}</Typography>
                            </AccordionSummary>
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
                                            onGridReady={onGridReady}
                                            sizeColumnsToFit
                                            onComponentStateChanged={(params) => {
                                                params.api.sizeColumnsToFit();
                                            }}
                                            animateRows
                                            groupDefaultExpanded={-1}
                                            stopEditingWhenCellsLoseFocus
                                            // treeData
                                            // frameworkComponents={{
                                            //     groupCellRenderer: GroupCellRenderer
                                            // }}
                                            // autoGroupColumnDef={{
                                            //     headerName: t("Description"),
                                            //     minWidth: 300,
                                            //     cellRendererParams: {
                                            //         suppressCount: true,
                                            //         innerRenderer: "groupCellRenderer"
                                            //     }
                                            // }}
                                            // getDataPath={(data) => data.groupNumber}
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
                                            onGridReady={onGridReady}
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
