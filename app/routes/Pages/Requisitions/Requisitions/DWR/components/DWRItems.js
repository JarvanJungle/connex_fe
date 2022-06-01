import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AgGridTable } from "routes/components";
import IconButton from "@material-ui/core/IconButton";
import {
    ButtonToolbar,
    Button
} from "components";

const DWRItems = (props) => {
    const { t } = useTranslation();
    const {
        itemData,
        onDeleteItem,
        onAddItemManual
    } = props;

    const [gridApi, setGridApi] = useState(null);

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
    };

    const EvaluatorCellRenderer = (params) => {

    }
    
    const ActionDeleteRenderer = (params) => {
        const { data, agGridReact } = params;
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

    const summaryColumnDefs = [
        {
            headerName: t("Work Code"),
            field: "workCode",
            editable: true
        },
        {
            headerName: t("Description"),
            field: "description",
            editable: true
        },
        {
            headerName: t("Weightage"),
            field: "weightAge",
            editable: true
        },
        {
            headerName: t("TotalAmount"),
            field: "totalAmount",
            editable: true
        },
        {
            headerName: t("RetentionPercentage"),
            field: "retentionPercentage",
            editable: true
        },
        {
            headerName: t("SelectEvaluator"),
            field: "evaluators",
            editable: true
        }
    ];

    const itemColumnDefs = [
        {
            headerName: t("Action"),
            field: "action",
            cellRenderer: "actionDelete",
        },
        {
            headerName: t("Group"),
            field: "groupNumber"
        },
        {
            headerName: t("WorkCode"),
            field: "workCode"
        },
        {
            headerName: t("UOM"),
            field: "uom"
        },
        {
            headerName: t("Retention"),
            field: "retention"
        },
        {
            headerName: t("Weightage"),
            field: "weightage"
        },
        {
            headerName: t("Quantity"),
            field: "quantity"
        },
        {
            headerName: t("UnitPrice"),
            field: "unitPrice"
        },
        {
            headerName: t("TotalAmount"),
            field: "totalAmount"
        },
        {
            headerName: t("Remarks"),
            field: "remarks"
        }
    ];

    return (
        <>
            <AgGridTable
                columnDefs={summaryColumnDefs}
                rowData={[]}
                pagination={false}
                singleClickEdit
                stopEditingWhenCellsLoseFocus
                gridHeight={250}
                onGridReady={onGridReady}
                frameworkComponents={{
                    actionDelete: ActionDeleteRenderer
                }}
            />
            <ButtonToolbar className="justify-content-end mt-2 mb-2">
                <Button
                    color="primary"
                    onClick={() => onAddItemManual()}
                    className="mr-1"
                >
                    <span className="mr-1">+</span>
                    <span>{t("AddManual")}</span>
                </Button>
            </ButtonToolbar>
            <AgGridTable
                columnDefs={itemColumnDefs}
                rowData={itemData}
                pagination={false}
                singleClickEdit
                stopEditingWhenCellsLoseFocus
                gridHeight={250}
                onGridReady={onGridReady}
                frameworkComponents={{
                    actionDelete: ActionDeleteRenderer
                }}
            />
        </>
    );
};

export default DWRItems;