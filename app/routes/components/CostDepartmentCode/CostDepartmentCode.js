import React, { useEffect, useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import {
    Nav,
    NavItem,
    NavLink,
    Card,
    CardBody
} from "components";
import { makeStyles } from "@material-ui/core/styles";
import i18next from "i18next";
import { ButtonToolbar, Col, Row } from "components";
import { Button } from "@material-ui/core";
import { AgGridTable } from "..";
import AddItemCostDepartment from "./AddItemCostDepartment";

const CostDepartmentCodeColDefs = [
    {
        headerName: i18next.t("S/N"),
        field: "index",
        suppressSizeToFit: false,
        valueGetter: ({ node }) => node.rowIndex + 1
    },
    {
        headerName: i18next.t("Code"),
        field: "code",
        suppressSizeToFit: false
    },
    {
        headerName: i18next.t("Remarks"),
        field: "remarks",
        suppressSizeToFit: false
    }
];

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

const defaultColDef = {
    editable: false,
    filter: false,
    floatingFilter: false,
    resizable: true,
    sortable: true
};

const CostDepartmentCode = (props) => {
    const {
        rowDataCost,
        rowDataDepartment,
        gridHeight,
        defaultExpanded,
        borderTopColor,
        activeTab,
        setActiveTab,
        paginationPageSize,
        addCostCode,
        addDepartmentCode,
        disabled
    } = props;

    const { t } = useTranslation();
    const classes = useStyles();

    const [showAddCost, setShowAddCost] = useState();
    const [showErrorCost, setShowErrorCost] = useState(false);
    const [cost, setCost] = useState({
        code: "",
        remarks: ""
    });

    const [showAddDepartment, setShowAddDepartment] = useState();
    const [showErrorDepartment, setShowErrorDepartment] = useState(false);
    const [department, setDepartment] = useState({
        code: "",
        remarks: ""
    });

    const handleAddCostToList = () => {
        if (cost.code) {
            addCostCode(cost);
            setShowAddCost(false);
            setCost({
                code: "",
                remarks: ""
            });
            setShowErrorCost(false);
        } else {
            setShowErrorCost(true);
        }
    };

    const handleAddDepartmentToList = () => {
        if (department.code) {
            addDepartmentCode(department);
            setShowAddDepartment(false);
            setDepartment({
                code: "",
                remarks: ""
            });
            setShowErrorDepartment(false);
        } else {
            setShowErrorDepartment(true);
        }
    };

    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("Cost & Department Code")}</Typography>
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
                                    {t("Cost Code")}
                                </span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" className={activeTab === 2 ? "active" : ""} onClick={() => setActiveTab(2)}>
                                <span className="mx-0">
                                    {t("Department Code")}
                                </span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    {
                        activeTab === 1
                            ? (
                                <Row>
                                    <Col lg={12}>
                                        <ButtonToolbar className="justify-content-end mb-2">
                                            <Button
                                                color="primary"
                                                onClick={() => {
                                                    setShowAddCost(true);
                                                    setShowErrorCost(false);
                                                    setCost({ code: "", remarks: "" });
                                                }}
                                                disabled={disabled}
                                                className="mr-1 btn btn-primary"
                                                style={{
                                                    right: 16, top: 5, textTransform: "none", fontSize: 12, lineHeight: "18px"
                                                }}
                                            >
                                                <span className="mr-1">+</span>
                                                <span>{t("Add Code")}</span>
                                            </Button>
                                        </ButtonToolbar>
                                    </Col>
                                    <Col lg={12}>
                                        <Card className={`${classes["custom-card"]}`}>
                                            <CardBody>
                                                <Typography component="span" style={{ width: "100%" }}>
                                                    <AgGridTable
                                                        columnDefs={CostDepartmentCodeColDefs}
                                                        rowData={rowDataCost}
                                                        sizeColumnsToFit
                                                        onComponentStateChanged={(params) => {
                                                            params.api.sizeColumnsToFit();
                                                        }}
                                                        paginationPageSize={paginationPageSize}
                                                        pagination={rowDataCost.length > 0}
                                                        gridHeight={
                                                            rowDataCost.length > 0
                                                                ? gridHeight
                                                                : 145
                                                        }
                                                    />
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            ) : (
                                <Row>
                                    <Col lg={12}>
                                        <ButtonToolbar className="justify-content-end mb-2">
                                            <Button
                                                color="primary"
                                                onClick={() => {
                                                    setShowAddDepartment(true);
                                                    setShowErrorDepartment(false);
                                                    setDepartment({ code: "", remarks: "" });
                                                }}
                                                disabled={disabled}
                                                className="mr-1 btn btn-primary"
                                                style={{
                                                    right: 16, top: 5, textTransform: "none", fontSize: 12, lineHeight: "18px"
                                                }}
                                            >
                                                <span className="mr-1">+</span>
                                                <span>{t("Add Code")}</span>
                                            </Button>
                                        </ButtonToolbar>
                                    </Col>
                                    <Col lg={12}>
                                        <Card className={`${classes["custom-card"]}`}>
                                            <CardBody>
                                                <Typography component="span" style={{ width: "100%" }}>
                                                    <AgGridTable
                                                        columnDefs={CostDepartmentCodeColDefs}
                                                        colDef={defaultColDef}
                                                        rowData={rowDataDepartment}
                                                        sizeColumnsToFit
                                                        onComponentStateChanged={(params) => {
                                                            params.api.sizeColumnsToFit();
                                                        }}
                                                        paginationPageSize={paginationPageSize}
                                                        pagination={rowDataDepartment.length > 0}
                                                        gridHeight={
                                                            rowDataDepartment.length > 0
                                                                ? gridHeight
                                                                : 145
                                                        }
                                                    />
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            )
                    }
                </Typography>
                <AddItemCostDepartment
                    isShow={showAddCost}
                    showErrorCode={showErrorCost}
                    onHide={() => setShowAddCost(false)}
                    title={t("Add New Cost Code")}
                    onPositiveAction={() => { handleAddCostToList(); }}
                    onNegativeAction={() => {
                        setShowAddCost(false);
                    }}
                    pageSize={10}
                    getRowNodeId={(data) => data?.uuid}
                    value={cost}
                    setValue={setCost}
                />
                <AddItemCostDepartment
                    isShow={showAddDepartment}
                    showErrorCode={showErrorDepartment}
                    onHide={() => setShowAddDepartment(false)}
                    title={t("Add New Department Code")}
                    onPositiveAction={() => { handleAddDepartmentToList(); }}
                    onNegativeAction={() => {
                        setShowAddDepartment(false);
                    }}
                    pageSize={10}
                    getRowNodeId={(data) => data?.uuid}
                    value={department}
                    setValue={setDepartment}
                />
            </AccordionDetails>
        </Accordion>
    );
};

export default CostDepartmentCode;
