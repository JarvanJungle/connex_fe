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

const colourScheme = {
    BUYER: "#AEC57D",
    SUPPLIER: "#A9A2C1"
};
const editableFields = {
    previouslyActualCumulativeClaimedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    previouslyActualCumulativeClaimedAmount: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    cumulativeDraftClaimedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    cumulativeDraftClaimedAmount: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentDraftClaimedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentDraftClaimedAmount: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    previouslyActualCumulativeCertifiedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    previouslyActualCumulativeCertifiedAmount: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    cumulativeDraftCertifiedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    cumulativeDraftCertifiedAmount: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentDraftCertifiedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentDraftCertifiedAmount: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    }
};
const WorkSpace = (props) => {
    const {
        rowData,
        defaultExpanded,
        borderTopColor,
        onDeleteItem,
        onAddChildItem
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
            groupNumber,
            quantity,
            unitPrice
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

    const editableFunc = (isStyle) => {
        if (isStyle) {
            return (params) => {
                if (editableFields[params.colDef.field] && editableFields[params.colDef.field].colorBySide) {
                    return {
                        backgroundColor: editableFields[params.colDef.field].colorBySide
                        // border: "1px solid #E4E7EB"
                    };
                }
                return {
                };
            };
        }
        return (params) => {
            return false;
        };
    };

    const processAssignEditableCheck = (colDefs) => {
        for (let i = 0; i < colDefs.length; i++) {
            colDefs[i].editable = editableFunc();
            colDefs[i].cellStyle = editableFunc(true);
            if (colDefs[i].children) {
                processAssignEditableCheck(colDefs[i].children);
            }
        }
    };

    const onRowDataChanged = (propsChanged) => {
        if (gridAPI) {
            const colDefs = gridAPI.getColumnDefs();
            processAssignEditableCheck(colDefs);
            gridAPI.setColumnDefs(colDefs);
        }
    };
    
    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("Work Space")}</Typography>
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
                            columnDefs={workSpaceColumnDef}
                            rowData={rowData}
                            pagination
                            gridHeight={580}
                            paginationPageSize={10}
                            onGridReady={onGridReady}
                            sizeColumnsToFit
                            onComponentStateChanged={(params) => {
                                params.api.sizeColumnsToFit();
                            }}
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
                            animateRows
                            groupDefaultExpanded={-1}
                            getDataPath={(data) => data.groupNumber}
                            onRowDataChanged={onRowDataChanged}
                            onRowDataUpdated={onRowDataChanged}
                            stopEditingWhenCellsLoseFocus
                        />
                    </Col>
                </Row>
            </AccordionDetails>
        </Accordion>
    );
};

export default WorkSpace;
