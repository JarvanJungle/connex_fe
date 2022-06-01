import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row,
    Label,
    Button, MultiSelect, FormGroup
} from "components";
import { Field, ErrorMessage } from "formik";

const MatrixSearchForm = (props) => {
    const { t } = useTranslation();
    const {
        userList,
        modules,
        errors,
        values,
        touched,
        dirty,
        setFieldValue,
        onSubmit
    } = props;
    const [selectedUser, setSelectedUser] = useState(null);

    const handleUserSelect = (userUuid) => {
        const selected = userList.find((user) => user.uuid === userUuid);
        if (selected) {
            setSelectedUser(selected);
        }
    };

    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">{t("SearchForFeatures")}</CardHeader>
                <CardBody className="p-4">
                    <Row className="d-flex mx-0">
                        <Col md={3} xs={6}>
                            <Field name="userUuid">
                                {({ field }) => (
                                    <select
                                        {...field}
                                        className={`form-control${(errors.userUuid && touched.userUuid) ? " is-invalid" : ""}`}
                                        onChange={(e) => {
                                            const userUuid = e.target.value;
                                            setFieldValue("userUuid", userUuid);
                                            handleUserSelect(userUuid);
                                        }}
                                    >
                                        <option value="">{t("SelectUser")}</option>
                                        {userList
                                            .map((user, index) => (
                                                <option key={index} value={user.uuid}>
                                                    {user.name}
                                                </option>
                                            ))}
                                    </select>
                                )}
                            </Field>
                            <ErrorMessage name="userUuid" component="div" className="invalid-feedback" />
                        </Col>
                        <Col md={3} xs={6}>
                            <FormGroup>
                                <MultiSelect
                                    name="moduleCode"
                                    className="form-control"
                                    options={modules.map((module) => ({
                                        name: module.moduleName,
                                        value: module.moduleCode
                                    }))}
                                    objectName="Module"
                                    setFieldValue={setFieldValue}
                                    defaultValue={[]}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={3} xs={6} className="text-center">
                            <Button
                                className="mb-2"
                                color="primary"
                                type="submit"
                                onClick={
                                    () => {
                                        if (!dirty || (dirty && Object.keys(errors).length)) {
                                            return;
                                        }
                                        onSubmit(values);
                                    }
                                }
                            >
                                {t("Search")}
                            </Button>
                        </Col>
                    </Row>
                    {
                        selectedUser && (
                            <div style={{ marginTop: "15px" }}>
                                <Row className="d-flex mx-0">
                                    <Col md={3} xs={6}>
                                        <Label>{t("UserName")}</Label>
                                    </Col>
                                    <Col md={6} xs={6}>
                                        {selectedUser.name}
                                    </Col>
                                </Row>
                                <Row className="d-flex mx-0">
                                    <Col md={3} xs={6}>
                                        <Label>{t("Email")}</Label>
                                    </Col>
                                    <Col md={6} xs={6}>
                                        {selectedUser.email}
                                    </Col>
                                </Row>
                                <Row className="d-flex mx-0">
                                    <Col md={3} xs={6}>
                                        <Label>{t("Designation")}</Label>
                                    </Col>
                                    <Col md={6} xs={6}>
                                        {selectedUser.designation}
                                    </Col>
                                </Row>
                            </div>
                        )
                    }
                </CardBody>
            </Card>
        </>
    );
};

export default MatrixSearchForm;
