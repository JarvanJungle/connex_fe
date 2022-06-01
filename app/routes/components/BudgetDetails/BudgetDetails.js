import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Row, Col } from "components";
import {
    AgGridReact
} from "components/agGrid";
import { defaultColDef } from "helper/utilities";
import { AgGridTable } from "../AgGridTable";
import BudgetDetailsItemColDefs from "./BudgetDetailsItemColDefs";
import BudgetDetailsTradeColDefs from "./BudgetDetailsTradeColDefs";
import BudgetDetailsProjectColDefs from "./BudgetDetailsProjectColDefs";
import "ag-grid-enterprise";

const budgetProjectOptions = {
    alignedGrids: []
};
const budgetTradeOptions = {
    alignedGrids: []
};

budgetProjectOptions.alignedGrids.push(budgetTradeOptions);

const BudgetDetails = (props) => {
    const {
        rowDataProject,
        paginationPageSizeProject,
        gridHeightProject,
        rowDataTrade,
        gridHeightTrade,
        defaultExpanded,
        borderTopColor
    } = props;
    const { t } = useTranslation();

    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("BudgetDetails")}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <Typography component="span" style={{ width: "100%" }}>
                    <Row className="mb-2">
                        <Col xs={12}>
                            <AgGridTable
                                columnDefs={BudgetDetailsProjectColDefs}
                                rowData={rowDataProject}
                                paginationPageSize={paginationPageSizeProject}
                                gridHeight={gridHeightProject}
                                gridOptions={budgetProjectOptions}
                                pagination={false}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={12}>
                            <div
                                className="ag-theme-custom-react"
                                style={{ height: `${gridHeightTrade}px` }}
                            >
                                <AgGridReact
                                    rowData={rowDataTrade}
                                    defaultColDef={defaultColDef}
                                    columnDefs={BudgetDetailsTradeColDefs}
                                    masterDetail
                                    detailCellRendererParams={{
                                        detailGridOptions: {
                                            columnDefs: BudgetDetailsItemColDefs,
                                            defaultColDef
                                        },
                                        getDetailRowData: (params) => {
                                            params.successCallback(params.data.children);
                                        }
                                    }}
                                    isRowMaster={(dataItem) => (dataItem
                                        ? dataItem.children.length > 0 : false)}
                                />
                            </div>
                        </Col>
                    </Row>
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

BudgetDetails.propTypes = {
    rowDataProject: PropTypes.instanceOf(Array).isRequired,
    paginationPageSizeProject: PropTypes.number,
    gridHeightProject: PropTypes.number,
    rowDataTrade: PropTypes.instanceOf(Array).isRequired,
    gridHeightTrade: PropTypes.number,
    defaultExpanded: PropTypes.bool,
    borderTopColor: PropTypes.string
};
BudgetDetails.defaultProps = {
    paginationPageSizeProject: 10,
    gridHeightProject: 150,
    gridHeightTrade: 400,
    defaultExpanded: false,
    borderTopColor: "#AEC57D"
};

export default BudgetDetails;
