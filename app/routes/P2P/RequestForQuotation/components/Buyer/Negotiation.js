import React, { useRef, useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import { Row, Col, Button } from "components";
import { AgGridTable } from "routes/components";
import EntityServices from "services/EntitiesService";
import useToast from "routes/hooks/useToast";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import EntitiesService from "services/EntitiesService";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { NegotiationColDefs } from "../../ColumnDefs";

const Negotiation = (props) => {
    const showToast = useToast();
    const fileInput = useRef(null);
    const {
        t,
        borderTopColor = "#AEC57D",
        defaultExpanded = true,
        gridHeight = 300,
        disabled,
        negotiations = [],
        negotiationActions,
        isBuyer
    } = props;

    const [comment, setComment] = useState("");
    const [attachment, setAttachment] = useState(null);

    const handelDeleteFile = async (guid) => {
        try {
            const response = await EntitiesService.deleteDocuments(guid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                setAttachment(null);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleFileUpload = async (event) => {
        try {
            const data = new FormData();
            const file = event.target.files[0];
            data.append("file", file);
            data.append("category", "purchase-service/documents");
            data.append("uploaderRole", "user");
            const response = await EntitiesService.uploadDocuments(data);
            const responseData = response.data.data;
            if (response.data.status === RESPONSE_STATUS.OK) {
                return ({
                    fileLabel: responseData.fileName,
                    guid: responseData.guid
                });
            }
            showToast("error", response.data.message);
        } catch (error) {
            if (error.response) {
                if (error.response.data.status === RESPONSE_STATUS.BAD_REQUEST) {
                    showToast("error", t("WeDontSupportThisFileFormatPleaseUploadAnother"));
                } else {
                    showToast("error", error.response.data.message);
                }
            } else {
                showToast("error", error.message);
            }
        }
        return null;
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

    const onAddAttachment = (event) => {
        handleFileUpload(event).then((result) => {
            if (!result) return;

            setAttachment({ ...result });
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const Attachment = (params) => {
        const { data } = params;
        return (
            <button
                type="button"
                style={{
                    border: "unset",
                    background: "transparent",
                    textDecoration: "underline",
                    color: "#4472C4",
                    cursor: "pointer"
                }}
                onClick={() => downLoadFile(data)}
            >
                {data.fileLabel}
            </button>
        );
    };

    return (
        <Row className="mb-4">
            <Col xs={12}>
                <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    />
                    <AccordionDetails style={{ display: "block" }}>
                        <Typography component="span" style={{ width: "100%" }}>
                            <Row className="mb-2">
                                <Col xs={12} md={12} lg={12}>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={t("EnterYourComment")}
                                        disabled={disabled}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4 justify-content-between mx-0">
                                <Row className="mx-0">
                                    <input
                                        ref={fileInput}
                                        onChange={onAddAttachment}
                                        value=""
                                        type="file"
                                        style={{ display: "none" }}
                                    />
                                    <Button
                                        type="button"
                                        color="primary"
                                        onClick={() => fileInput?.current?.click()}
                                        disabled={disabled}
                                    >
                                        {t("UploadAttachment")}
                                    </Button>
                                    {attachment && (
                                        <Row className="mx-0">
                                            <button
                                                type="button"
                                                className="ml-3"
                                                style={{
                                                    fontSize: "0.875rem",
                                                    border: "unset",
                                                    background: "transparent",
                                                    textDecoration: "underline",
                                                    color: "#4472C4",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => downLoadFile(attachment)}
                                            >
                                                {attachment.fileLabel}
                                            </button>
                                            <IconButton
                                                size="small"
                                                onClick={
                                                    () => handelDeleteFile(attachment.guid)
                                                }
                                                style={{ color: "red" }}
                                            >
                                                <i className="fa fa-trash" />
                                            </IconButton>
                                        </Row>
                                    )}
                                </Row>
                                <Button
                                    type="button"
                                    color="primary"
                                    onClick={() => {
                                        negotiationActions.onSendNegotiation(
                                            comment, attachment, isBuyer
                                        );
                                        setComment("");
                                        setAttachment(null);
                                    }}
                                    disabled={disabled}
                                >
                                    {t("SendMessage")}
                                </Button>
                            </Row>
                            <AgGridTable
                                rowData={negotiations}
                                columnDefs={NegotiationColDefs}
                                gridHeight={negotiations.length > 0 ? gridHeight : 145}
                                pagination={negotiations.length > 0}
                                sizeColumnsToFit
                                frameworkComponents={{
                                    attachment: Attachment,
                                    customTooltip: CustomTooltip
                                }}
                                onComponentStateChanged={(params) => params.api.sizeColumnsToFit()}
                            />
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Col>
        </Row>
    );
};

export default Negotiation;
