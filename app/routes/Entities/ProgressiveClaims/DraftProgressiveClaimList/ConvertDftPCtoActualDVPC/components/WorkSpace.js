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
import { workSpaceConvertColumnDef } from "../../Helper";

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
                            columnDefs={workSpaceConvertColumnDef}
                            rowData={rowData || []}
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
                            stopEditingWhenCellsLoseFocus
                        />
                    </Col>
                </Row>
            </AccordionDetails>
        </Accordion>
    );
};

export default WorkSpace;
