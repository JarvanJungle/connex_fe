import React from "react";
import { AgGridTable } from "routes/components";
import { Button } from "components";
import { useTranslation } from "react-i18next";
import { ConvertPR2PPOColDefs } from "../../ColumnDefs";

const ConvertPR2POTable = (props) => {
    const {
        gridHeight,
        suppliers,
        convertPR2PPO,
        navigateToPPODetails
    } = props;
    const { t } = useTranslation();

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
                                        onClick={() => convertPR2PPO(params, data, rowData)}
                                    >
                                        {t("ConvertToPrePO")}
                                    </Button>
                                )}
                                {!data?.allowConvert && (<></>)}
                            </>
                        ) : (
                            <Button
                                style={{ color: "#000", borderColor: "#000" }}
                                className="btn btn-outline-secondary"
                                onClick={() => navigateToPPODetails(data)}
                            >
                                {t("View")}
                            </Button>
                        )
                }
            </>
        );
    };

    return (
        <>
            {
                suppliers.length > 0
                && (
                    <AgGridTable
                        columnDefs={ConvertPR2PPOColDefs}
                        rowData={suppliers}
                        gridHeight={gridHeight || 300}
                        frameworkComponents={{
                            actionConvert: ActionConvert
                        }}
                        pagination={false}
                        sizeColumnsToFit
                    />
                )
            }
        </>
    );
};

export default ConvertPR2POTable;
