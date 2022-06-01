import React, {
    useState, useEffect, forwardRef, useImperativeHandle
} from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { AgGridTable } from "routes/components";
import { Checkbox } from "primereact/checkbox";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
    "custom-group-color": {
        "& .ag-row.ag-row-level-0": {
            backgroundColor: "#D2D8DE"
        },
        "& .ag-row.ag-row-level-1": {
            backgroundColor: "#e6e5e5b3"
        }
    }
});

const autoGroupColumnDef = {
    headerName: "Module",
    width: 250
};

export default function AssignDefaultFeatures(props) {
    const classes = useStyles();
    const {
        t,
        listModules,
        disabled,
        setRolesGridApi
    } = props;

    const [features, setFeatures] = useState([]);

    useEffect(() => {
        if (listModules && listModules.length > 0) {
            const newListFeature = listModules.map((item) => ({
                ...item,
                disabled
            }));
            setFeatures(newListFeature);
        }
    }, [disabled, listModules]);

    const ActionRead = forwardRef((params, ref) => {
        useImperativeHandle(ref, () => ({
            getReactContainerStyle() {
                return {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center"
                };
            }
        }));
        const { data } = params;
        if (!data) {
            return (<></>);
        }

        const checkedHandler = (event) => {
            const { checked } = event.target;
            const { column, node } = params;
            const { colId } = column;
            node.setDataValue(colId, checked);
        };

        return (
            <>
                {
                    !data.disabled
                    && (
                        <Checkbox
                            name="read"
                            checked={data?.read}
                            onChange={checkedHandler}
                        />
                    )
                }
                {
                    data.disabled
                    && (
                        <Checkbox
                            name="read"
                            checked={data?.read}
                            disabled
                        />
                    )
                }
            </>
        );
    });

    const ActionWrite = forwardRef((params, ref) => {
        useImperativeHandle(ref, () => ({
            getReactContainerStyle() {
                return {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center"
                };
            }
        }));
        const { data } = params;
        if (!data) {
            return (<></>);
        }

        const checkedHandler = (event) => {
            const { checked } = event.target;
            const { column, node } = params;
            const { colId } = column;
            node.setDataValue(colId, checked);
        };

        return (
            <>
                {
                    !data.disabled
                    && (
                        <Checkbox
                            name="write"
                            checked={data?.write}
                            onChange={checkedHandler}
                        />
                    )
                }
                {
                    data.disabled
                    && (
                        <Checkbox
                            name="write"
                            checked={data?.write}
                            disabled
                        />
                    )
                }
            </>
        );
    });

    const ActionApprove = forwardRef((params, ref) => {
        useImperativeHandle(ref, () => ({
            getReactContainerStyle() {
                return {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center"
                };
            }
        }));
        const { data } = params;
        if (!data) {
            return (<></>);
        }

        const checkedHandler = (event) => {
            const { checked } = event.target;
            const { column, node } = params;
            const { colId } = column;
            node.setDataValue(colId, checked);
        };

        return (
            <>
                {
                    !data.disabled
                        ? (
                            <Checkbox
                                name="approve"
                                checked={data?.approve}
                                onChange={checkedHandler}
                            />
                        ) : (
                            <Checkbox
                                name="approve"
                                checked={data?.approve}
                                disabled
                            />
                        )
                }
            </>
        );
    });

    const columnDefs = [
        {
            headerName: t("Module"),
            field: "moduleCode",
            valueGetter: ({ data }) => data?.moduleCode?.toUpperCase()?.replaceAll("_", " ") ?? "",
            hide: true,
            rowGroup: true
        },
        {
            headerName: t("FeatureName"),
            field: "featureName",
            filterParams: { newRowsAction: "keep" }
        },
        {
            headerName: t("Read"),
            field: "read",
            cellRenderer: "actionRead",
            filter: false
        },
        {
            headerName: t("Write"),
            field: "write",
            cellRenderer: "actionWrite",
            filter: false
        },
        {
            headerName: t("Approve"),
            field: "approve",
            cellRenderer: "actionApprove",
            filter: false
        }
    ];

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("AssignDefaultFeatures")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <Row className="mb-3">
                            <Col lg={12}>
                                <AgGridTable
                                    className={classes["custom-group-color"]}
                                    columnDefs={columnDefs}
                                    rowData={features}
                                    gridHeight={features?.length > 1 ? 500 : 190}
                                    sizeColumnsToFit
                                    frameworkComponents={{
                                        actionRead: ActionRead,
                                        actionWrite: ActionWrite,
                                        actionApprove: ActionApprove
                                    }}
                                    animateRows
                                    groupDisplayType="groupRows"
                                    autoGroupColumnDef={autoGroupColumnDef}
                                    isGroupOpenByDefault={() => true}
                                    pagination={false}
                                    gridOptions={{
                                        suppressScrollOnNewData: true,
                                        getRowNodeId: (data) => data?.uuid
                                    }}
                                    onGridReady={(params) => setRolesGridApi(params.api)}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={6} />
                </Row>
            </CardBody>
        </Card>
    );
}
