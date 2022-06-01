import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { AgGridReact } from "components/agGrid";
import { defaultColDef } from "helper/utilities";
import { Link } from "react-router-dom";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import { DODetailsTableColDefs } from "../../ColumnDefs";

const DODetailsTable = (props) => {
    const {
        rowData,
        onGridReady,
        gridHeight,
        defaultExpanded,
        borderTopColor
    } = props;

    const PONumber = (params) => {
        const { data } = params;
        return (
            <Link
                to={{
                    pathname: PURCHASE_ORDER_ROUTES.PO_DETAILS,
                    search: `?uuid=${data.poUuid}`,
                    state: { data }
                }}
            >
                <span
                    style={{
                        color: "blue",
                        textDecoration: "underline"
                    }}
                >
                    {data.poNumber}
                </span>
            </Link>
        );
    };

    const { t } = useTranslation();
    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("DeliveryOrderDetails")}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <AgGridReact
                    className="ag-theme-custom-react"
                    columnDefs={DODetailsTableColDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    onGridReady={onGridReady}
                    containerStyle={{ height: gridHeight }}
                    frameworkComponents={{
                        poNumber: PONumber
                    }}
                />
            </AccordionDetails>
        </Accordion>
    );
};

export default DODetailsTable;
