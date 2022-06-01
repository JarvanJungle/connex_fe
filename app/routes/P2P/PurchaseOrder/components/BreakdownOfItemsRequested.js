import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AgGridTable, CustomTooltip } from "routes/components";
import { Row, Col } from "components";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import classNames from "classnames";
import { FEATURE } from "helper/constantsDefined";
import { formatDisplayDecimal } from "helper/utilities";
import { getItemConvertColDefs } from "../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const BreakdownOfItemsRequested = React.memo(({
    rowData, gridHeight = 300, isProject, convertFrom, totalInDocumentCurrency, values
}) => {
    const { t } = useTranslation();
    const columnDefs = useMemo(
        () => getItemConvertColDefs(isProject, convertFrom),
        [isProject, convertFrom]
    );

    return (
        <>
            <HeaderSecondary
                title={t("BreakdownOfItemsRequested")}
                className="mb-2"
            />
            <Row className={classNames(
                { "mb-2": convertFrom === FEATURE.PR },
                { "mb-4": convertFrom === FEATURE.PPR }
            )}
            >
                <Col xs={12} md={12} lg={12}>
                    <AgGridTable
                        columnDefs={columnDefs}
                        colDef={defaultColDef}
                        rowData={rowData}
                        gridHeight={gridHeight}
                        pagination={false}
                        singleClickEdit
                        stopEditingWhenCellsLoseFocus
                        autoSizeColumn={false}
                        frameworkComponents={{
                            customTooltip: CustomTooltip
                        }}
                    />
                </Col>
            </Row>
            {convertFrom === FEATURE.PR && (
                <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                    <div style={{ textDecoration: "underline" }}>
                        {t("InDocumentCurrency")}
                    </div>
                    <Row className="justify-content-end" style={{ width: "380px", textAlign: "right" }}>
                        <Col xs={6}>
                            <div>{`${t("SubTotal")}:`}</div>
                            <div>{`${t("Tax")}:`}</div>
                            <div>{`${t("Total(include GST)")}:`}</div>
                        </Col>
                        <Col xs={3}>
                            <div>{values?.currency}</div>
                            <div>{values?.currency}</div>
                            <div>{values?.currency}</div>
                        </Col>
                        <Col xs={3}>
                            <div>{formatDisplayDecimal(totalInDocumentCurrency.subTotal ?? 0, 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(totalInDocumentCurrency.tax ?? 0, 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(totalInDocumentCurrency.total ?? 0, 2) || "0.00"}</div>
                        </Col>
                    </Row>
                </Row>
            )}
        </>
    );
});

export default BreakdownOfItemsRequested;
