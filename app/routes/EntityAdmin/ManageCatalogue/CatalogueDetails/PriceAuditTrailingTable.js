import React from "react";
import { useTranslation } from "react-i18next";
import { AgGridReact } from "components/agGrid";
import { Card, CardHeader } from "components";

const PriceAuditTrailingTable = (props) => {
    const { t } = useTranslation();
    const { columnDefs, defaultColDef, rowData = [] } = props;

    return (
        <>
            <Card>
                <CardHeader tag="h6">
                    {t("CataloguePAT")}
                </CardHeader>
            </Card>
            <AgGridReact
                className="ag-theme-custom-react"
                style={{ height: "500px" }}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                pagination
                paginationPageSize={10}
                suppressRowClickSelection
            />
        </>
    );
};

export default PriceAuditTrailingTable;
