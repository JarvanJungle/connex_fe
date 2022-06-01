import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label,
    FormGroup, MultiSelect
} from "components";
import { HorizontalInput } from "components";
import _ from "lodash";
import { ErrorMessage } from "formik";

const APSpecialistGrouping = (props) => {
    const {
        t,
        disabled,
        setFieldValue,
        values,
        touched,
        errors,
        users,
        isDetails
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("APSpecialistGrouping")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="groupCode"
                            label={t("GroupCode")}
                            type="text"
                            value={values.groupCode}
                            placeholder={t("PleaseEnterGroupCode")}
                            errors={errors.groupCode}
                            touched={touched.groupCode}
                            disabled={disabled || isDetails}
                            className="label-required"
                            maxLength={50}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={4} md={4} className="label-required">
                        <Label>{t("APSpecialistGroup")}</Label>
                    </Col>
                    <Col xs={8} md={8}>
                        <FormGroup>
                            <MultiSelect
                                disabled={disabled}
                                name="apSpecialistUsers"
                                className="form-control"
                                options={users.map((user) => ({
                                    name: user.userName,
                                    value: user.userUuid
                                }))}
                                objectName="User"
                                setFieldValue={setFieldValue}
                                defaultValue={values.apSpecialistUsers}
                                invalid={_.has(errors, "apSpecialistUsers") && touched.apSpecialistUsers}
                            />
                            <ErrorMessage name="apSpecialistUsers" component="div" className="invalid-feedback" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="remarks"
                            label={t("Remarks")}
                            type="textarea"
                            placeholder={t("PleaseEnterRemarks")}
                            errors={errors.remarks}
                            touched={touched.remarks}
                            value={values.remarks}
                            disabled={disabled}
                            maxLength={500}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default APSpecialistGrouping;
