import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { isNullOrUndefined } from "helper/utilities";
import Modal from "react-bootstrap/Modal";
import { Button } from "components";
import classes from "./CommonConfirmDialog.scss";
import classNames from "classnames";

const CommonConfirmDialog = (props) => {

    const { t } = useTranslation();
    const {
        title,
        content,
        isShow,
        onHide,
        negativeProps,
        positiveProps,
        size,
        centered,
        children,
        footerBetween,
        titleRequired,
        titleCenter,
        negativeAsLink,
        footerEnd,
        reverse,
        titleColor
    } = props;

    /* Action Function */
    const onNegativeAction = !isNullOrUndefined(negativeProps.onNegativeAction) ? negativeProps.onNegativeAction : undefined;
    const onPositiveAction = !isNullOrUndefined(positiveProps.onPositiveAction) ? positiveProps.onPositiveAction : undefined;

    /* Variant */
    const variantNegative = !isNullOrUndefined(negativeProps.variantNegative) ? negativeProps.variantNegative : "secondary";
    const variantPositive = !isNullOrUndefined(positiveProps.variantPositive) ? positiveProps.variantPositive : "primary";

    /* Button Content */
    const contentNegative = !isNullOrUndefined(negativeProps.contentNegative) ? negativeProps.contentNegative : "Cancel";
    const contentPositive = !isNullOrUndefined(positiveProps.contentPositive) ? positiveProps.contentPositive : "Activate"

    /* Color */
    const colorPositive = !isNullOrUndefined(positiveProps.colorPositive) ? positiveProps.colorPositive : "primary";
    const colorNegative = !isNullOrUndefined(negativeProps.colorNegative) ? negativeProps.colorNegative : "danger";

    return (
        <Modal show={isShow} onHide={onHide} className={`doxa-modal-outline--${colorPositive}`} size={size} centered={centered}>
            <Modal.Header closeButton className={classNames({ "title-required": titleRequired })}>
                <Modal.Title className={`text-${titleColor ? titleColor : colorPositive} ${titleCenter && 'text-center w-100'}`}>
                    {t(title)}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {t(content)}
                {children}
            </Modal.Body>

            <Modal.Footer className={
                classNames(
                    {
                        "d-flex justify-content-between" : footerBetween,
                        "d-flex justify-content-end" : footerEnd
                    }
                )
            }>
                {
                    !reverse ? <>
                        <Button
                            variant={variantNegative}
                            onClick={onNegativeAction}
                            color={colorNegative}
                        >
                            {t(contentNegative)}
                        </Button>
                        <Button
                            variant={variantPositive}
                            onClick={onPositiveAction}
                            color={colorPositive}
                        >
                            {t(contentPositive)}
                        </Button>
                    </> : <>
                        <Button
                            variant={variantPositive}
                            onClick={onPositiveAction}
                            color={colorPositive}
                        >
                            {t(contentPositive)}
                        </Button>
                        <Button
                            variant={variantNegative}
                            onClick={onNegativeAction}
                            color={colorNegative}
                        >
                            {t(contentNegative)}
                        </Button>
                    </>
                }

            </Modal.Footer>
        </Modal>
    )
}
CommonConfirmDialog.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    isShow: PropTypes.bool.isRequired,
    negativeProps: PropTypes.object.isRequired,
    positiveProps: PropTypes.object.isRequired,
    size: PropTypes.string,
    centered: PropTypes.bool,
    footerBetween: PropTypes.bool
}

CommonConfirmDialog.propTypes.negativeProps.propTypes = {
    variantNegative: PropTypes.string,
    onNegativeAction: PropTypes.func,
    colorNegative: PropTypes.string
}

CommonConfirmDialog.propTypes.positiveProps.propTypes = {
    variantPositive: PropTypes.string,
    onPositiveAction: PropTypes.func,
    colorPositive: PropTypes.string
}


export default CommonConfirmDialog;
