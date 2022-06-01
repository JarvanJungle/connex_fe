import React, { useEffect, useRef, useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
    Col,
    Row,
    Table,
    MultiSelect as RawMultiSelect,
    ButtonToolbar,
    Button
} from "components";
import { AgGridTable } from "routes/components";
import IconButton from "@material-ui/core/IconButton";
import CSVTemplates from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import { v4 as uuidv4 } from "uuid";
import useToast from "routes/hooks/useToast";
import { CSVReader } from "react-papaparse";
import ButtonSpinner from "components/ButtonSpinner";
import { Checkbox } from "primereact/checkbox";
// import DWRItems from "./DWRItems";
import { MultiSelect } from "routes/DeveloperModule/DWR/components/MultiSelect/MultiSelect";
// import { MultiSelect as } from "routes/DeveloperModule/DWR/components/MultiSelect/MultiSelect";
const WorkSpace = (props) => {
    const {
        t,
        values,
        setFieldValue,
        borderTopColor,
        users,
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
        openDialogAddContract,
        onChangeList
    } = props;

    const [gridAPI, setGridApi] = useState({
        summary: null,
        dwrItem: null
    });
    const [selectedMainQSOptions, setSelectedMainQSOptions] = useState([]);
    const [selectedArchitectOptions, setSelectedArchitectOptions] = useState([]);
    const rowDataDWRItemRef = useRef(rowDataDWRItem || []);
    const showToast = useToast();

    const onGridReady = (gridApiName, params, columnFit = false) => {
        if (columnFit) {
            params.api.sizeColumnsToFit();
        }

        gridAPI[gridApiName] = params.api;
        setGridApi(gridAPI);
        // allColumnIds
        // params.api.getAllColumns().forEach((column) => {
        //     allColumnIds.push(column.colId);
        // });
        // params.api.autoSizeColumns(allColumnIds, false);
    };
    const deleteItemSelectedEvaluator = (params, item) => {
        onDeleteItemSelectedEvaluator(params, item, rowDataDWRItemRef.current);
    };
    const EvaluatorCellRenderer = (params) => {
        const { value } = params;
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
                onClick={() => onDeleteItem((data.uuid || data.itemUuid), rowData)}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        );
    };

    const GroupCellRenderer = (params) => {
        const { data = {}, agGridReact } = params;
        const { rowData } = agGridReact.props;
        const { groupNumber = [] } = data;
        const value = groupNumber.at(-1);
        const maxLengthLevel = 7;
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

                { groupNumber.length <= maxLengthLevel && (
                    <IconButton
                        size="small"
                        onClick={() => onAddChildItem(data, rowData)}
                        style={{ color: "#AEC57D" }}
                    >
                        <i className="fa fa-plus-circle" />
                    </IconButton>
                )}
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

    const onChangeRetention = (params) => {
        const { data } = params;

        const rootGroup = data.groupNumber.at(0);

        const newData = rowDataDWRItemRef.current.map((item) => {
            if (item.uuid === data.uuid) {
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
        const rententionObj = rowDataDWRItemRef.current.find((item) => item.uuid === data.uuid) || {};
        return (
            <Checkbox
                name="retention"
                checked={rententionObj.retention}
                onChange={() => onChangeRetention(params)}
            />
        );
    };

    const summaryColumnDefs = [
        {
            headerName: t("Work Code"),
            field: "workCode"
            // minWidth: 250
        },
        {
            headerName: t("Description"),
            field: "description"
            // minWidth: 250
        },
        {
            headerName: t("Weightage"),
            field: "weightage",
            minWidth: 200,
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${(value * 100).toFixed(2)} %` : "";
            }
        },
        {
            headerName: t("TotalAmount"),
            field: "totalAmount",
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${Number(value).toFixed(2)}` : "";
            }
        },
        {
            headerName: `${t("RetentionPercentage")} %`,
            field: "retentionPercentage",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            }),
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${Number(value).toFixed(2)}` : "";
            }
        },
        {
            headerName: t("SelectEvaluator"),
            field: "evaluator",
            editable: true,
            cellRenderer: "evaluatorCellRenderer",
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: (params) => {
                const { data } = params;
                const { selectedEvaluator = [] } = data;
                const selectedIds = selectedEvaluator.map((item) => item.uuid);
                console.log("selectedIds", selectedIds);
                return {
                    values: selectedEvaluator.length ? users.filter((item) => !selectedIds.includes(item.uuid)) : users,
                    cellRenderer: "evaluatorCellRenderer"
                };
            },
            minWidth: 250,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })

        },
        {
            headerName: t("SelectedEvaluator"),
            field: "selectedEvaluator",
            cellRenderer: "SelectedEvaluatorRenderer",
            valueGetter: (params) => {
                const { data = {} } = params;
                return data.selectedEvaluator || [];
            },
            // minWidth: 250,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })
        }
    ];
    const itemColumnDefs = [
        {
            headerName: t("WorkCode"),
            field: "workCode",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })

        },
        {
            headerName: `${t("Description")}*`,
            field: "description",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })

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
                return !data.haveChildren;
            },
            cellStyle: (params) => {
                const { data } = params;
                if (!data.haveChildren) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                } return {};
            }

        },
        {
            headerName: t("Retention"),
            field: "retention",
            cellRenderer: "haveRetentionRenderer",
            cellStyle: {
                display: "flex",
                alignItems: "center",
                paddingBottom: "20px"
            }
        },
        {
            headerName: t("Weightage"),
            field: "weightage",
            // valueGetter: (params) => {
            //     const rowData = getAllRowNodes();
            //     console.log("row data weightage", rowData);
            //     const { data } = params;
            //     const { quantity = 0, unitPrice = 0 } = data;
            //     return (Number(quantity) * Number(unitPrice)) / 1;
            // },
            aggFunc: "sum",
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${(value * 100).toFixed(2)} %` : "";
            }
            // enableValue: true
        },
        {
            headerName: `${t("Quantity")}*`,
            field: "quantity",
            editable: (params) => {
                const { data } = params;
                return !data.haveChildren;
            },
            cellStyle: (params) => {
                const { data } = params;
                if (!data.haveChildren) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                } return {};
            },
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${Number(value).toFixed(2)}` : "";
            }

        },
        {
            headerName: `${t("UnitPrice")}*`,
            field: "unitPrice",
            editable: (params) => {
                const { data } = params;
                return !data.haveChildren;
            },
            cellStyle: (params) => {
                const { data } = params;
                if (!data.haveChildren) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                } return {};
            },
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${Number(value).toFixed(2)}` : "";
            }
        },
        {
            headerName: t("TotalAmount"),
            field: "totalAmount",
            valueGetter: (params) => {
                const { data } = params;
                const { quantity = 0, unitPrice = 0 } = data;
                return Number(quantity) * Number(unitPrice);
            },
            aggFunc: "sum",
            cellRenderer: (params) => {
                const { value = 0 } = params;
                return value ? `${Number(value).toFixed(2)}` : "";
            }
        },
        {
            headerName: t("Remarks"),
            field: "remarks",
            editable: true,
            cellStyle: () => ({
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            })
        }
    ];

    const getAllRowNodes = () => {
        const rowData = [];
        gridAPI?.dwrItem?.forEachNode((node) => {
            rowData.push(node);
        });
        return rowData;
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
                item.data.totalAmount = item.aggData.totalAmount || 0;
            } else {
                item.data.totalAmount = Number(item.data.quantity || 0) * Number(item.data.unitPrice || 0) || item.data.totalAmount || 0;
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
        onSummaryCellChanged(params, rowDataDWRItemRef.current);
    };

    const downloadCSV = () => {
        gridAPI.dwrItem.exportDataAsCsv({
            fileName: CSVTemplates.WorkSpace_File_Name,
            allColumns: true
        });
    };

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
        showToast("error", err);
    };

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
                        groupName: groupCode,
                        parentGroup: parentGroupCode,
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
            if (item.groupNumber.length > 1) item.parentGroup = dicFindParent[item.groupCode];
            if (filered > 1) {
                item.haveChildren = true;
            } else {
                item.haveChildren = false;
            }
            return item;
        });
        onChangeList(massUpload);
    };
    useEffect(() => {
        if (gridAPI.dwrItem) {
            setTimeout(() => {
                gridAPI.dwrItem.expandAll();
            }, 100);
        }
        rowDataDWRItemRef.current = rowDataDWRItem;
    }, [rowDataDWRItem]);

    useEffect(() => {
        if (rowDataDWRItem?.length > 0) {
            const rootItems = rowDataDWRItem.filter((x) => x.groupNumber.length === 1);
            gridAPI?.summary?.setRowData(rootItems);
        }
    }, [rowDataDWRItem]);

    const rowDataWorkSpaceRootLevel = rowDataDWRItem.filter((x) => x?.groupNumber?.length === 1);
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
                                                name="quantitySurveyors"
                                                className="form-control"
                                                options={users.map((user) => ({
                                                    name: user.name,
                                                    value: user.uuid
                                                }))}
                                                objectName="Main Quantity Surveyor"
                                                setFieldValue={setFieldValue}
                                                defaultValue={values.quantitySurveyors}
                                                disableSelected
                                                updateSelected={(data) => setSelectedMainQSOptions(data)}
                                                displayValue
                                                selectedOptions={selectedMainQSOptions}
                                            />
                                        </td>
                                        <td>
                                            {/* {
                                                (values.quantitySurveyors && values.quantitySurveyors.length > 0) && (
                                                    values.quantitySurveyors.map((surveyor, index) => (
                                                        <span key={index}>
                                                            {surveyor.name}
                                                            {values.quantitySurveyors.length - 1 !== index ? ", " : ""}
                                                        </span>
                                                    ))
                                                )
                                            } */}
                                            {
                                                selectedMainQSOptions.length > 0
                                                && (
                                                    <>
                                                        <ul className="list-group selected-items">
                                                            {
                                                                selectedMainQSOptions.map((selected, index) => (
                                                                    <li className="list-group-item py2 no-border" key={index}>
                                                                        {/* {withSerialNumber && `${index + 1}. `} */}
                                                                        {selected.name}
                                                                        <span
                                                                            className="btn btn-xs pull-right"
                                                                            onClick={
                                                                                () => {
                                                                                    const temp = selectedMainQSOptions;
                                                                                    temp.splice(index, 1);
                                                                                    setSelectedMainQSOptions([]);
                                                                                    setSelectedMainQSOptions([...temp]);
                                                                                }
                                                                            }
                                                                        >
                                                                            <span className="fa fa-close close-button" aria-hidden="true" />
                                                                        </span>

                                                                    </li>
                                                                ))
                                                            }
                                                        </ul>

                                                        <button
                                                            type="button"
                                                            className="btn"
                                                            onClick={() => setSelectedMainQSOptions([])}
                                                            style={{
                                                                color: "#4472C4",
                                                                border: "unset",
                                                                cursor: "pointer",
                                                                background: "unset",
                                                                textDecoration: "underline",
                                                                padding: 0,
                                                                textAlign: "left"
                                                            }}
                                                        >
                                                            Clear all
                                                        </button>

                                                    </>
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
                                                name="architects"
                                                className="form-control"
                                                options={users.map((user) => ({
                                                    name: user.name,
                                                    value: user.uuid
                                                }))}
                                                objectName="Architect"
                                                setFieldValue={setFieldValue}
                                                defaultValue={values.architects}
                                                disableSelected
                                                updateSelected={(data) => setSelectedArchitectOptions(data)}
                                                displayValue
                                                selectedOptions={selectedArchitectOptions}
                                            />
                                        </td>
                                        <td>

                                            {/* {
                                                (values.architects && values.architects.length > 0) && (
                                                    values.architects.map((architect, index) => (
                                                        <span key={index}>
                                                            {architect.name}
                                                            {values.architects.length - 1 !== index ? ", " : ""}
                                                        </span>
                                                    ))
                                                )
                                            } */}
                                            {
                                                selectedArchitectOptions.length > 0
                                                && (
                                                    <>
                                                        <ul className="list-group selected-items">
                                                            {
                                                                selectedArchitectOptions.map((selected, index) => (
                                                                    <li className="list-group-item py2 no-border" key={index}>
                                                                        {/* {withSerialNumber && `${index + 1}. `} */}
                                                                        {selected.name}
                                                                        <span
                                                                            className="btn btn-xs pull-right"
                                                                            onClick={
                                                                                () => {
                                                                                    const temp = selectedArchitectOptions;
                                                                                    temp.splice(index, 1);
                                                                                    setSelectedArchitectOptions([...temp]);
                                                                                }
                                                                            }
                                                                        >
                                                                            <span className="fa fa-close close-button" aria-hidden="true" />
                                                                        </span>

                                                                    </li>
                                                                ))
                                                            }
                                                        </ul>

                                                        <button
                                                            type="button"
                                                            className="btn"
                                                            onClick={() => setSelectedArchitectOptions([])}
                                                            style={{
                                                                color: "#4472C4",
                                                                border: "unset",
                                                                cursor: "pointer",
                                                                background: "unset",
                                                                textDecoration: "underline",
                                                                padding: 0,
                                                                textAlign: "left"
                                                            }}
                                                        >
                                                            Clear all
                                                        </button>

                                                    </>
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
                                sizeColumnsToFit
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
                                gridHeight={300}
                                enableCellChangeFlash
                            />
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={12}>
                            <ButtonToolbar className="justify-content-end mb-2 mt-4">
                                <div className="d-flex">
                                    <Button
                                        color="primary"
                                        onClick={() => downloadCSV(null, false)}
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
                                            // isLoading={listStates.isLoading}
                                            />
                                        )}
                                    </CSVReader>
                                    <Button
                                        color="primary"
                                        // onClick={(event) => downloadTemplate(null, false)}
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
                                                        color="primary"
                                                        onClick={() => onAddItemManual(null, false)}
                                                        className="mr-1"
                                                    >
                                                        <i className="fa fa-plus mr-2" />
                                                        <span>{t("AddManual")}</span>
                                                    </Button>
                                                    <Button
                                                        color="primary"
                                                        onClick={() => openDialogAddForecast()}
                                                        className="mr-1"
                                                    >
                                                        <i className="fa fa-plus mr-2" />
                                                        <span>{t("AddForecast")}</span>
                                                    </Button>
                                                    <Button
                                                        color="primary"
                                                        onClick={() => openDialogAddContract()}
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
                                                        color="primary"
                                                        onClick={() => onAddItemManual(null, false)}
                                                        className="mr-1"
                                                    >
                                                        <i className="fa fa-plus mr-2" />
                                                        <span>{t("AddManual")}</span>
                                                    </Button>
                                                    <Button
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
                                sizeColumnsToFit
                                onGridReady={(params) => onGridReady("dwrItem", params, true)}
                                frameworkComponents={{
                                    actionDelete: ActionDeleteRenderer,
                                    uomCellRenderer: UOMCellRenderer,
                                    groupCellRenderer: GroupCellRenderer,
                                    haveRetentionRenderer: HaveRetentionRenderer
                                }}
                                treeData
                                rowSelection="multiple"
                                groupSelectsChildren
                                suppressRowClickSelection
                                autoGroupColumnDef={{
                                    headerName: t("Group"),
                                    minWidth: 300,
                                    cellRendererParams: {
                                        suppressCount: true,
                                        innerRenderer: "groupCellRenderer"
                                    }
                                }}
                                // rowSelected={(event) => {
                                //     event.node.childrenAfterGroup.forEach((a) => {
                                //         a.selectThisNode(event.node.isSelected());
                                //     });
                                // }}
                                // rowSelection="multiple"
                                // groupSelectsChildren
                                animateRows
                                groupDefaultExpanded={-1}
                                getDataPath={(data) => data.groupNumber}
                                enableCellChangeFlash
                                onCellValueChanged={cellValueChanged}
                                // onCellEditingStopped={onCellEditingStopped}

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
