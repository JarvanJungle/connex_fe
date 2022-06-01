import React, { useState, useEffect } from "react";
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
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { formatNumberForRow } from "helper/utilities";
// import DWRItems from "./DWRItems";

const WorkSpaceComponent = (props) => {
    const {
        t,
        values = {},
        setFieldValue,
        borderTopColor,
        defaultExpanded = true,
        users,
        onAddChildItem,
        onDeleteItem,
        rowDataWorkSpace = [],
        uoms,
        onCellValueChanged
    } = props;
    const [gridAPI, setGridApi] = useState({
        summary: null,
        dwrItem: null
    });

    useEffect(() => {
        if (gridAPI.dwrItem) {
            setTimeout(() => {
                gridAPI.dwrItem.expandAll();
            }, 100);
        }
    }, [rowDataWorkSpace]);

    const onGridReady = (gridApiName, params, columnFit = false) => {
        if (columnFit) {
            params.api.sizeColumnsToFit();
        }
        gridAPI[gridApiName] = params.api;

        setGridApi(gridAPI);

        console.log("onGridReady");
    };

    const EvaluatorCellRenderer = (params) => {
        const { value = [] } = params;
        let nameText = "";
        if (value.length) {
            nameText = `${value.length} Users Selected`;
        }
        return (
            <span>
                {nameText}
            </span>
        );
    };

    const EvaluatorSelectedCellRenderer = (params) => {
        const { value = [] } = params;
        let nameText = "";
        value?.forEach((item, i) => {
            nameText += item.name + (value.length - 1 === i ? "" : ", ");
        });
        return (
            <span>
                {nameText}
            </span>
        );
    };

    const ActionDeleteRenderer = (params) => {
        const {
            data,
            agGridReact
        } = params;
        const { rowData } = agGridReact.props;
        return (
            <IconButton
                size="small"
                onClick={() => onDeleteItem(data.uuid, rowData)}
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
                </span>
                {
                    !(quantity && unitPrice)
                  && (
                      <IconButton
                          size="small"
                          onClick={() => onAddChildItem(data, rowData)}
                          style={{ color: "blue" }}
                      >
                          <i className="fa fa-angle-down" />
                      </IconButton>
                  )
                }

            </>
        );
    };

    const UOMCellRenderer = (params) => {
        const { value, data } = params;
        return (
            <span>
                {
                    (value != null && typeof value === "object") ? value.uomName : value
                }
            </span>
        );
    };

    const handleExport = () => {
        console.log("gridAPI=========", gridAPI);
        gridAPI.dwrItem.exportDataAsCsv({
            fileName: CSVTemplate.WorkSpace_File_Name,
            allColumns: true
            // processCellCallback: (cell) =>
            // // if (cell.column?.colId === "updatedOn") {
            // //     return formatDateString(
            // //         cell.value,
            // //         CUSTOM_CONSTANTS.DDMMYYYHHmmss
            // //     );
            // // }
            // {
            //     console.log(cell);
            //     return cell.value;
            // }

        });
    };

    const getAllRowNodes = () => {
        const rowData = [];
        gridAPI?.dwrItem?.forEachNode((node) => rowData.push(node.data));
        return rowData;
    };

    const cellValueChanged = (params) => {
        const rowData = getAllRowNodes();
        onCellValueChanged(params.data, rowData);
    };

    const summaryColumnDefs = [
        {
            headerName: t("Work Code"),
            field: "workCode"
            // editable: true
        },
        {
            headerName: t("Description"),
            field: "description"
            // editable: true
        },
        {
            headerName: t("Weightage"),
            field: "weightage",
            valueGetter: (params) => {
                const { data } = params;
                const { weightage } = data;

                return weightage ? Number(weightage)?.toFixed(2) : "";
            },
            cellRenderer: (params) => {
                const { value } = params;
                return value ? `${value} %` : "";
            }
        },
        {
            headerName: t("TotalAmount"),
            field: "totalAmount",
            valueGetter: (params) => {
                const { data } = params;
                const { totalAmount } = data;
                return formatNumberForRow({ value: totalAmount });
            }
        },
        {
            headerName: t("RetentionPercentage"),
            field: "retentionPercentage",
            editable: false,
            cellRenderer: (params) => `${params.value || 0}%`
        },
        {
            headerName: t("SelectEvaluator"),
            field: "evaluators",
            editable: false,
            cellRenderer: "evaluatorCellRenderer",
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: users,
                cellRenderer: "evaluatorCellRenderer"
            }
        },
        {
            headerName: t("SelectedEvaluator"),
            field: "evaluators",
            editable: false,
            cellRenderer: "evaluatorSelectedCellRenderer",
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: users,
                cellRenderer: "evaluatorSelectedCellRenderer"
            }
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
            field: "workCode"

        },
        {
            headerName: t("Description"),
            field: "description"
        },
        {
            headerName: t("UOM"),
            field: "uom",
            cellRenderer: "uomCellRenderer",
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: uoms,
                cellRenderer: "uomCellRenderer"
            }
        },
        {
            headerName: t("Retention"),
            field: "retention",
            editable: false,
            cellRenderer: (params) => `<input
                    type="checkbox"
                    checked=${params.value}
                    readOnly
                    disabled
                />`
        },
        {
            headerName: t("Weightage"),
            field: "weightage",
            valueGetter: (params) => {
                const { data } = params;
                const { weightage } = data;
                return weightage ? Number(weightage)?.toFixed(2) : "";
            },
            cellRenderer: (params) => {
                const { value } = params;
                return value ? `${value} %` : "";
            }
        },
        {
            headerName: t("Quantity"),
            field: "quantity"
        },
        {
            headerName: t("UnitPrice"),
            field: "unitPrice",
            valueGetter: (params) => {
                const { data } = params;
                const { unitPrice } = data;
                return unitPrice ? parseFloat(unitPrice).toFixed(2) : "";
            }
        },
        {
            headerName: t("TotalAmount"),
            field: "totalAmount",
            valueGetter: (params) => {
                const { data } = params;
                const { totalAmount } = data;
                return totalAmount ? parseFloat(totalAmount).toFixed(2) : "";
            }
        },
        {
            headerName: t("Remarks"),
            field: "remarks"
        }
    ];
    const rowDataWorkSpaceRootLevel = rowDataWorkSpace.filter((x) => x.groupNumber.length === 1);
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
                                                objectName="Users"
                                                setFieldValue={setFieldValue}
                                                defaultValue={values.quantitySurveyors}
                                                disabled
                                                displaySelected={false}
                                            />
                                        </td>
                                        <td>
                                            {
                                                (values.quantitySurveyors && values.quantitySurveyors.length > 0) && (
                                                    values.quantitySurveyors.map((surveyor, index) => (
                                                        <div key={index}>
                                                            {surveyor.name}
                                                            {" "}
                                                        </div>
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
                                                name="architects"
                                                className="form-control"
                                                options={users.map((user) => ({
                                                    name: user.name,
                                                    value: user.uuid
                                                }))}
                                                objectName="Architect"
                                                setFieldValue={setFieldValue}
                                                defaultValue={values.architects}
                                                disabled
                                                displaySelected={false}
                                            />
                                        </td>
                                        <td>
                                            {
                                                (values.architects && values.architects.length > 0) && (
                                                    values.architects.map((architect, index) => (
                                                        <div key={index}>{architect.name}</div>
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
                    <Row className="mb-3">
                        <Col xs={12}>
                            <AgGridTable
                                sizeColumnsToFit
                                columnDefs={summaryColumnDefs}
                                rowData={rowDataWorkSpaceRootLevel}
                                pagination={false}
                                singleClickEdit
                                stopEditingWhenCellsLoseFocus
                                gridHeight={250}
                                onGridReady={(params) => onGridReady("summary", params, true)}
                                frameworkComponents={{
                                    actionDelete: ActionDeleteRenderer,
                                    uomCellRenderer: UOMCellRenderer,
                                    evaluatorCellRenderer: EvaluatorCellRenderer,
                                    evaluatorSelectedCellRenderer: EvaluatorSelectedCellRenderer
                                }}
                                enableCellChangeFlash
                                suppressCellFlash
                                suppressExcelExport
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <ButtonToolbar className="justify-content-end">
                                <Button
                                    color="primary"
                                    onClick={handleExport}
                                    className="mr-1"
                                >
                                    <i className="fa fa-download mr-2" />
                                    <span>{t("Download CSV")}</span>
                                </Button>

                            </ButtonToolbar>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <AgGridTable
                                sizeColumnsToFit
                                columnDefs={itemColumnDefs}
                                rowData={rowDataWorkSpace}
                                pagination={false}
                                singleClickEdit={false}
                                stopEditingWhenCellsLoseFocus
                                gridHeight={250}
                                onGridReady={(params) => onGridReady("dwrItem", params)}
                                frameworkComponents={{
                                    actionDelete: ActionDeleteRenderer,
                                    uomCellRenderer: UOMCellRenderer,
                                    groupCellRenderer: GroupCellRenderer
                                }}
                                treeData
                                autoGroupColumnDef={{
                                    headerName: t("Group"),
                                    minWidth: 100,
                                    cellRendererParams: {
                                        suppressCount: true,
                                        innerRenderer: "groupCellRenderer"
                                    }
                                }}
                                animateRows
                                groupDefaultExpanded={-1}
                                getDataPath={(data) => data.groupNumber}
                                enableCellChangeFlash
                                onCellValueChanged={cellValueChanged}
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                            />
                        </Col>
                    </Row>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

WorkSpaceComponent.defaultProps = {
    paginationPageSizeProject: 10,
    gridHeightProject: 150,
    gridHeightTrade: 400,
    defaultExpanded: false,
    borderTopColor: "#AEC57D"
};

export default WorkSpaceComponent;
