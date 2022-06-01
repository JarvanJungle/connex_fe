import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import { Button } from "components";
import { useTranslation } from "react-i18next";
import { ConvertToPOColDefs } from "../../ColumnDefs";

const ConvertToPOTable = (props) => {
    const {
        gridHeight,
        suppliers,
        onConvertPressHandler,
        navigateToPODetails,
        convertFrom
    } = props;
    const { t } = useTranslation();
    const [gridApi, setGridApi] = useState(null);

    useEffect(() => {
        gridApi?.redrawRows();
    }, [convertFrom]);

    const ActionConvert = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        return (
            <>
                {
                    !data.isConvert
                        ? (
                            <>
                                {data?.allowConvert && (
                                    <Button
                                        style={{ color: "#000", borderColor: "#000" }}
                                        className="btn btn-outline-secondary"
                                        onClick={() => onConvertPressHandler(params, data, rowData)}
                                    >
                                        {t("ConvertToPO")}
                                    </Button>
                                )}
                                {!data?.allowConvert && (<></>)}
                            </>
                        ) : (
                            <Button
                                style={{ color: "#000", borderColor: "#000" }}
                                className="btn btn-outline-secondary"
                                onClick={() => navigateToPODetails(data)}
                            >
                                {t("View")}
                            </Button>
                        )
                }
            </>
        );
    };

    return (
        <AgGridTable
            columnDefs={ConvertToPOColDefs}
            rowData={suppliers}
            gridHeight={gridHeight || 300}
            frameworkComponents={{
                actionConvert: ActionConvert
            }}
            pagination={false}
            sizeColumnsToFit
            onGridReady={(params) => setGridApi(params.api)}
            context={{
                convertFrom
            }}
        />
    );
};

export default ConvertToPOTable;
