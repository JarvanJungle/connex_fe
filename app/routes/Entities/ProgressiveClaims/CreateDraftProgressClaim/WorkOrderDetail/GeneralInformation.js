import React from "react";
import { Field } from "formik";
import { useTranslation } from "react-i18next";
import {
    Row, Card, CardBody, CardHeader, Col
} from "components";
import { HorizontalInput } from "../../components";
import { PAGE_STAGE } from "../Helper";

export default function GeneralInformation(props) {
    const { t } = useTranslation();

    const {
        pageState,
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

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("General Information")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contractType"
                            label={t("Contract Type")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="workOrderTitle"
                            label={t("Work Order Title")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="dwoDate"
                            label={t("Work Order Date")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="dateOfConfirmation"
                            label={t("Date of Confirmation")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="remarks"
                            label={t("Remarks")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}
