import React, { useState } from "react";

import {
    Row,
    Col
} from "components";
import { AgGridReact } from "components/agGrid";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import { defaultColDef, columnDefs } from "./ConversationGridDefinition";

import classes from "../../../PreRequisitionComponents.module.scss";

const ConversationComponent = (props) => {
    const {
        t,
        rowData,
        setRowData
    } = props;

    const [comment, setComment] = useState("");

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        params.api.sizeColumnsToFit();
    };

    const newConversationRowItem = () => ({
        userName: "John Doe",
        userUuid: "444",
        role: "PR_APPROVER",
        comment,
        submitOn: new Date()
    });

    const onClick = () => {
        setRowData(
            (prevStates) => (
                [
                    ...prevStates,
                    newConversationRowItem()
                ]
            )
        );
    };

    return (
        <Row id="conversationComponent">
            <Col
                md={12}
                lg={12}
            >
                <Row className="py-3">
                    <Col
                        md={12}
                        lg={12}
                    >
                        <div className={classes["doxa-justify-inline-flex"]}>
                            <InputText
                                className={classes["doxa-input"]}
                                value={comment}
                                placeholder={`${t("Enter your comment here")}...`}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <Button
                                className={classes["doxa-button-default"]}
                                label={t("Send")}
                                onClick={onClick}
                            />
                        </div>

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
                            rowData={rowData}
                            onGridReady={onGridReady}
                            containerStyle={{ height: 300 }}
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default ConversationComponent;
