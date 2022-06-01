import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    SelectInput,
    HorizontalInput
} from "components";

const RaiseRequisitionComponent = (props) => {
    const {
        t, values, errors,
        touched,
        typeOfRequisitions,
        natureOfRequisitions,
        projects,
        setFieldValue,
        onChangeProject,
        onChangeTypeOfRequisition
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("RaiseRequisition")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        {
                            values.isEdit ? (
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
                                    onChange={(e) => onChangeTypeOfRequisition(e)}
                                    value={values.requisitionType}
                                    disabled={!values.isEdit}
                                    colLabel={5}
                                    colValue={7}
                                />
                            )
                                : (
                                    <HorizontalInput
                                        name="requisitionType"
                                        label={t("TypeOfRequisition")}
                                        type="text"
                                        value={values.requisitionType}
                                        disabled
                                        colLabel={5}
                                        colValue={7}
                                    />
                                )
                        }
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="project"
                            label={t("NatureOfRequisition")}
                            className="label-required"
                            placeholder={t("PleaseSelectNatureOfRequisition")}
                            errors={errors.natureOfRequisition}
                            touched={touched.natureOfRequisition}
                            options={natureOfRequisitions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => {
                                setFieldValue("projectCode", "");
                                setFieldValue("natureOfRequisition", e.target.value === "true");
                                if (e.target.value === "false") {
                                    setFieldValue("addingItemFromList", []);
                                }
                            }}
                            value={values.natureOfRequisition}
                            disabled={!values.isEdit}
                            colLabel={5}
                            colValue={7}
                        />
                    </Col>
                </Row>
                {
                    (values.natureOfRequisition === true || values.natureOfRequisition === "true")
                    && (
                        <Row>
                            <Col xs={12}>
                                {
                                    values.isEdit ? (
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
                                            disabled={!values.natureOfRequisition || values.natureOfRequisition === "false" || !values.isEdit}
                                            onChange={(e) => onChangeProject(e)}
                                            value={values.projectCode}
                                            colLabel={5}
                                            colValue={7}
                                        />
                                    )
                                        : (
                                            <HorizontalInput
                                                name="projectCode"
                                                label={t("SelectProject")}
                                                type="text"
                                                value={values.projectCode}
                                                disabled
                                                colLabel={5}
                                                colValue={7}
                                            />
                                        )
                                }
                            </Col>
                        </Row>
                    )
                }
            </CardBody>
        </Card>
    );
};

export default RaiseRequisitionComponent;
