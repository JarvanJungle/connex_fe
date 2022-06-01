/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef, useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
    Row,
    Col,
    Button,
    Nav,
    NavItem,
    NavLink,
    Card,
    CardBody,
    Input
} from "components";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import EntityServices from "services/EntitiesService";
import useToast from "routes/hooks/useToast";
import classNames from "classnames";
import { AgGridTable } from "../AgGridTable";
import getAttachmentColDefs from "./AttachmentColDefs";
import ConversationColDefs from "./ConversationColDefs";
import CustomTooltip from "../AddItemRequest/CustomTooltip";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    sortable: true,
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

const Conversation = (props) => {
    const showToast = useToast();
    const {
        title,
        activeTab,
        setActiveTab,
        sendConversation,
        addNewRowAttachment,
        rowDataConversation,
        pageSizeConversation,
        gridHeightConversation,
        rowDataAttachment,
        pageSizeAttachment,
        gridHeightAttachment,
        onDeleteAttachment,
        onAddAttachment,
        onCellEditingStopped,
        defaultExpanded,
        borderTopColor,
        disabled,
        maxLengthComment,
        enableAddComment = false
    } = props;
    const { t } = useTranslation();
    const [comment, setComment] = useState("");
    const [showErrorMsg, setShowErrorMsg] = useState(false);
    const fileInput = useRef(null);
    const classes = useStyles();
    // const [uuid, setUuid] = useState();

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
                                    onChange={(e) => {
                                        const uuid = localStorage.getItem("uuidAttachment");
                                        onAddAttachment(e, uuid, rowData);
                                    }}
                                    type="file"
                                    style={{ display: "none" }}
                                />
                                <Button
                                    onClick={() => {
                                        localStorage.setItem("uuidAttachment", data.uuid);
                                        return fileInput.current.click();
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
                                {
                                    (data.isNew || data.isHaveFileName)
                                        ? data.attachment
                                        : data.fileLabel
                                }
                            </div>
                        )
                }
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
                <Typography>{title}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block", padding: 0 }}>
                <Typography component="span" style={{ width: "100%" }}>
                    <Nav tabs className={`mx-0 ${classes["custom-nav"]}`}>
                        <NavItem>
                            <NavLink
                                href="#"
                                className={activeTab === 1 ? "active" : ""}
                                onClick={() => setActiveTab(1)}
                            >
                                <span className="mx-0">
                                    {t("Conversation")}
                                </span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" className={activeTab === 2 ? "active" : ""} onClick={() => setActiveTab(2)}>
                                <span className="mx-0">
                                    {t("Attachment")}
                                </span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    {
                        activeTab === 1
                            ? (
                                <Card className={`${classes["custom-card"]}`}>
                                    <CardBody>
                                        <Row className="form-group mx-0 justify-content-between">
                                            <Input
                                                placeholder={t("PleaseEnterYourCommentHere")}
                                                value={comment}
                                                maxLength={maxLengthComment || 200}
                                                onChange={(e) => setComment(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter") e.preventDefault();
                                                }}
                                                className={
                                                    classNames("form-control", {
                                                        "is-invalid": showErrorMsg && !comment
                                                    })
                                                }
                                                style={{ flexBasis: "90%" }}
                                                disabled={disabled && !enableAddComment}
                                            />
                                            <Button
                                                color="primary"
                                                style={{ flexBasis: "8%" }}
                                                onClick={() => {
                                                    if (comment) {
                                                        const conversationComment = comment;
                                                        setComment("");
                                                        setShowErrorMsg(false);
                                                        return sendConversation(
                                                            conversationComment
                                                        );
                                                    }
                                                    setShowErrorMsg(true);
                                                    return "";
                                                }}
                                                disabled={disabled && !enableAddComment}
                                            >
                                                {t("Send")}
                                            </Button>
                                            {
                                                showErrorMsg
                                                && !comment
                                                && (<div className="invalid-feedback">{t("PleaseEnterYourMessage")}</div>)
                                            }
                                        </Row>
                                        <Row>
                                            <Col xs={12}>
                                                <AgGridTable
                                                    columnDefs={ConversationColDefs}
                                                    rowData={rowDataConversation}
                                                    colDef={defaultColDef}
                                                    sizeColumnsToFit
                                                    onComponentStateChanged={(params) => {
                                                        params.api.sizeColumnsToFit();
                                                    }}
                                                    pagination={rowDataConversation.length > 0}
                                                    paginationPageSize={pageSizeConversation}
                                                    gridHeight={
                                                        rowDataConversation.length > 0
                                                            ? gridHeightConversation
                                                            : 145
                                                    }
                                                    frameworkComponents={{
                                                        actionDelete: ActionDelete,
                                                        addAttachment: AddAttachment,
                                                        customTooltip: CustomTooltip
                                                    }}
                                                    stopEditingWhenCellsLoseFocus
                                                    autoSizeColumn={false}
                                                />
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            ) : (
                                <Card className={`${classes["custom-card"]}`}>
                                    <CardBody>
                                        <Row className="form-group mx-0 justify-content-end align-items-center">
                                            <div className="mr-3 text-secondary" style={{ fontSize: "0.9em" }}>
                                                {t("Maximum file size is 10MB")}
                                            </div>
                                            <Button
                                                color="primary"
                                                onClick={addNewRowAttachment}
                                                disabled={disabled}
                                            >
                                                <span className="mr-1">+</span>
                                                <span>{t("AddNew")}</span>
                                            </Button>
                                        </Row>
                                        <Row>
                                            <Col xs={12}>
                                                <AgGridTable
                                                    columnDefs={getAttachmentColDefs()}
                                                    className="ag-theme-custom-react"
                                                    defaultColDef={defaultColDef}
                                                    sizeColumnsToFit
                                                    onComponentStateChanged={(params) => {
                                                        params.api.sizeColumnsToFit();
                                                    }}
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
                                                    autoSizeColumn={false}
                                                />
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            )
                    }
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

Conversation.propTypes = {
    title: PropTypes.string.isRequired,
    activeTab: PropTypes.number.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    sendConversation: PropTypes.func.isRequired,
    addNewRowAttachment: PropTypes.func.isRequired,
    rowDataConversation: PropTypes.instanceOf(Array).isRequired,
    pageSizeConversation: PropTypes.number,
    gridHeightConversation: PropTypes.number,
    rowDataAttachment: PropTypes.instanceOf(Array).isRequired,
    pageSizeAttachment: PropTypes.number,
    gridHeightAttachment: PropTypes.number,
    onDeleteAttachment: PropTypes.func.isRequired,
    onAddAttachment: PropTypes.func.isRequired,
    onCellEditingStopped: PropTypes.func.isRequired,
    defaultExpanded: PropTypes.bool,
    borderTopColor: PropTypes.string
};
Conversation.defaultProps = {
    pageSizeConversation: 10,
    gridHeightConversation: 300,
    pageSizeAttachment: 10,
    gridHeightAttachment: 300,
    defaultExpanded: false,
    borderTopColor: "#AEC57D"
};

export default Conversation;
