/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef } from "react";
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
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import {
    formatDateString
} from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { v4 as uuidv4 } from "uuid";
import EntitiesService from "services/EntitiesService";
import getContractDocumentColDefs from "./ContractDocumentColDefs";

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

const ContractDocuments = (props) => {
    const showToast = useToast();
    const {
        title,
        rowDataAttachment,
        setContractDocumentsAttachment,
        pageSizeAttachment,
        gridHeightAttachment,
        userDetails,
        disabled
    } = props;
    const { t } = useTranslation();
    const fileInput = useRef(null);
    const classes = useStyles();

    const handelDeleteFile = async (guid) => {
        try {
            const response = await EntitiesService.deleteDocuments(guid);
            if (response.data.status === "OK") {
                return true;
            }
            showToast("error", response.data.message);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return false;
    };

    const onDeleteAttachment = (uuid, rowData) => {
        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }
        setContractDocumentsAttachment(newRowData);
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
            if (response.data.status === "OK") {
                return ({
                    fileLabel: responseData.fileName,
                    guid: responseData.guid
                });
            }
            showToast("error", response.data.message);
        } catch (error) {
            if (error.response) {
                if (error.response.data.status === "BAD_REQUEST") {
                    showToast("error", "We don't support this file format, please upload another.");
                } else {
                    showToast("error", error.response.data.message);
                }
            } else {
                showToast("error", error.message);
            }
        }
        return null;
    };

    const onAddAttachment = (event, uuid, rowData) => {
        handleFileUpload(event).then((result) => {
            if (!result) return;

            const newRowData = [...rowData];
            newRowData.forEach((row, index) => {
                if (row.uuid === uuid) {
                    newRowData[index] = {
                        ...row,
                        guid: result.guid,
                        attachment: result.fileLabel
                    };
                }
            });

            setContractDocumentsAttachment(newRowData);
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onCellEditingStopped = (params) => {
        const { data } = params;
        const newRowData = [...rowDataAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });

        setContractDocumentsAttachment(newRowData);
    };

    const addNewRowAttachment = () => {
        const newRowData = [...rowDataAttachment];
        newRowData.push({
            guid: "",
            title: "",
            description: "",
            uploadOn: formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
            uploadedBy: userDetails.name,
            uploadBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: false,
            uuid: uuidv4(),
            isNew: true
        });

        setContractDocumentsAttachment(newRowData);
    };

    const ActionDelete = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;

        return (
            data?.isNew
                ? (
                    <IconButton
                        size="small"
                        onClick={() => onDeleteAttachment(data.uuid, rowData)}
                        style={{ color: "red" }}
                    >
                        <i className="fa fa-trash" />
                    </IconButton>
                )
                : <></>
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
                                {data.isNew ? data.attachment : data.fileName}
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
                    <div className="mr-3 text-secondary" style={{ fontSize: "0.9em" }}>
                        {t("Maximum file size is 4MB")}
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
                            columnDefs={getContractDocumentColDefs()}
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
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default ContractDocuments;
