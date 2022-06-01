/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import {
    Row,
    Col,
    Button,
    Card,
    CardBody,
    CardHeader
} from "components";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import EntityServices from "services/EntitiesService";
import useToast from "routes/hooks/useToast";
import { AgGridTable } from "routes/components/AgGridTable";
import getAttachmentColDefs from "routes/components/Conversation/AttachmentColDefs";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { formatDateString } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { v4 as uuidv4 } from "uuid";
import getEsignApproverRouteColDefs from "./ESignApprovalColumns";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};
const useStyles = makeStyles({
    "custom-nav": {
        "&.nav-tabs": {
            borderBottom: "2px solid #DEE2E6"
        },
        "&.nav": {
            padding: "0 16px"
        },
        "&.nav-tabs .nav-link": {
            marginBottom: "-2px",
            border: "2px solid transparent"
        },
        "&.nav-tabs .nav-link.active, &.nav-tabs .nav-item.show .nav-link": {
            borderColor: "#DEE2E6 #DEE2E6 #FFF"
        }
    },
    "custom-card": {
        "&.card": {
            border: 0,
            borderRadius: 0
        }
    }
});

const ESignDocuments = (props) => {
    const showToast = useToast();
    const {
        title,
        addNewRowAttachment,
        pageSizeAttachment,
        gridHeightAttachment,
        onDeleteAttachment,
        onAddAttachment,
        onCellEditingStopped,
        defaultExpanded,
        borderTopColor,
        disabled
    } = props;
    const { t } = useTranslation();
    const fileInput = useRef(null);

    const rowDataAttachment = [];

    const rowApprovalRoute = [];

    const ActionDelete = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        return (
            <IconButton
                size="small"
                onClick={() => onDeleteAttachment(data.uuid, rowData)}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        );
    };

    const downLoadFile = async (data) => {
        try {
            const response = await EntityServices.downloadDocuments("purchase-service/documents", data.guid);
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

    const AddAttachment = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        return (
            <>
                {
                    !!data.isNew && !data.attachment
                        ? (
                            <>
                                <input
                                    ref={fileInput}
                                    onChange={(e) => onAddAttachment(e, data.uuid, rowData)}
                                    type="file"
                                    style={{ display: "none" }}
                                />
                                <Button
                                    onClick={() => fileInput.current.click()}
                                    style={{
                                        border: "1px solid #7b7b7b7b",
                                        padding: "2px 8px",
                                        background: "#fff"
                                    }}
                                    className="text-secondary"
                                >
                                    {t("ChooseFile")}
                                </Button>
                                <input
                                    ref={fileInput}
                                    onChange={(e) => onAddAttachment(e, data.uuid, rowData)}
                                    type="file"
                                    style={{ display: "none" }}
                                />
                                <Button
                                    onClick={() => fileInput.current.click()}
                                    style={{
                                        border: "1px solid #7b7b7b7b",
                                        padding: "2px 8px",
                                        background: "#fff"
                                    }}
                                    className="text-secondary"
                                >
                                    {t("ChooseExistingFile")}
                                </Button>
                            </>
                        ) : (
                            <div
                                style={{
                                    border: "unset",
                                    background: "transparent",
                                    textDecoration: "underline",
                                    color: "#4472C4",
                                    cursor: "pointer"
                                }}
                                onClick={() => downLoadFile(data)}
                            >
                                {data.isNew ? data.attachment : data.fileLabel}
                            </div>
                        )
                }
            </>
        );
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {title}
            </CardHeader>
            <CardBody>
                <Row className="form-group mx-0 justify-content-end align-items-center">
                    <Button
                        color="primary"
                        onClick={addNewRowAttachment}
                        disabled
                    >
                        <span className="mr-1">+</span>
                        <span>{t("Add Route")}</span>
                    </Button>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography><b>Route 1</b></Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{ display: "block", padding: 10 }}>
                                <Typography component="span" style={{ width: "100%" }}>
                                    <p>Document Details</p>
                                    <AgGridTable
                                        columnDefs={getAttachmentColDefs()}
                                        className="ag-theme-custom-react"
                                        defaultColDef={defaultColDef}
                                        rowData={rowDataAttachment}
                                        paginationPageSize={pageSizeAttachment}
                                        gridHeight={
                                            rowDataAttachment.length > 0
                                                ? gridHeightAttachment
                                                : 145
                                        }
                                        onCellEditingStopped={onCellEditingStopped}
                                        pagination={rowDataAttachment.length > 0}
                                        stopEditingWhenCellsLoseFocus
                                        singleClickEdit
                                        frameworkComponents={{
                                            actionDelete: ActionDelete,
                                            addAttachment: AddAttachment,
                                            customTooltip: CustomTooltip
                                        }}
                                        sizeColumnsToFit
                                    />
                                    <br />
                                    <Row className="form-group mx-0 justify-content-end align-items-center">
                                        <Button
                                            color="primary"
                                            disabled
                                        >
                                            <span className="mr-1">+</span>
                                            <span>{t("Add Approver Route")}</span>
                                        </Button>
                                    </Row>
                                    <p>Approver Route</p>
                                    <AgGridTable
                                        columnDefs={getEsignApproverRouteColDefs()}
                                        className="ag-theme-custom-react"
                                        defaultColDef={defaultColDef}
                                        rowData={rowApprovalRoute}
                                        paginationPageSize={pageSizeAttachment}
                                        onCellEditingStopped={onCellEditingStopped}
                                        pagination={rowApprovalRoute.length > 0}
                                        stopEditingWhenCellsLoseFocus
                                        singleClickEdit
                                        frameworkComponents={{
                                            actionDelete: ActionDelete
                                        }}
                                        sizeColumnsToFit
                                    />
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default ESignDocuments;
