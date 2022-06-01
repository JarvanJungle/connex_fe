import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { AgGridTable } from "../AgGridTable";
import AuditTrailColDefs from "./AuditTrailColDefs";

const AuditTrail = (props) => {
    const {
        rowData,
        paginationPageSize,
        gridHeight,
        defaultExpanded,
        borderTopColor,
        loading
    } = props;

    const { t } = useTranslation();

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
    };

    return (
        <Accordion style={{ borderTop: `8px solid ${!loading ? borderTopColor : "#fff"}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                {!loading && (<Typography>{t("AuditTrail")}</Typography>)}
                {loading && (<div className="phl-col-2" />)}
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <Typography component="span" style={{ width: "100%" }}>
                    {!loading && (
                        <AgGridTable
                            columnDefs={AuditTrailColDefs}
                            rowData={rowData}
                            paginationPageSize={paginationPageSize}
                            gridHeight={
                                rowData.length > 0
                                    ? gridHeight
                                    : 145
                            }
                            pagination={rowData.length > 0}
                            sizeColumnsToFit
                            onGridReady={onGridReady}
                            onComponentStateChanged={(params) => {
                                params.api.sizeColumnsToFit();
                            }}
                        />
                    )}
                    {loading && (<div className="phl-col-12 phl-table" />)}
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

AuditTrail.propTypes = {
    rowData: PropTypes.instanceOf(Array).isRequired,
    paginationPageSize: PropTypes.number,
    gridHeight: PropTypes.number,
    defaultExpanded: PropTypes.bool,
    borderTopColor: PropTypes.string
};
AuditTrail.defaultProps = {
    paginationPageSize: 10,
    gridHeight: 500,
    defaultExpanded: false,
    borderTopColor: "#AEC57D"
};

export default AuditTrail;
