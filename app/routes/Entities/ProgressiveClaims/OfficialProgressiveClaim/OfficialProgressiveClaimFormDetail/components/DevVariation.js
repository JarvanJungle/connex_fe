import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import {
    Button,
    ButtonToolbar,
    Col,
    Row
} from "../../../../../../components";
import { AgGridTable } from "../../../../../components";
import {
    devVariationGroup,
    unfixedSummary
} from "../../Helper";

const DevVariation = (props) => {
    const {
        t
    } = props;

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
    };

    return (
        <>
            <Accordion style={{ borderTop: "8px solid" }} defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>VO-000000001</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>{t("Summary")}</Typography>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <AgGridTable
                                sizeColumnsToFit
                                columnDefs={unfixedSummary}
                                rowData={[]}
                                pagination={false}
                                singleClickEdit
                                stopEditingWhenCellsLoseFocus
                                gridHeight={250}
                                onGridReady={onGridReady}
                                enableCellChangeFlash
                                suppressCellFlash
                                suppressExcelExport
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <ButtonToolbar className="justify-content-end">
                                <Button
                                    color="primary"
                                    className="mr-1"
                                >
                                    <i className="fa fa-download mr-2" />
                                    <span>{t("Download CSV")}</span>
                                </Button>
                                <Button
                                    color="primary"
                                    className="mr-1"
                                >
                                    <i className="fa fa-download mr-2" />
                                    <span>{t("Upload CSV")}</span>
                                </Button>
                            </ButtonToolbar>
                        </Col>
                    </Row>
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
                                sizeColumnsToFit
                                columnDefs={devVariationGroup}
                                rowData={[]}
                                pagination={false}
                                singleClickEdit={false}
                                stopEditingWhenCellsLoseFocus
                                gridHeight={700}
                                onGridReady={onGridReady}
                                animateRows
                                groupDefaultExpanded={-1}
                                getDataPath={(data) => data.groupNumber}
                                enableCellChangeFlash
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                            />
                        </Col>
                    </Row>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

export default DevVariation;
