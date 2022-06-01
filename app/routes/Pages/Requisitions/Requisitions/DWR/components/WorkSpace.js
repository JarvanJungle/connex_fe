import React, { useEffect, useState, useRef } from "react";
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
import { AgGridTable } from "routes/components";
import IconButton from "@material-ui/core/IconButton";
import useToast from "routes/hooks/useToast";
import CSVTemplates from "helper/commonConfig/CSVTemplates";
import { CSVReader } from "react-papaparse";
import ButtonSpinner from "components/ButtonSpinner";
import { Checkbox } from "primereact/checkbox";
import { v4 as uuidv4 } from "uuid";
import { CSVLink } from "react-csv";
import { toFixedWithoutRounded, formatNumberForRow } from "helper/utilities";
// import DWRItems from "./DWRItems";
const _ = require("lodash");

const WorkSpace = (props) => {
    const {
        t,
        values,
        disabled,
        touched,
        handleChange,
        dirty,
        setFieldValue,
        errors,
        borderTopColor,
        defaultExpanded = true,
        users,
        onChangeList,
        onAddItemManual,
        onAddChildItem,
        onDeleteItem,
        rowDataDWRItem,
        uoms,
        onCellValueChanged,
        onSummaryCellChanged,
        onDeleteItemSelectedEvaluator,
        openDialogAddCatalogue,
        openDialogAddForecast,
        openDialogAddContract
    } = props;
    const showToast = useToast();

    const [usersOptions, setUsersOptions] = useState(users || []);
    const [gridAPI, setGridApi] = useState({
        summary: null,
        dwrItem: null
    });
    const rowDataDWRItemRef = useRef(rowDataDWRItem || []);

    useEffect(() => {
        if (gridAPI.dwrItem) {
            setTimeout(() => {
                gridAPI.dwrItem.expandAll();
            }, 100);
        }
        rowDataDWRItemRef.current = rowDataDWRItem;
    }, [rowDataDWRItem]);

    useEffect(() => {
        setUsersOptions(users);
    }, [users, values.quantitySurveyors, values.architects]);

    const onGridReady = (gridApiName, params, columnFit = false) => {
        // params.api.resetRowHeights();
        if (columnFit) {
            params.api.sizeColumnsToFit();
        }

        gridAPI[gridApiName] = params.api;
        setGridApi(gridAPI);
    };
    const deleteItemSelectedEvaluator = (params, item) => {
        onDeleteItemSelectedEvaluator(params, item, rowDataDWRItemRef.current);
    };
    const EvaluatorCellRenderer = (params) => {
        const { value, data } = params;
        return (
            <span>
                {
                    (value != null && typeof value === "object") ? value.name : value
                }
            </span>
        );
    };
    const ActionDeleteRenderer = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        return (
            <IconButton
                size="small"
                onClick={() => onDeleteItem(data.uuid || data.itemUuid, rowData)}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        );
    };

    const GroupCellRenderer = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        const { groupNumber, quantity, unitPrice } = data;
        const value = groupNumber.at(-1);
        return (
            <>
                <span>
                    {value}
                    &nbsp;
                </span>
                <IconButton
                    size="small"
                    onClick={() => onDeleteItem(data.uuid || data.itemUuid, rowData)}
                    style={{ color: "red" }}
                >
                    <i className="fa fa-trash" />
                </IconButton>
                {
                    !quantity && !unitPrice
                    && (
                        <IconButton
                            size="small"
                            onClick={() => onAddChildItem(data, rowData)}
                            style={{ color: "#AEC57D" }}
                        >
                            <i className="fa fa-plus-circle" />
                        </IconButton>
                    )
                }
            </>
        );
    };

    const UOMCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {
                    (value != null && typeof value === "object") ? value.uomName : value
                }
            </span>
        );
    };
    const SelectedEvaluatorRenderer = (params) => {
        const { value = [] } = params;
        return (
            <>
                {
                    value.map((item, i) => (
                        <span className="mr-2" key={i}>

                            <span>
                                {item?.name}
                            </span>
                            <i
                                className="fa fa-close close-button ml-2"
                                style={{ cursor: "pointer" }}
                                onClick={() => deleteItemSelectedEvaluator(params, item)}
                            />
                        </span>
                    ))
                }
            </>

        );
    };
    const summaryColumnDefs = [
        {
            headerName: t("Work Code"),
            field: "workCode",
            minWidth: 250
        },
        {
            headerName: t("Description"),
            field: "description",
            minWidth: 250
        },
        {
            headerName: t("Weightage"),
            field: "weightage",
            minWidth: 200,
            valueGetter: (params) => {
                const { data } = params;
                const { quantity, unitPrice, weightage } = data;
                let weightageCal =  (quantity && unitPrice && getTotalItemsAmount() !== 0) ? (((Number(quantity) * Number(unitPrice))) / getTotalItemsAmount()) : (weightage || 0);
                weightageCal = Number((weightageCal || 0)) * 100;
                return weightageCal;
            },
            cellRenderer: (params) => {
                const { value } = params;
                return value ? `${value.toFixed(2)} %` : "";
            }

        },
        {
            headerName: t("TotalAmount"),
            field: "totalAmount",
            minWidth: 200,
            valueGetter: (params) => {
                const { data } = params;
                const { quantity, unitPrice } = data;
                return (quantity && unitPrice) ? (Number(quantity) * Number(unitPrice)).toFixed(2) : 0;
            }
        },
        {
            headerName: t("RetentionPercentage"),
            field: "retentionPercentage",
            valueGetter: (params) => {
                const { data } = params;
                return data && data.retentionPercentage ? data.retentionPercentage : 0;
            },
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${toFixedWithoutRounded(value, 2)} %` : "";
            },
            editable: !disabled,
            cellStyle: () => {
                if (!disabled) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            }
        },
        {
            headerName: t("SelectEvaluator"),
            field: "evaluator",
            editable: !disabled,
            cellRenderer: "evaluatorCellRenderer",
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: usersOptions,
                cellRenderer: "evaluatorCellRenderer"
            },
            minWidth: 250,
            cellStyle: () => {
                if (!disabled) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            }
        },
        {
            headerName: t("SelectedEvaluator"),
            field: "selectedEvaluator",
            cellRenderer: "SelectedEvaluatorRenderer",
            valueGetter: (params) => {
                const { data = {} } = params;
                return data.selectedEvaluator || [];
            },
            minWidth: 250
        }
    ];
    const itemColumnDefs = [
        // {
        //     headerName: t("Action"),
        //     field: "action",
        //     cellRenderer: "actionDelete",
        // },
        {
            headerName: t("WorkCode"),
            field: "workCode",
            editable: !disabled,
            cellStyle: () => {
                if (!disabled) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            }
        },
        {
            headerName: t("Description*"),
            field: "description",
            editable: !disabled,
            cellStyle: () => {
                if (!disabled) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            }
        },
        {
            headerName: `${t("UOM")}*`,
            field: "uom",
            cellRenderer: "uomCellRenderer",
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: uoms,
                cellRenderer: "uomCellRenderer"
            },

            editable: (params) => {
                const { data } = params;
                return !data.haveChildren && !disabled;
            },
            cellStyle: (params) => {
                const { data } = params;
                if (!data.haveChildren && !disabled) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            }
        },
        {
            headerName: t("Retention"),
            field: "retention",
            editable: !disabled,
            cellRenderer: "haveRetentionRenderer",
            cellStyle: () => {
                if (!disabled) {
                    return {
                        display: "flex",
                        alignItems: "center",
                        paddingBottom: "20px",
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {
                    display: "flex",
                    alignItems: "center",
                    paddingBottom: "20px"
                };
            }
        },
        {
            headerName: t("Weightage"),
            field: "weightage",
            valueGetter: (params) => {
                const { data } = params;
                const {
                    weightage, quantity = 0, unitPrice = 0, totalAmount
                } = data;
                return (((quantity * unitPrice) || totalAmount) / (getTotalItemsAmount() || 1) * 100) || weightage;
            },
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${(value).toFixed(2)} %` : "";
            },
            aggFunc: "sum"
        },
        {
            headerName: `${t("Quantity")}*`,
            field: "quantity",
            editable: (params) => {
                const { data } = params;
                return !data.haveChildren && !disabled;
            },
            cellStyle: (params) => {
                const { data } = params;
                if (!data.haveChildren && !disabled) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            }
        },
        {
            headerName: `${t("UnitPrice")}*`,
            field: "unitPrice",
            editable: (params) => {
                const { data } = params;
                return !data.haveChildren && !disabled;
            },
            cellStyle: (params) => {
                const { data } = params;
                if (!data.haveChildren && !disabled) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            },
            cellRenderer: formatNumberForRow
        },
        {
            headerName: t("TotalAmount"),
            field: "totalAmount",
            valueGetter: (params) => {
                const { data } = params;
                const { totalAmount, quantity = 0, unitPrice = 0 } = data;
                const totalAmountCal = (Number(quantity) * Number(unitPrice) || totalAmount) || 0;
                return totalAmountCal.toFixed(2);
            },
            aggFunc: "sum",
            cellRenderer: formatNumberForRow
        },
        {
            headerName: t("Remarks"),
            field: "remarks",
            editable: !disabled,
            cellStyle: () => {
                if (!disabled) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            }
        }
    ];
    const getAllRowNodesData = () => {
        const rowData = [];
        gridAPI?.dwrItem?.forEachNode((node) => rowData.push(node.data));
        return rowData;
    };
    const getAllRowNodes = () => {
        const rowData = [];
        gridAPI?.dwrItem?.forEachNode((node) => rowData.push(node));
        return rowData;
    };

    const getTotalItemsAmount = () => {
        const rowNodes = getAllRowNodes();
        let total = 0;
        if (rowNodes && rowNodes.length > 0) {
            rowNodes.forEach((item) => {
                const { level, aggData, data } = item;
                if (level === 0) {
                    total += (aggData?.totalAmount || data.totalAmount || 0);
                }
            });
        }
        return total;
    };

    const getTotal = (rowData) => {
        let total = 0;
        if (rowData && rowData.length > 0) {
            rowData.forEach((item) => {
                const { totalAmount } = item;
                if (item.groupNumber.length === 1) {
                    total += totalAmount;
                }
            });
        }
        return total;
    };

    const cellValueChanged = (params) => {
        let rowData = getAllRowNodes();
        rowData = rowData.map((item) => {
            if (item.aggData) {
                item.data.totalAmount = item.aggData.totalAmount;
            } else {
                item.data.totalAmount = Number(item.data.quantity || 0) * Number(item.data.unitPrice || 0) || item.data.totalAmount;
            }
            return item.data;
        });
        rowData = rowData.map((item) => {
            item.weightage = item.totalAmount / getTotal(rowData);
            return item;
        });
        onCellValueChanged(params, rowData);
    };

    const summaryCellChanged = (params) => {
        const rowData = getAllRowNodesData();
        onSummaryCellChanged(params, rowData);
    };

    const downloadCSV = () => {
        gridAPI.dwrItem.exportDataAsCsv({
            fileName: CSVTemplates.WorkRequest_WorkSpace_FileName,
            allColumns: true
        });
    };

    useEffect(() => {
        if (rowDataDWRItem?.length > 0) {
            const rootItems = rowDataDWRItem.filter((x) => x.groupNumber.length === 1);
            gridAPI?.summary?.setRowData(rootItems);
        }
    }, [rowDataDWRItem]);

    const rowDataWorkSpaceRootLevel = rowDataDWRItem.filter((x) => x?.groupNumber?.length === 1);

    const buttonRef = useRef();

    // Upload
    const handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef?.current) {
            buttonRef?.current.open(e);
        }
    };
    const handleOnUploadError = (err) => {
        // message = err;
        showToast("error");
    };
    const getUuid = (item = {}) => item.uuid || item.itemUuid;

    const handleOnUploadDrop = (data) => {
        onChangeList([]);
        const dicFindParent = {};
        let massUpload = [];
        let message = "";
        for (let i = 0; i < data.length; i++) {
            // check if the row is empty row or header or sample data
            if (i === 0) continue;
            const itemRow = data[i];
            const groupCode = (itemRow.data[0] || "").trim();
            const parentGroupCode = (itemRow.data[1] || "").trim();
            dicFindParent[groupCode] = parentGroupCode || groupCode;
            if (itemRow && groupCode !== "") {
                if (groupCode) {
                    const isActive = itemRow.data[5].toLowerCase() === "true";
                    const uploadItem = {
                        uuid: uuidv4(),
                        groupNumber: [],
                        groupCode,
                        // parentGroupCode,
                        workCode: itemRow.data[2],
                        description: itemRow.data[3],
                        uom: itemRow.data[4],
                        retention: isActive,
                        retentionPercentage: itemRow.data[6] || null,
                        quantity: itemRow.data[7] || null,
                        unitPrice: itemRow.data[8] || null,
                        remarks: itemRow.data[9] || null
                    };
                    massUpload.push(uploadItem);
                } else {
                    message = CSVTemplates.NeededFields_Error;
                    showToast(message);
                    return;
                }
            }
        }
        const findRootGroup = (group = [], groupCode) => {
            const parentGroupCode = dicFindParent[groupCode];
            if (groupCode !== parentGroupCode) {
                group.push(groupCode);
                return findRootGroup(group, parentGroupCode);
            }
            group.push(groupCode);
            return group;
        };
        for (let i = 0; i < massUpload.length; i++) {
            const itemTable = massUpload[i];
            const groupNumber = [];
            massUpload[i].groupNumber.push(...findRootGroup(groupNumber, itemTable.groupCode));
            massUpload[i].groupNumber.reverse();
        }
        massUpload = massUpload.map((item) => {
            const filered = massUpload.filter((itemFilter) => itemFilter.groupNumber.includes(item.groupCode)).length;
            if (filered > 1) {
                item.haveChildren = true;
            } else {
                item.haveChildren = false;
            }
            return item;
        });
        onChangeList(massUpload);
    };
    const pickExistingRowNode = (conditionId, value) => {
        let result = null;
        gridAPI?.dwrItem?.forEachNode((rowNode) => {
            if (rowNode && rowNode.data && rowNode.data[conditionId] === value) {
                result = rowNode;
            }
        });
        return result;
    };

    const onChangeRetention = (params) => {
        const { data } = params;
        const rootGroup = data.groupNumber.at(0);

        const newData = rowDataDWRItemRef.current.map((item) => {
            if (getUuid(item) === getUuid(data)) {
                return {
                    ...item,
                    retention: !item.retention
                };
            }
            if (
                data.haveChildren
                && item.groupNumber.includes(data.groupNumber?.at(-1))
                && rootGroup === item.groupNumber.at(0)) {
                return {
                    ...item,
                    retention: !data.retention
                };
            } return item;
        });
        onChangeList(newData);
    };

    const HaveRetentionRenderer = (params) => {
        const { data } = params;
        const rententionObj = rowDataDWRItemRef.current.find((item) => getUuid(item) === getUuid(data)) || {};

        return (
            <Checkbox
                name="retention"
                checked={rententionObj.retention}
                onChange={() => onChangeRetention(params)}
            />
        );
    };
    return (
        <>

            <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{t("WorkSpace")}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>{t("Consultants")}</Typography>
                    <Row className="mb-2">
                        <Col xs={6}>
                            <Table className="mb-0 table-small-height" bordered responsive>
                                <thead>
                                    <tr>
                                        <td>{t("SelectMainQuantitySurveyor")}</td>
                                        <td>{t("SelectedMainQuantitySurveyor")}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <MultiSelect
                                                disabled={disabled}
                                                disableSelected
                                                name="quantitySurveyors"
                                                className="form-control"
                                                options={usersOptions.map((user) => ({
                                                    name: user.name,
                                                    value: user.uuid
                                                }))}
                                                objectName="Receiver"
                                                setFieldValue={setFieldValue}
                                                defaultValue={values.quantitySurveyors}
                                            />
                                        </td>
                                        <td>
                                            {
                                                (values.quantitySurveyors && values.quantitySurveyors.length > 0) && (
                                                    values.quantitySurveyors.map((surveyor, index) => (
                                                        <span key={index}>
                                                            {surveyor.name}
                                                            {index !== values.quantitySurveyors.length - 1 ? ", " : " "}
                                                        </span>
                                                    ))
                                                )
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                                <thead>
                                    <tr>
                                        <td>{t("SelectArchitect")}</td>
                                        <td>{t("SelectedArchitect")}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <MultiSelect
                                                disabled={disabled}
                                                disableSelected
                                                name="architects"
                                                className="form-control"
                                                options={usersOptions.map((user) => ({
                                                    name: user.name,
                                                    value: user.uuid
                                                }))}
                                                objectName="Architect"
                                                setFieldValue={setFieldValue}
                                                defaultValue={values.architects}
                                            />
                                        </td>
                                        <td>
                                            {
                                                (values.architects && values.architects.length > 0) && (
                                                    values.architects.map((architect, index) => (
                                                        <span key={index}>
                                                            {architect.name}
                                                            {index !== values.architects.length - 1 ? ", " : " "}
                                                        </span>
                                                    ))
                                                )
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    <Typography component="span" style={{ width: "100%" }}>{t("Summary")}</Typography>
                    <Row className="mb-2">
                        <Col xs={12}>
                            <AgGridTable
                                columnDefs={summaryColumnDefs}
                                rowData={
                                    rowDataWorkSpaceRootLevel
                                }

                                onGridReady={(params) => onGridReady("summary", params, true)}
                                frameworkComponents={{
                                    actionDelete: ActionDeleteRenderer,
                                    uomCellRenderer: UOMCellRenderer,
                                    evaluatorCellRenderer: EvaluatorCellRenderer,
                                    SelectedEvaluatorRenderer
                                }}
                                onCellValueChanged={summaryCellChanged}

                                pagination={false}
                                singleClickEdit
                                stopEditingWhenCellsLoseFocus
                                gridHeight={500}
                                enableCellChangeFlash
                            />
                        </Col>
                    </Row>
                    <Row className="mb-2 mt-4">
                        <Col xs={12}>
                            <ButtonToolbar className="justify-content-end">
                                <div className="d-flex">
                                    <Button
                                        disabled={disabled}
                                        color="primary"
                                        onClick={(event) => downloadCSV(null, false)}
                                        className="mr-1"
                                    >
                                        <i className="fa fa-download mr-2" />
                                        <span>{t("Download.csv")}</span>
                                    </Button>

                                    <CSVReader
                                        ref={buttonRef}
                                        onFileLoad={handleOnUploadDrop}
                                        onError={handleOnUploadError}
                                        noClick
                                        noDrag
                                    >
                                        {() => (
                                            <ButtonSpinner
                                                text={t("Upload.csv")}
                                                icon="fa fa-upload"
                                                className="mr-1"
                                                onclick={handleOpenDialog}
                                                disabled={disabled}
                                            />
                                        )}
                                    </CSVReader>
                                    <Button
                                        disabled={disabled}
                                        color="primary"
                                        className="mr-1"
                                    >
                                        <CSVLink data={CSVTemplates.WorkRequest_WorkSpace_ListData} headers={CSVTemplates.WorkRequest_WorkSpace_ListHeaders} filename={CSVTemplates.WorkRequest_WorkSpace_TemplateFileName} style={{ color: "white" }}>
                                            <i className="fa fa-download mr-2" />
                                            {" "}
                                            {t("Template")}
                                        </CSVLink>
                                    </Button>
                                </div>

                                <div className="ml-4">
                                    {
                                        values.project
                                            ? (
                                                <>
                                                    <Button
                                                        disabled={disabled}
                                                        color="primary"
                                                        onClick={(event) => onAddItemManual(null, false)}
                                                        className="mr-1"
                                                    >
                                                        <i className="fa fa-plus mr-2" />
                                                        <span>{t("AddManual")}</span>
                                                    </Button>
                                                    <Button
                                                        disabled={disabled}
                                                        color="primary"
                                                        onClick={(event) => openDialogAddForecast()}
                                                        className="mr-1"
                                                    >
                                                        <i className="fa fa-plus mr-2" />
                                                        <span>{t("AddForecast")}</span>
                                                    </Button>
                                                    <Button
                                                        disabled={disabled}
                                                        color="primary"
                                                        onClick={(event) => openDialogAddContract()}
                                                        className="mr-1"
                                                    >
                                                        <i className="fa fa-plus mr-2" />
                                                        <span>{t("AddContract")}</span>
                                                    </Button>
                                                </>
                                            )
                                            : (
                                                <>
                                                    <Button
                                                        disabled={disabled}
                                                        color="primary"
                                                        onClick={(event) => onAddItemManual(null, false)}
                                                        className="mr-1"
                                                    >
                                                        <i className="fa fa-plus mr-2" />
                                                        <span>{t("AddManual")}</span>
                                                    </Button>
                                                    <Button
                                                        disabled={disabled}
                                                        color="primary"
                                                        onClick={() => openDialogAddCatalogue()}
                                                        className="mr-1"
                                                    >
                                                        <i className="fa fa-plus mr-2" />
                                                        <span>{t("AddCatalogue")}</span>
                                                    </Button>
                                                </>
                                            )
                                    }

                                </div>

                            </ButtonToolbar>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <AgGridTable
                                columnDefs={itemColumnDefs}
                                rowData={rowDataDWRItem}
                                pagination={false}
                                singleClickEdit
                                stopEditingWhenCellsLoseFocus
                                gridHeight={400}
                                onGridReady={(params) => onGridReady("dwrItem", params, true)}
                                frameworkComponents={{
                                    actionDelete: ActionDeleteRenderer,
                                    uomCellRenderer: UOMCellRenderer,
                                    groupCellRenderer: GroupCellRenderer,
                                    haveRetentionRenderer: HaveRetentionRenderer
                                }}
                                treeData
                                autoGroupColumnDef={{
                                    headerName: t("Group"),
                                    minWidth: 300,
                                    cellRendererParams: {
                                        suppressCount: true,
                                        innerRenderer: "groupCellRenderer"
                                    }
                                }}
                                rowSelected={(event) => {
                                    console.log("selected", event);
                                    event.node.childrenAfterGroup.forEach((a) => {
                                        a.selectThisNode(event.node.isSelected());
                                    });
                                }}
                                // rowSelection="multiple"
                                // groupSelectsChildren
                                animateRows
                                groupDefaultExpanded={-1}
                                getDataPath={(data) => data.groupNumber}
                                enableCellChangeFlash
                                onCellValueChanged={cellValueChanged}
                            />
                        </Col>
                    </Row>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

WorkSpace.defaultProps = {
    paginationPageSizeProject: 10,
    gridHeightProject: 150,
    gridHeightTrade: 400,
    defaultExpanded: false,
    borderTopColor: "#AEC57D"
};

export default WorkSpace;
