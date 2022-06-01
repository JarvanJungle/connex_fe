import React, {
    useEffect, useState, forwardRef, useImperativeHandle
} from "react";
import { Row, Col } from "components";
import { useTranslation } from "react-i18next";
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

const ModulesTable = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const {
        values, onChangeAction, disabled, modules
    } = props;
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        if (values.listModules && values.listModules.length > 0) {
            const listFeature = [];
            values.listModules.forEach((module) => {
                const { moduleCode } = module;
                listFeature.push(...module.features.map((item) => ({
                    ...item,
                    moduleCode,
                    disabled
                })));
            });
            setFeatures(listFeature);
        }
    }, [values.listModules, disabled]);

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
        const { actions } = data;
        return (
            <>
                {
                    !data.disabled
                    && (
                        <Checkbox
                            name="read"
                            checked={actions.read}
                            onChange={(e) => onChangeAction("read", e, data)}
                        />
                    )
                }
                {
                    data.disabled
                    && (
                        <Checkbox
                            name="read"
                            checked={actions.read}
                            onChange={(e) => onChangeAction("read", e, data)}
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
        const { actions } = data;
        return (
            <>
                {
                    !data.disabled
                    && (
                        <Checkbox
                            name="write"
                            checked={actions.write}
                            onChange={(e) => onChangeAction("write", e, data)}
                        />
                    )
                }
                {
                    data.disabled
                    && (
                        <Checkbox
                            name="write"
                            checked={actions.write}
                            onChange={(e) => onChangeAction("write", e, data)}
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
        const { actions } = data;
        return (
            <>
                {
                    !data.disabled
                        ? (
                            <Checkbox
                                name="approve"
                                checked={actions.approve}
                                onChange={(e) => onChangeAction("approve", e, data)}
                            />
                        ) : (
                            <Checkbox
                                name="approve"
                                checked={actions.approve}
                                onChange={(e) => onChangeAction("approve", e, data)}
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
            valueGetter: ({ data }) => modules?.find(
                (m) => m.moduleCode === data.moduleCode
            )?.moduleName?.toUpperCase(),
            hide: true,
            rowGroup: true
        },
        {
            headerName: t("FeatureName"),
            field: "feature.featureName",
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
        <Row className="mb-3">
            <Col lg={12}>
                <AgGridTable
                    className={classes["custom-group-color"]}
                    columnDefs={columnDefs}
                    rowData={features}
                    gridHeight={features.length > 1 ? 500 : 190}
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
                        suppressScrollOnNewData: true
                    }}
                />
            </Col>
        </Row>
    );
};

export default ModulesTable;
