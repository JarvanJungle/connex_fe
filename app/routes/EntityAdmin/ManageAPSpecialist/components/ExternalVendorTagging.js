import React from "react";
import { useTranslation } from "react-i18next";
import { AgGridTable } from "routes/components";
import {
    Button, Card, CardBody, CardHeader, Row
} from "components";
import IconButton from "@material-ui/core/IconButton";
import { getExternalVendorTaggingColDefs } from "../ColumnDefs";

const ExternalVendorTagging = (props) => {
    const {
        gridHeight,
        addVendor,
        disabled,
        values,
        onDeleteItem,
        header = "ExternalVendorTagging"
    } = props;
    const { t } = useTranslation();

    const ActionDelete = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        return (
            <IconButton
                size="small"
                onClick={() => onDeleteItem(data.uuid, rowData, params)}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        );
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t(header)}
            </CardHeader>
            <CardBody>
                {
                    !disabled && (
                        <Row className="mx-0 justify-content-end mb-3">
                            <Button
                                color="primary"
                                onClick={() => addVendor()}
                                style={{
                                    height: 36
                                }}
                            >
                                <i className="fa fa-plus mr-2" />
                                <span>{t("AddVendor")}</span>
                            </Button>
                        </Row>
                    )
                }
                <AgGridTable
                    className="ag-theme-custom-react"
                    columnDefs={getExternalVendorTaggingColDefs(disabled)}
                    rowData={values.vendorUuid}
                    gridHeight={values.vendorUuid.length === 0 ? 145 : gridHeight}
                    stopEditingWhenCellsLoseFocus
                    singleClickEdit
                    pagination={false}
                    frameworkComponents={{
                        actionDelete: ActionDelete
                    }}
                    sizeColumnsToFit
                />
            </CardBody>
        </Card>
    );
};

export default ExternalVendorTagging;
