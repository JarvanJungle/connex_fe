import React from "react";
import { Field } from "formik";
import { useTranslation } from "react-i18next";
import { HorizontalInput } from "../../components";
import { Row, Card, CardBody, CardHeader, Col } from "components";
import { PAGE_STAGE } from "../Helper";

export default function VendorInformation(props) {
    const { t } = useTranslation();

    const {
        pageState,
        values, errors,
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
                {t("Vendor Information")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="vendorCode"
                            label={t("Vendor Code")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="vendorName"
                            label={t("Vendor Name")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="contactName"
                            label={t("Contact Name")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="contactEmail"
                            label={t("Contact Email")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="contactNumber"
                            label={t("Contact Number")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="countryCode"
                            label={t("Country")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="companyRegistrationNo"
                            label={t("Company Reg. No.")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}
