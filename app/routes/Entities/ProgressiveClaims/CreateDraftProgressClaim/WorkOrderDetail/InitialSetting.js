import React from "react";
import { Field } from "formik";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "../../components";
import { PAGE_STAGE } from "../Helper";

export default function InitialSetting(props) {
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
                {t("Initial Setting")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwoNumber"
                            label={t("Developer Work Order No.")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="dwoStatus"
                            label={t("Status")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="currencyCode"
                            label={t("Currency")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="projectCode"
                            label={t("Project")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}
