/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
    forwardRef, useEffect, useImperativeHandle, useRef, useState
} from "react";
import PropTypes from "prop-types";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Link } from "react-router-dom";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import { Checkbox } from "primereact/checkbox";
import { Button, Row } from "components";
import { AgGridReact } from "ag-grid-react/lib/agGridReact";
import EntityServices from "services/EntitiesService";
import useToast from "routes/hooks/useToast";
import IconButton from "@material-ui/core/IconButton";
import CustomTooltip from "./CustomTooltip";
import { getItemsOrderedPOColDefs, ItemsOrderedPOGRDetailsColDefs } from "../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const ItemsOrderedPO = (props) => {
    let {
        t,
        rowDataItem,
        gridHeight,
        onCellValueChanged,
        borderTopColor,
        defaultExpanded,
        onAddAttachment,
        onChangePODeliveryCompleted,
        onDeleteFile,
        modeView
    } = props;

    const fileInput = useRef({});
    const showToast = useToast();
    const [itemsOrderedState, setItemsOrderedState] = useState({
        uuid: "",
        rowData: []
    });

    useEffect(() => {
        rowDataItem = rowDataItem.map(e => {
            if (parseFloat(e.qtyReceiving) === e.qtyPendingDelivery)
                e.poDeliveryCompleted = true
            else e.poDeliveryCompleted = false
            return e
        })
    }, [rowDataItem])
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

    const PONumber = (params) => {
        const { data } = params;
        return (
            <Link
                to={{
                    pathname: PURCHASE_ORDER_ROUTES.PO_DETAILS,
                    search: `?uuid=${data.purchaseOrderUuid}`,
                    state: { data }
                }}
            >
                <span
                    style={{
                        color: "#4472C4",
                        textDecoration: "underline"
                    }}
                >
                    {data.poNumber}
                </span>
            </Link>
        );
    };

    const PODeliveryCompleted = forwardRef((params, ref) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        const { poDeliveryCompleted } = data;

        useImperativeHandle(ref, () => ({
            getReactContainerStyle() {
                return {
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                };
            }
        }));

        return (
            <Checkbox
                name="poDeliveryCompleted"
                checked={poDeliveryCompleted}
                // onChange={(e) => onChangePODeliveryCompleted(e, rowData, data, params)}
            />
        );
    });

    const AddAttachment = forwardRef((params, ref) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;

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
                {
                    !data.documentFileLabel && (modeView.isEditMode || modeView.isApprovalMode)
                        ? (
                            <Button
                                onClick={() => {
                                    setItemsOrderedState((prevStates) => ({
                                        ...prevStates,
                                        uuid: data.uuid,
                                        rowData
                                    }));
                                    fileInput.current.click();
                                }}
                                style={{
                                    border: "1px solid #7b7b7b7b",
                                    padding: "2px 8px",
                                    background: "#fff"
                                }}
                                className="text-secondary"
                            >
                                {t("ChooseFile")}
                            </Button>
                        ) : (
                            <Row className="w-100 mx-0 align-items-center justify-content-between">
                                <div
                                    title={data.documentFileLabel}
                                    style={{
                                        color: "#4472C4",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        maxWidth: (modeView.isEditMode || modeView.isApprovalMode) ? "80%" : "100%",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                    onClick={() => downLoadFile(data)}
                                >
                                    {data.documentFileLabel}
                                </div>
                                {
                                    (modeView.isEditMode || modeView.isApprovalMode)
                                    && (
                                        <IconButton
                                            size="small"
                                            onClick={() => onDeleteFile(data.uuid, rowData, params)}
                                            style={{ color: "red" }}
                                        >
                                            <i className="fa fa-trash" />
                                        </IconButton>
                                    )
                                }
                            </Row>
                        )
                }
            </>
        );
    });

    return (
        <>
            <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{t("ItemsOrdered")}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>
                        <AgGridReact
                            className="ag-theme-custom-react"
                            columnDefs={
                                modeView.isViewDetailsMode
                                    ? ItemsOrderedPOGRDetailsColDefs
                                    : getItemsOrderedPOColDefs(false, modeView.isApprovalMode)
                            }
                            rowData={rowDataItem}
                            defaultColDef={defaultColDef}
                            containerStyle={{ height: gridHeight }}
                            stopEditingWhenCellsLoseFocus
                            frameworkComponents={{
                                poNumber: PONumber,
                                poDeliveryCompleted: PODeliveryCompleted,
                                addAttachment: AddAttachment,
                                customTooltip: CustomTooltip
                            }}
                            singleClickEdit
                            onCellValueChanged={onCellValueChanged}
                            tooltipShowDelay={0}
                        />
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <input
                ref={fileInput}
                onChange={(e) => {
                    const { uuid, rowData } = itemsOrderedState;
                    onAddAttachment(e, uuid, rowData);
                }}
                type="file"
                style={{ display: "none" }}
                value=""
            />
        </>
    );
};

ItemsOrderedPO.propTypes = {
    rowDataItem: PropTypes.instanceOf(Array).isRequired,
    gridHeight: PropTypes.number,
    borderTopColor: PropTypes.string,
    defaultExpanded: PropTypes.bool
};
ItemsOrderedPO.defaultProps = {
    gridHeight: 300,
    defaultExpanded: false,
    borderTopColor: "#AEC57D"
};

export default ItemsOrderedPO;
