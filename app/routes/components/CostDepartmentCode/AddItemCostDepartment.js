import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
    Row,
    Col,
    Input,
    Label
} from "components";
import i18next from "i18next";
import { AvField } from "availity-reactstrap-validation";
import classNames from "classnames";
import { CommonConfirmDialog } from "../CommonConfirmDialog";

const AddItemvalueDepartment = (props) => {
    const {
        isShow,
        onHide,
        title,
        onPositiveAction,
        contentPositive,
        colorPositive,
        onNegativeAction,
        value,
        setValue,
        showErrorCode
    } = props;

    return (
        <CommonConfirmDialog
            isShow={isShow}
            onHide={onHide}
            title={title}
            positiveProps={
                {
                    onPositiveAction,
                    contentPositive,
                    colorPositive
                }
            }
            negativeProps={
                {
                    onNegativeAction
                }
            }
            size="md"
            centered
        // titleCenter
        >
            <Row>
                <Col>
                    <Row className="mb-3">
                        <Col xs={3} className="label-required">
                            <Label>{i18next.t("Code")}</Label>
                        </Col>
                        <Col xs={9}>
                            <Input
                                type="text"
                                name="code"
                                className={
                                    classNames("form-control", {
                                        "is-invalid": showErrorCode && !value.code
                                    })
                                }
                                placeholder={i18next.t("Enter Code")}
                                value={value.code}
                                onChange={(e) => {
                                    setValue((prevStates) => ({
                                        ...prevStates,
                                        code: e.target.value
                                    }));
                                }}
                            />
                            {
                                showErrorCode
                                && !value.code
                                && (<div className="invalid-feedback">{i18next.t("Please enter valid Code")}</div>)
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={3}>
                            <Label>{i18next.t("Remarks")}</Label>
                        </Col>
                        <Col xs={9}>
                            <AvField
                                type="text"
                                name="remarks"
                                placeholder={i18next.t("Enter Remarks")}
                                value={value.remarks}
                                onChange={(e) => {
                                    setValue((prevStates) => ({
                                        ...prevStates,
                                        remarks: e.target.value
                                    }));
                                }}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </CommonConfirmDialog>
    );
};

AddItemvalueDepartment.propTypes = {
    isShow: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    onPositiveAction: PropTypes.func.isRequired,
    contentPositive: PropTypes.string,
    colorPositive: PropTypes.string,
    onNegativeAction: PropTypes.func.isRequired
};
AddItemvalueDepartment.defaultProps = {
    contentPositive: `${i18next.t("Add")}`,
    colorPositive: "primary"
};

export default AddItemvalueDepartment;
