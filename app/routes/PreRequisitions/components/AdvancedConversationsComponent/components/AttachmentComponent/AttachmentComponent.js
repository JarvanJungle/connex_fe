import React, { useEffect, useState } from "react";

import {
    Row,
    Col
} from "components";
import { AgGridReact } from "components/agGrid";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";

import { formatDateTime, isNullOrUndefined } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import FormData from "form-data";
import { defaultColDef, columnDefs } from "./AttachmentGridDefinition";

import classes from "../../../PreRequisitionComponents.module.scss";
import axios from "axios";
import MediaService from "services/MediaService/MediaService";

const AttachmentComponent = (props) => {
    const {
        t,
        rowData,
        setFieldValue,
        values,
        showToast,
        gridRef
    } = props;

    const [attachmentRowData, setAttachmentRowData] = useState([]);

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [files, setFiles] = useState(null);
    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        if (!isNullOrUndefined(gridApi)) {
            gridApi.sizeColumnsToFit();
        }
    };

    const addNewItem = () => {
        const newItem = {
            guid: "",
            fileName: "",
            isEditable: true,
            fileLabel: "",
            description: "",
            updatedOn: new Date(),
            uploadedOn: new Date()
        };

        gridApi.applyTransaction({ add: [newItem] });
        const arr = [];
        gridApi.forEachNode((node) => arr.push(node.data));
        setFieldValue("attachmentList", arr);
    };

    const onUpload = async (e, params) => {
        // console.log(e.files[0]);
        // console.log(params);
        const formData = new FormData();
        formData.append("uploaderRole", "admin");
        formData.append("category", "purchase-service/documents");
        formData.append("file", e.files[0]);

        try {
            const response = await MediaService.postUploadFile(formData);
            showToast("success", "File Uploaded");
            const { data } = response.data;
            const effectNodeData = params.node.data;
            effectNodeData.guid = data.guid;
            effectNodeData.fileName = data.fileName;
            gridApi?.applyTransaction({ update: [effectNodeData] });
        } catch (error) {
            if (error.response) {
                showToast("error", `Response status ${error.response.status}: ${error.response.data.message}`);
                return;
            }
            showToast("error", error.message);
        }
    };

    const handleRemoveRow = (params) => {
        const rowToDelete = params.node.data;
        params.api.applyTransaction({ remove: [rowToDelete] });
        const arr = [];
        params.api.forEachNode((node) => arr.push(node.data));
        setFieldValue("attachmentList", arr);
    };
    const viewRenderer = (params) => <Button icon="pi pi-trash" className="p-button-danger p-button-text" onClick={() => handleRemoveRow(params)} />;
    const fileViewRenderer = (params) => <FileUpload mode="basic" className="doxa-button-default" value={params.data.attachment} onSelect={(e) => { onUpload(e, params); }} accept="*" maxFileSize={4000000} />;

    useEffect(() => {
        setAttachmentRowData(values.documentDtoList);
        console.log("values.documentDtoList", values.documentDtoList);
    }, [values.documentDtoList]);

    useEffect(() => {
        if (!isNullOrUndefined(gridApi)) {
            gridApi.sizeColumnsToFit();
        }
    }, [gridApi]);

    return (
        <Row id="attachmentComponent">
            <Col
                md={12}
                lg={12}
            >
                <Row className="py-3">
                    <Col
                        md={{ size: 4, offset: 8 }}
                        lg={{ size: 4, offset: 8 }}
                    >
                        <Row className={classes["doxa-row-float-right"]}>
                            <Button
                                className={classes["doxa-button-default"]}
                                icon="pi pi-plus"
                                iconPos="left"
                                label={t("Add New")}
                                onClick={addNewItem}
                            />
                        </Row>

                    </Col>
                </Row>
                <Row>
                    <Col
                        md={12}
                        lg={12}
                    >
                        <AgGridReact
                            className="ag-theme-custom-react"
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowData={attachmentRowData}
                            onGridReady={onGridReady}
                            singleClickEdit="true"
                            frameworkComponents={{
                                viewRenderer,
                                fileViewRenderer
                            }}
                            containerStyle={{ height: 300 }}
                            ref={gridRef}
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default AttachmentComponent;
