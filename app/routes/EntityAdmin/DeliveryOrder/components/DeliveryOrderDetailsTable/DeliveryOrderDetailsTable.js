import React, { forwardRef, useImperativeHandle } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { AgGridReact } from "components/agGrid";
import { Checkbox } from "primereact/checkbox";
import CheckboxRenderer from "routes/components/CheckboxRenderer/checkboxRenderer";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import { useHistory } from "react-router-dom";
import DODetailsTableColDefs from "./DODetailsTableColDefs";
import classes from "./DeliveryOrderDetailsTable.scss";
import CustomTooltip from "./CustomAddItemDOTooltip";
import { Row } from "components";
import EntityServices from "services/EntitiesService";
import useToast from "routes/hooks/useToast";


const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true.valueOf,
    tooltipComponent: "customTooltip"
};

const DeliveryOrderDetailsTable = (props) => {
    const {
        rowData,
        onGridReady,
        gridHeight,
        defaultExpanded,
        borderTopColor,
        onCellValueChanged
    } = props;
    const history = useHistory();
    const showToast = useToast();

    const { t } = useTranslation();
    const goToPODetails = (params) => {
        const { data } = params;
        history.push({
            pathname: PURCHASE_ORDER_ROUTES.PO_DETAILS,
            search: `?uuid=${data.poUuid}`,
            state: { data }
        });
    };

    const LinkCellRenderer = (params) => (
        <div className={classes.linkPo} onClick={() => goToPODetails(params)} aria-hidden="true">
            {params.data.poNumber}
        </div>
    );

    const CompletedDelivery = (params) => {
        const { data } = params;
        const { completedDelivery } = data;
        return (
            <Checkbox
                name="completedDelivery"
                checked={completedDelivery}
            />
        );
    };

    const downLoadFile = async (data) => {
        try {
            const response = await EntityServices.downloadDocuments("purchase-service/documents", data.documentGuid);
            const responseData = response.data.data;
            if (response.data.status === "OK") {
                window.open(responseData);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const AddAttachment = forwardRef((params, ref) => {
        const { data } = params;

        useImperativeHandle(ref, () => ({
            getReactContainerStyle() {
                return {
                    width: "100%",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center"
                };
            }
        }));

        return (
            <>
                <Row className="w-100 mx-0 align-items-center justify-content-between">
                    <div
                        title={data.documentFileLabel}
                        style={{
                            color: "#4472C4",
                            textDecoration: "underline",
                            cursor: "pointer",
                            maxWidth:  "80%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                        onClick={() => downLoadFile(data)}
                    >
                        {data.documentFileLabel}
                    </div>
                </Row>
            </>
        );
    });

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
                    stopEditingWhenCellsLoseFocus
                    frameworkComponents={{
                        checkboxRenderer: CheckboxRenderer,
                        LinkCellRenderer,
                        customTooltip: CustomTooltip,
                        completedDelivery: CompletedDelivery,
                        addAttachment: AddAttachment
                    }}
                    singleClickEdit
                    onCellValueChanged={onCellValueChanged}
                    tooltipShowDelay={0}
                />
            </AccordionDetails>
        </Accordion>
    );
};

export default DeliveryOrderDetailsTable;
