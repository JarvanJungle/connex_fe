import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { AgGridTable } from "../../../../../components";
import {
    paymentClaimColumnDefs
} from "../../Helper";

export default function PaymentClaimHistory(props) {
    const { t } = useTranslation();

    const {
        values,
        setFieldValue
    } = props;

   

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("Payment Claim History")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <AgGridTable
                            className="ag-theme-custom-react"
                            columnDefs={paymentClaimColumnDefs}
                            rowData={values.paymentClaimHistoryList || []}
                            gridHeight={300}
                            pagination
                            sizeColumnsToFit
                            paginationPageSize={10}
                            rowSelection="multiple"
                            rowMultiSelectWithClick
                            onComponentStateChanged={(params) => {
                                params.api.sizeColumnsToFit();
                            }}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}
