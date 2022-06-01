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
        handleChange,
        setFieldValue,
        onChangeNature,
        onChangeProject,
        onChangeRequisitionType
    } = props;
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("Requisition")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="requisitionType"
                            label={t("TypeOfRequisition")}
                            type="text"
                            value={values.requisitionType}
                            className="label-required"
                            disabled
                        />
                        {/* <SelectInput
                            name="requisitionType"
                            label={t("TypeOfRequisition")}
                            className="label-required"
                            placeholder={t("PleaseSelectTypeOfRequisition")}
                            errors={errors.requisitionType}
                            touched={touched.requisitionType}
                            options={typeOfRequisitions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => onChangeRequisitionType(e, setFieldValue)}
                            value={values.requisitionType}
                            disable
                        /> */}
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
                            onChange={(e) => onChangeNature(e, setFieldValue)}
                            value={values.project}
                            disabled
                        />
                    </Col>
                </Row>
                {
                    (values.project === true || values.project === "true")
                    && (
                        <>
                            <Row>
                                <Col xs={12}>
                                    <SelectInput
                                        name="projectCode"
                                        label={t("SelectProject")}
                                        className="label-required"
                                        placeholder={t("PleaseSelectProject")}
                                        errors={errors.projectCode}
                                        touched={touched.projectCode}
                                        options={projects}
                                        optionLabel="projectTitle"
                                        optionValue="projectCode"
                                        disable={!values.project || values.project === "false"}
                                        onChange={(e) => onChangeProject(e)}
                                        value={values.projectCode}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="tradeTitle"
                                        label={t("ProjectTrade")}
                                        type="text"
                                        errors={errors.tradeTitle}
                                        touched={touched.tradeTitle}
                                        options={projects}
                                        onChange={handleChange}
                                        value={values.tradeTitle}
                                        disabled
                                    />
                                </Col>
                            </Row>
                        </>

                    )
                }

            </CardBody>
        </Card>
    );
};

export default RaiseRequisitionComponent;
