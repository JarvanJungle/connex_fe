import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import UserDataService from "services/UserService";
import { useTranslation } from "react-i18next";
import ButtonSpinner from "components/ButtonSpinner";

import { HeaderMain } from "routes/components/HeaderMain";

import {
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    Button, CardHeader
} from "components";
import useToast from "routes/hooks/useToast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { StickyFooter } from "components/StickyFooter/StickyFooter";
import { Card, CardBody, InputGroup } from "reactstrap";

const ResetOwnPassword = () => {
    const toast = useToast();
    let message = "Opp! Something went wrong.";

    const showToast = (type) => toast(type, message);

    const history = useHistory();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false);

    const resetPassword = ({ oldPassword, newPassword }) => {
        setIsLoading(true);
        UserDataService.resetOwnPassword({ oldPassword, newPassword }).then((response) => {
            if (response.data.status === "OK") {
                message = "You have successfully changed the password";
                resetForm();
                showToast("success");
                setIsLoading(false);
            } else if (response.data.status === "BAD_REQUEST") {
                message = "Wrong Password";
                showToast("error");
                setIsLoading(false);
            } else {
                message = "Error";
                showToast("error");
                setIsLoading(false);
            }
        }).catch((error) => {
            message = error.response.data.message;
            resetForm();
            showToast("error");
            setIsLoading(false);
        });
    };

    const initialValues = {
        oldPassword: "",
        newPassword: "",
        repeatPassword: ""
    };

    const validationSchema = Yup.object().shape({
        oldPassword: Yup.string().required(t("Old password is required")),
        newPassword: Yup.string().required(t("New password is required")),
        repeatPassword: Yup.string().required(t("Repeat password is required")).oneOf([Yup.ref("newPassword")], "Repeat password incorrect")
    });

    const {
        values,
        handleChange,
        errors,
        touched,
        resetForm,
        handleSubmit,
        setFieldTouched,
        dirty,
        isValid
    } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: resetPassword,
        validateOnMount: true
    });

    return (
        <>
            <Container fluid>
                <HeaderMain
                    title={t("Reset Your Own Password")}
                    className="mb-5 mt-4"
                />
                <Row>
                    <Col lg={6}>
                        <Card>
                            <CardHeader>
                                {t("Reset Your Own Password")}
                            </CardHeader>
                            <CardBody>
                                <Form className="mb-3 d-block">
                                    <FormGroup className="label-required">
                                        <Label for="oldPassword">
                                            {t("Old Password")}
                                        </Label>
                                        <InputGroup>
                                            <Input
                                                type={oldPasswordVisible ? "text" : "password"}
                                                name="oldPassword"
                                                id="oldPassword"
                                                placeholder={t("Enter current password")}
                                                className="bg-white"
                                                value={values.oldPassword}
                                                onChange={handleChange}
                                                invalid={touched.oldPassword && !!errors.oldPassword}
                                                onBlur={() => setFieldTouched("oldPassword")}
                                            />
                                            <div className="input-group-append">
                                                <a className="input-group-text" onClick={() => setOldPasswordVisible(!oldPasswordVisible)}>
                                                    <i className={`fa ${oldPasswordVisible ? "fa-eye-slash" : "fa-eye"}`} />
                                                </a>
                                            </div>
                                        </InputGroup>

                                        {touched.oldPassword && errors.oldPassword && <div className="text-danger">{errors.oldPassword}</div>}
                                    </FormGroup>
                                    <FormGroup className="label-required">
                                        <Label for="newPassword">
                                            {t("New Password")}
                                        </Label>
                                        <InputGroup>
                                            <Input
                                                type={newPasswordVisible ? "text" : "password"}
                                                name="newPassword"
                                                id="newPassword"
                                                placeholder={t("Enter new password")}
                                                className="bg-white"
                                                value={values.newPassword}
                                                onChange={handleChange}
                                                invalid={touched.newPassword && !!errors.newPassword}
                                                onBlur={() => setFieldTouched("newPassword")}

                                            />
                                            <div className="input-group-append">
                                                <a className="input-group-text" onClick={() => setNewPasswordVisible(!newPasswordVisible)}>
                                                    <i className={`fa ${newPasswordVisible ? "fa-eye-slash" : "fa-eye"}`} />
                                                </a>
                                            </div>
                                        </InputGroup>
                                        {touched.newPassword && errors.newPassword && <div className="text-danger">{errors.newPassword}</div>}

                                    </FormGroup>
                                    <FormGroup className="label-required">
                                        <Label for="repeatPassword">
                                            {t("Repeat New Password")}
                                        </Label>
                                        <InputGroup>
                                            <Input
                                                type={repeatPasswordVisible ? "text" : "password"}
                                                name="repeatPassword"
                                                id="repeatPassword"
                                                placeholder={t("Repeat your new password")}
                                                className="bg-white"
                                                value={values.repeatPassword}
                                                onChange={handleChange}
                                                invalid={touched.repeatPassword && !!errors.repeatPassword}
                                                onBlur={() => setFieldTouched("repeatPassword")}
                                            />
                                            <div className="input-group-append">
                                                <a className="input-group-text" onClick={() => setRepeatPasswordVisible(!repeatPasswordVisible)}>
                                                    <i className={`fa ${repeatPasswordVisible ? "fa-eye-slash" : "fa-eye"}`} />
                                                </a>
                                            </div>
                                        </InputGroup>
                                        {touched.repeatPassword && errors.repeatPassword && <div className="text-danger">{errors.repeatPassword}</div>}
                                    </FormGroup>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                {/* Footer */}
                <StickyFooter>
                    <Row className="mx-0 px-3 justify-content-between">
                        <Button
                            type="button"
                            color="secondary"
                            className="mr-2"
                            onClick={() => history.push("/me/settings")}
                            style={{ borderWidth: 0 }}
                        >
                            {t("Back")}
                        </Button>

                        <div className="mx-0">
                            <ButtonSpinner
                                onclick={() => {
                                    if (!dirty || !isValid) {
                                        message = "Validation error, please check your input.";
                                        showToast("error");
                                    }
                                    handleSubmit();
                                }}
                                text={t("Reset Password")}
                                style={{ width: 180 }}
                                isLoading={isLoading}
                            />
                        </div>
                    </Row>
                </StickyFooter>
            </Container>
        </>
    );
};

export default ResetOwnPassword;
