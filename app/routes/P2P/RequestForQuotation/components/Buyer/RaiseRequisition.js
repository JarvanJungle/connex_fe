import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { SelectInput, HorizontalInput } from "components";

const RaiseRequisition = (props) => {
    const {
        t, values, errors,
        touched,
        typeOfRequisitions,
        natureOfRequisitions,
        projects,
        onChangeProject,
        handleChange,
        disabled,
        loading
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6" loading={loading}>
                {t("RaiseRequisition")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="requisitionType"
                            label={t("TypeOfRequisition")}
                            className="label-required"
                            placeholder={t("PleaseSelectTypeOfRequisition")}
                            errors={errors.requisitionType}
                            touched={touched.requisitionType}
                            options={typeOfRequisitions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.requisitionType}
                            disabled={disabled}
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="project"
                            label={t("NatureOfRequisition")}
                            className="label-required"
                            placeholder={t("PleaseSelectNatureOfRequisition")}
                            errors={errors.project}
                            touched={touched.project}
                            options={natureOfRequisitions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.project}
                            disabled={disabled}
                            loading={loading}
                        />
                    </Col>
                </Row>
                {String(values.project) === "true" && (
                    <Row>
                        <Col xs={12}>
                            {!disabled && (
                                <SelectInput
                                    name="projectCode"
                                    label={t("SelectProject")}
                                    className="label-required"
                                    placeholder={t("PleaseSelectProject")}
                                    errors={errors.projectCode}
                                    touched={touched.projectCode}
                                    options={projects}
                                    optionLabel="projectCode"
                                    optionValue="projectCode"
                                    disabled={String(values.project) === "false" || disabled}
                                    onChange={(e) => onChangeProject(e)}
                                    value={values.projectCode}
                                    loading={loading}
                                />
                            )}
                            {disabled && (
                                <HorizontalInput
                                    name="projectCode"
                                    className="label-required"
                                    label={t("SelectProject")}
                                    type="text"
                                    placeholder=""
                                    errors={errors.projectCode}
                                    touched={touched.projectCode}
                                    disabled
                                    value={values.projectCode}
                                    loading={loading}
                                />
                            )}
                        </Col>
                    </Row>
                )}
            </CardBody>
        </Card>
    );
};

export default RaiseRequisition;
