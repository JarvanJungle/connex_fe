import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { HeaderSecondary } from "../HeaderSecondary";
import { AgGridTable } from "../AgGridTable";
import DocumentsColDefs from "./DocumentsColDefs";
import HashesColDefs from "./HashesColDefs";

const Blockchain = React.memo(({
    defaultExpanded,
    borderTopColor,
    rowDataHashes,
    rowDataDocuments,
    gridHeightHashes,
    gridHeightDocuments
}) => {
    const { t } = useTranslation();

    return (
        <>
            <HeaderSecondary
                title={t("Blockchain")}
                className="mb-2"
            />
            <Accordion
                style={{ borderTop: `8px solid ${borderTopColor}` }}
                defaultExpanded={defaultExpanded}
                className="mb-2"
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{t("BlockchainHashes")}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>
                        <AgGridTable
                            columnDefs={HashesColDefs}
                            rowData={rowDataHashes}
                            sizeColumnsToFit
                            gridHeight={rowDataHashes.length > 0
                                ? gridHeightHashes
                                : 145}
                            pagination={gridHeightHashes.length > 0}
                        />
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{t("BlockchainRelatedDocuments")}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>
                        <AgGridTable
                            columnDefs={DocumentsColDefs}
                            rowData={rowDataDocuments}
                            sizeColumnsToFit
                            gridHeight={rowDataDocuments.length > 0
                                ? gridHeightDocuments
                                : 145}
                            pagination={rowDataDocuments.length > 0}
                        />
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </>
    );
});

Blockchain.propTypes = {
    rowDataHashes: PropTypes.instanceOf(Array),
    rowDataDocuments: PropTypes.instanceOf(Array),
    gridHeightHashes: PropTypes.number,
    gridHeightDocuments: PropTypes.number,
    defaultExpanded: PropTypes.bool,
    borderTopColor: PropTypes.string
};
Blockchain.defaultProps = {
    rowDataHashes: [],
    rowDataDocuments: [],
    gridHeightHashes: 300,
    gridHeightDocuments: 300,
    defaultExpanded: false,
    borderTopColor: "#AEC57D"
};

export default Blockchain;
