import React from "react";
import { Field } from "formik";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Table,
    Button
} from "components";
import { makeStyles } from "@material-ui/core/styles";
import { HorizontalInput } from "../../components";
import { AgGridTable } from "../../../../components";
import {
    CreateDraftProgressClaimColumnDefs,
    defaultColDef
} from "../Helper";
import getAttachmentColDefs from "../../../../components/Conversation/AttachmentColDefs";

export default function PaymentClaimHistory(props) {
    const { t } = useTranslation();

    const {
        values,
        errors,
        touched,
        typeOfRequisitions,
        natureOfRequisitions,
        projects,
        handleChange,
        setFieldValue,
        onChangeNature,
        onChangeProject
    } = props;

    const columnDefs = [
        {
            headerName: t("S/N"),
            valueGetter: "node.rowIndex + 1"
        },
        {
            headerName: t("Draft Progress Claim No."),
            field: "dpcNumber"
        },
        {
            headerName: t("Developer Progress Claim No."),
            field: "dvpcNumber"
        },
        {
            headerName: t("Payment Claim Reference No."),
            field: "paymentClaimReferenceNo"
        },
        {
            headerName: t("Payment Claim Reference Month"),
            field: "paymentClaimReferenceMonth"
        }
    ];

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
                            columnDefs={columnDefs}
                            rowData={values.paymentClaimHistory}
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
