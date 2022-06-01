import React, { useState, useEffect, useRef } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
    Col,
    Row,
    Table,
    MultiSelect,
    ButtonToolbar,
    Button
} from "components";
import { Checkbox } from "primereact/checkbox";
import { AgGridTable } from "routes/components";
import IconButton from "@material-ui/core/IconButton";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVReader } from "react-papaparse";
import ButtonSpinner from "components/ButtonSpinner";
import i18next from "i18next";
import EntitiesService from "services/EntitiesService";
import useToast from "routes/hooks/useToast";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { DPC_STATUS } from "../../Helper";

const Retention = (props) => {
    const {
        t,
        values = {},
        setFieldValue,
        borderTopColor,
        isBuyer,
        draftClaimDetail = {},
        updateItemRetention = () => {}
    } = props;
    const showToast = useToast();
    const [gridAPI, setGridApi] = useState({});
    const [rowDataOriginalItem, setRowDataOriginalItem] = useState([]);
    const [dataRetentionHistory, setDataRetentionHistory] = useState([{
        uuid: uuidv4(),
        recordDate: "20/10/2021",
        attachment: null,
        calculatedRetentionAmount: 5000,
        revisedRetentionAmount: 5000,
        cumulativeRetentionAmount: 5000,
        balanceToRetentionCapped: null,
        paymentReponseNo: "pr-01"
    },
    {
        uuid: uuidv4(),
        recordDate: "20/10/2021",
        attachment: null,
        calculatedRetentionAmount: 5000,
        revisedRetentionAmount: 15000,
        cumulativeRetentionAmount: 5000,
        balanceToRetentionCapped: null,
        paymentReponseNo: "pr-02"
    }]);

    const rowDataOriginalItemRef = useRef([]);

    const onGridReady = (gridApiName, params, columnFit = false) => {
        if (columnFit) {
            params.api.sizeColumnsToFit();
        }
        gridAPI[gridApiName] = params.api;
        setGridApi(gridAPI);
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
    const onAddAttachment = (event, uuid, allRowData) => {
        handleFileUpload(event).then((result) => {
            if (!result) return;
            const newRowData = allRowData.map((item) => {
                if (item.uuid === uuid) {
                    return {
                        ...item,
                        attachment: result
                    };
                } return item;
            });

            setRowDataOriginalItem(newRowData);
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };
    const downLoadFile = async (data) => {
        try {
            const response = await EntitiesService.downloadDocuments("purchase-service/documents", data.guid);
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
        const { data, agGridReact, rowIndex } = params;
        const allRowData = agGridReact.props.rowData;
        return (
            <>
                {
                    !data.attachment
                        ? (
                            <>
                                <input
                                    id={`inputFile${rowIndex}`}
                                    onChange={(e) => onAddAttachment(e, data.uuid, allRowData)}
                                    type="file"
                                    style={{ display: "none" }}
                                />
                                <Button
                                    onClick={() => document.getElementById(`inputFile${rowIndex}`).click()}
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
                                onClick={() => downLoadFile(data.attachment)}
                            >
                                {data.attachment.fileLabel}
                            </div>
                        )
                }
            </>
        );
    };
    const addItem = (params) => {
        const { agGridReact } = params;
        const allRowData = [...rowDataOriginalItemRef.current];
        allRowData.push({
            uuid: uuidv4(),
            recordDate: moment(new Date()).format(CUSTOM_CONSTANTS.DDMMYYYY),
            attachment: null
        });
        console.log("data", allRowData);
        setRowDataOriginalItem(allRowData);
    };

    const deleteItem = (params) => {
        const { data } = params;
        let cloneRowData = [...rowDataOriginalItemRef.current];
        cloneRowData = cloneRowData.filter((item) => item.uuid !== data.uuid);
        setRowDataOriginalItem(cloneRowData);
    };

    const ActionCellRendererRetentionHistory = (params) => {
        const { rowIndex } = params;
        return (
            <>
                {
                    rowIndex === 0
                && (
                    <IconButton
                        onClick={() => addItem(params)}
                        size="small"
                        style={{ color: "#AEC57D" }}
                    >
                        <i className="fa fa-plus-circle" />
                    </IconButton>
                )
                }
            </>
        );
    };

    const ActionCellRendererOriginalItem = (params) => (

        <>
            <IconButton
                onClick={() => deleteItem(params)}
                size="small"
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        </>
    );

    const checkRenderComponent = (status) => {
        if (
            false
            // isBuyer
            // && (
            //     !(status === DPC_STATUS.PENDING_ACKNOWLEDGEMENT)
            // || status === DPC_STATUS.RECALLED
            // || status === DPC_STATUS.PENDING_APPROVAL
            // || status === DPC_STATUS.SENT_BACK
            // || status === DPC_STATUS.PENDING_SUBMISSION_TO_MAIN_QS
            // || status === DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION
            // )
        ) {
            return true;
        } return false;
    };
    const getAllRows = () => {
        const rowData = [];
        gridAPI.retentionHistory.forEachNode((node) => rowData.push(node.data));
        return rowData;
    };
    const onCellValueChangedRetentionHistory = (params) => {
        console.log(params);
        console.log("values", values);
        const rowData = getAllRows();
        let sum = 0;
        const newRowData = rowData.map((item) => {
            sum += Number(item.revisedRetentionAmount);
            return {
                ...item,
                cumulativeRetentionAmount: sum,
                balanceToRetentionCapped: Number(values.retentionAmountCappedAt) - Number(sum)
            };
        });
        setDataRetentionHistory(newRowData);
    };
    useEffect(() => {
        rowDataOriginalItemRef.current = rowDataOriginalItem;
        updateItemRetention(rowDataOriginalItem);
    }, [JSON.stringify(rowDataOriginalItem)]);

    const retentionHistoryDefs = [
        {
            headerName: "Action",
            minWidth: 150,
            field: "actionRetentionHistoryItem",
            cellRenderer: "actionCellRendererRetentionHistory"
        },
        {
            headerName: i18next.t("Record Date"),
            minWidth: 150,
            field: "recordDate"
        },
        {
            headerName: i18next.t("Progress Claim No."),
            minWidth: 150,
            field: "progressClaimNo."
        },
        {
            headerName: i18next.t("Calculated Retention Amount"),
            minWidth: 150,
            field: "calculatedRetentionAmount"
        },
        {
            headerName: i18next.t("Revised Retention  Amount"),
            minWidth: 150,
            field: "revisedRetentionAmount",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })
        },
        {
            headerName: i18next.t("Cumulative Retention Amount"),
            minWidth: 150,
            field: "cumulativeRetentionAmount"
        },
        {
            headerName: i18next.t("Balance to Retention Capped"),
            minWidth: 150,
            field: "balanceToRetentionCapped"
        },
        {
            headerName: i18next.t("Payment Reponse No."),
            minWidth: 150,
            field: "paymentReponseNo."
        }

    ];
    const originalItemRetentionDefs = [
        {
            headerName: "Action",
            field: "actionOriginalItem",
            cellRenderer: "actionCellRendererOriginalItem"
        },
        {
            headerName: i18next.t("Record Date"),
            // minWidth: 150,
            field: "recordDate"
        },
        {
            headerName: i18next.t("Sub Type"),
            // minWidth: 150,
            field: "subType"
        },
        {
            headerName: i18next.t("Description"),
            // minWidth: 150,
            field: "description",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })
        },
        {
            headerName: i18next.t("Total Amount"),
            // minWidth: 150,
            field: "totalAmount",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })
        },
        {
            headerName: i18next.t("Revised Total Amount"),
            // minWidth: 150,
            field: "revisedTotalAmount",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })
        },
        {
            headerName: i18next.t("Reason for difference"),
            // minWidth: 150,
            field: "reasonForDifference",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })
        },
        {
            headerName: i18next.t("Cumulative Claimed / Release"),
            // minWidth: 150,
            field: "cumulativeClaimedRelease"
        },
        {
            headerName: i18next.t("Balance"),
            // minWidth: 150,
            field: "balance"
        },
        {
            headerName: i18next.t("Attachment"),
            // minWidth: 150,
            field: "attachment",
            cellRenderer: "addAttachment",
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })
        },
        {
            headerName: i18next.t("ProgressClaimNumber"),
            // minWidth: 150,
            field: "progressClaimNumber"
        },
        {
            headerName: i18next.t("Initiated By"),
            // minWidth: 150,
            field: "initiatedBy"
        }
    ];

    return (
        <>
            {
                checkRenderComponent(draftClaimDetail.pcStatus)
                && (
                    <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>{t("Cumulative Retention of Work Done")}</Typography>
                        </AccordionSummary>
                        <AccordionDetails style={{ display: "block" }}>
                            <Row>
                                <Col xs={12}>
                                    <AgGridTable
                                        defaultColDef={{
                                            flex: 1,
                                            enableValue: true,
                                            enableRowGroup: true,
                                            filter: true,
                                            sortable: true,
                                            resizable: true
                                        }}
                                        sizeColumnsToFit
                                        columnDefs={retentionHistoryDefs}
                                        rowData={dataRetentionHistory || []}
                                        pagination={false}
                                        stopEditingWhenCellsLoseFocus
                                        gridHeight={300}
                                        onGridReady={(params) => onGridReady("retentionHistory", params)}
                                        animateRows
                                        onCellValueChanged={onCellValueChangedRetentionHistory}
                                        groupDefaultExpanded={-1}
                                        onComponentStateChanged={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        frameworkComponents={{
                                            actionCellRendererRetentionHistory: ActionCellRendererRetentionHistory
                                        }}
                                    />
                                </Col>
                            </Row>
                        </AccordionDetails>
                        <AccordionDetails style={{ display: "block" }}>
                            <Row>
                                <Col xs={12}>
                                    <AgGridTable
                                        defaultColDef={{
                                            flex: 1,
                                            enableValue: true,
                                            enableRowGroup: true,
                                            filter: true,
                                            sortable: true,
                                            resizable: true
                                        }}
                                        sizeColumnsToFit
                                        columnDefs={originalItemRetentionDefs}
                                        rowData={rowDataOriginalItem || []}
                                        pagination={false}
                                        stopEditingWhenCellsLoseFocus
                                        gridHeight={300}
                                        onGridReady={(params) => onGridReady("originalItemRetention", params)}
                                        animateRows
                                        groupDefaultExpanded={-1}
                                        getDataPath={(data) => data.groupNumber}
                                        enableCellChangeFlash
                                        onComponentStateChanged={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        frameworkComponents={{
                                            actionCellRendererOriginalItem: ActionCellRendererOriginalItem,
                                            addAttachment: AddAttachment
                                        }}

                                    />
                                </Col>
                            </Row>
                        </AccordionDetails>
                    </Accordion>
                )
            }

        </>
    );
};

export default Retention;
