import React from "react";
import { useTranslation } from "react-i18next";
import { Field, ErrorMessage } from "formik";
import {
    Card, CardBody, CardHeader, Col, Row, FormGroup, MultiSelect, Input
} from "components";
import { Label } from "reactstrap";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";

const GroupForm = (props) => {
    const { t } = useTranslation();
    const {
        headerName,
        isEdit,
        userList,
        errors,
        values,
        touched,
        setFieldValue
    } = props;

    const setNumberApprover = () => {
        if (values.numberApprovers
            === values.groupUserList.length) {
            setFieldValue("numberApprovers", 1);
        } else {
            setFieldValue("numberApprovers", values.groupUserList.length);
        }
    };

    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">
                    {headerName}
                </CardHeader>
                <CardBody className="p-4">
                    <Row className="d-flex mx-0">
                        <Col xs={12} md={6}>
                            <FormGroup>
                                <Label>
                                    {t("ApprovalGroupName")}
                                    <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    className="form-control"
                                    type="text"
                                    name="groupName"
                                    tag={Field}
                                    maxLength={50}
                                    invalid={_.has(errors, "groupName") && touched.groupName}
                                    disabled={!isEdit}
                                />
                                <ErrorMessage name="groupName" component="div" className="invalid-feedback" />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="d-flex mx-0">
                        <Col xs={12} md={6}>
                            <FormGroup>
                                <Label>
                                    {t("Approver")}
                                    <span className="text-danger">*</span>
                                </Label>
                                <MultiSelect
                                    disabled={!isEdit}
                                    name="groupUserList"
                                    className="form-control"
                                    options={userList.map((user) => ({
                                        name: user.name,
                                        value: user.uuid
                                    }))}
                                    objectName="Approver"
                                    setFieldValue={setFieldValue}
                                    defaultValue={values.groupUserList}
                                    invalid={_.has(errors, "groupUserList") && touched.groupUserList}
                                />
                                <ErrorMessage name="groupUserList" component="div" className="invalid-feedback" />
                            </FormGroup>
                        </Col>
                    </Row>
                    {/* <Row className="d-flex mx-0">
                        <Col xs={12} md={6}>
                            <FormGroup>
                                <Label>
                                    {t("Min No. of Approvers")}
                                    <span className="text-danger">*</span>
                                </Label>
                                <Row>
                                    <Col md={6}>
                                        <Input
                                            className="form-control"
                                            type="number"
                                            name="numberApprovers"
                                            tag={Field}
                                            maxLength={50}
                                            invalid={_.has(errors, "numberApprovers") && touched.numberApprovers}
                                            disabled={!isEdit}
                                        />
                                        <ErrorMessage name="numberApprovers" component="div" className="invalid-feedback" />
                                    </Col>
                                    <Col md={6} className="d-flex align-items-center">
                                        <Checkbox
                                            id="approve"
                                            checked={values.numberApprovers
                                                === values.groupUserList.length}
                                            onChange={() => setNumberApprover()}
                                            disabled={!isEdit}
                                        />
                                        <label htmlFor="active" className="ml-2 mb-0">
                                            {t("All must approve")}
                                        </label>
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Col>
                    </Row> */}
                    <Row className="d-flex mx-0">
                        <Col xs={12} md={6}>
                            <FormGroup>
                                <Label>{t("Remarks")}</Label>
                                <InputTextarea
                                    maxLength={500}
                                    className="form-control"
                                    name="groupDescription"
                                    value={values.groupDescription}
                                    onChange={(e) => setFieldValue("groupDescription", e.target.value)}
                                    invalid={errors.groupDescription}
                                    disabled={!isEdit}
                                />
                                <ErrorMessage name="groupDescription" component="div" className="invalid-feedback" />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="d-flex mx-0">
                        <Col xs={12} md={6} className="p-field-checkbox">
                            <Checkbox
                                id="active"
                                checked={values.active}
                                onChange={() => setFieldValue("active", !values.active)}
                                disabled={!isEdit}
                            />
                            <label htmlFor="active" className="ml-2 mb-0">
                                {t("Is Active")}
                            </label>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

// GroupForm.propTypes = {
//     isCreate: PropTypes.bool.isRequired,
//     isEdit: PropTypes.bool.isRequired,
//     form: PropTypes.instanceOf(Object).isRequired,
//     updateForm: PropTypes.func.isRequired,
//     userList: PropTypes.instanceOf(Array).isRequired
// };

export default GroupForm;
