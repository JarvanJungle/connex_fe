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
import { Button, Row } from "components";
import IconButton from "@material-ui/core/IconButton";
import { AgGridReact } from "ag-grid-react/lib/agGridReact";
import EntityServices from "services/EntitiesService";
import useToast from "routes/hooks/useToast";
import CustomTooltip from "./CustomTooltip";
import { getItemsOrderedNonDOColDefs } from "../ColumnDefs";
import AgDropdownSelection from "components/AgDropdownSelection";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const ItemsOrderedNonPO = (props) => {
    const {
        t,
        disabled,
        rowDataItem,
        gridHeight,
        onCellValueChanged,
        borderTopColor,
        defaultExpanded,
        onAddAttachment,
        onDeleteItem,
        addresses,
        uoms,
        onDeleteFile
    } = props;
    
    const fileInput = useRef(null);
    const showToast = useToast();
    const [itemsOrderedState, setItemsOrderedState] = useState({
        uuid: "",
        rowData: []
    });

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

    const ActionDelete = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        return (
            <IconButton
                size="small"
                onClick={() => onDeleteItem(data.uuid, rowData, params)}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        );
    };

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
                    !data.documentFileLabel && !disabled
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
                                        maxWidth: !disabled ? "80%" : "100%",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                    onClick={() => downLoadFile(data)}
                                >
                                    {data.documentFileLabel}
                                </div>
                                {
                                    !disabled
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
                            columnDefs={getItemsOrderedNonDOColDefs(addresses, uoms, disabled)}
                            rowData={rowDataItem}
                            defaultColDef={defaultColDef}
                            containerStyle={{ height: gridHeight }}
                            stopEditingWhenCellsLoseFocus
                            frameworkComponents={{
                                actionDelete: ActionDelete,
                                agDropdownSelection: AgDropdownSelection,
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

ItemsOrderedNonPO.propTypes = {
    rowDataItem: PropTypes.instanceOf(Array).isRequired,
    gridHeight: PropTypes.number,
    borderTopColor: PropTypes.string,
    defaultExpanded: PropTypes.bool,
    onDeleteItem: PropTypes.func,
    disabled: PropTypes.bool
};
ItemsOrderedNonPO.defaultProps = {
    gridHeight: 300,
    defaultExpanded: false,
    borderTopColor: "#AEC57D",
    onDeleteItem: () => { },
    disabled: false
};

export default ItemsOrderedNonPO;
