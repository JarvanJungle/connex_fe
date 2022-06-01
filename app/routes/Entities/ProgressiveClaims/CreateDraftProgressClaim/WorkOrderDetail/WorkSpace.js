import React, {
    useEffect,
    useState
} from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { AgGridTable } from "routes/components";
import {
    Row, Card, CardBody, CardHeader, Col, Table
} from "components";
import IconButton from "@material-ui/core/IconButton";
import { workSpaceColumnDefs, workSpaceMockData } from "../Helper";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true.valueOf,
    tooltipComponent: "customTooltip"
};

const WorkSpace = (props) => {
    const {
        rowData,
        gridHeight,
        defaultExpanded,
        borderTopColor,
        onCellValueChanged,
        onAddChildItem,
        users,
        uoms,

    } = props;
    const history = useHistory();
    const { t } = useTranslation();
    const [woDraftClaimState, setWoDraftClaimState] = useState({
        gridApi: null
    });

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setWoDraftClaimState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    const GroupCellRenderer = (params) => {
        const { data, agGridReact } = params;
        const { row } = agGridReact.props;
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
                            onClick={() => onAddChildItem(data, row)}
                            style={{ color: "blue" }}
                        >
                            <i className="fa fa-angle-down" />
                        </IconButton>
                    )
                }

            </>
        );
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

    useEffect(() => {
        if (woDraftClaimState.gridApi) {
            setTimeout(() => {
                woDraftClaimState.gridApi.expandAll();
            }, 100);
        }
    }, [rowData]);

    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("Work Space")}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <Row>
                    <Col xs={4}>
                        <Card className="mb-4">
                            <CardHeader tag="h6">
                                {t("Main Quantity Surveyor & Architect")}
                            </CardHeader>
                            <CardBody>
                                <Table className="mb-0" bordered responsive>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: "50%" }} className="align-middle">{t("Select Main Quantity Surveyor")}</td>
                                            <td style={{ width: "50%" }} className="align-middle">{t("Selected Quantity Surveyor(s)")}</td>
                                        </tr>
                                        <tr>
                                            <td className="align-middle">
                                                <span className="text-inverse">Arcadis@getnada.com</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-inverse">Arcadis</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: "50%" }} className="align-middle">{t("Select Architect")}</td>
                                            <td style={{ width: "50%" }} className="align-middle">{t("Select Architect")}</td>
                                        </tr>
                                        <tr>
                                            <td className="align-middle">
                                                <span className="text-inverse">ADDP@getnada.com</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-inverse">ADDP</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12}>
                        <Card className="mb-4">
                            <CardHeader tag="h6">
                                {t("Summary")}
                            </CardHeader>
                            <CardBody>
                                <Table className="mb-0" bordered responsive>
                                    <thead>
                                        <tr>
                                            <td style={{ width: "10%" }} className="align-middle">{t("Work Code")}</td>
                                            <td style={{ width: "20%" }} className="align-middle">{t("Description")}</td>
                                            <td style={{ width: "10%" }} className="align-middle">{t("Weight age")}</td>
                                            <td style={{ width: "10%" }} className="align-middle">{t("Total Amount")}</td>
                                            <td style={{ width: "10%" }} className="align-middle">{t("Retention Percentage")}</td>
                                            <td style={{ width: "10%" }} className="align-middle">{t("Select Evaluators")}</td>
                                            <td style={{ width: "10%" }} className="align-middle">{t("Selected Evaluators")}</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="align-middle">
                                                <span className="text-inverse">STR0004</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-inverse">REBAR</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-inverse">100,00%</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-inverse">SGD 500,000,00</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-inverse">10,00%</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-inverse">Arcadis@getnada.com</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-inverse">Arcadis</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12}>
                        <AgGridTable
                            columnDefs={workSpaceColumnDefs(t)}
                            defaultColDef={defaultColDef}
                            rowData={workSpaceMockData}
                            pagination
                            gridHeight={580}
                            paginationPageSize={10}
                            onGridReady={onGridReady}
                            rowSelection="multiple"
                            rowMultiSelectWithClick
                            onRowDoubleClicked={() => { }}
                            onCellClicked={() => { }}
                            suppressRowClickSelection
                            onSelectionChanged={() => { }}
                            sizeColumnsToFit
                            singleClickEdit={false}
                            stopEditingWhenCellsLoseFocus
                            frameworkComponents={{
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
                        />
                    </Col>
                </Row>
            </AccordionDetails>
        </Accordion>
    );
};

export default WorkSpace;
