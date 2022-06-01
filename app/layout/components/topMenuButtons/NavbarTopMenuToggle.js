import React, { useState, useEffect, useRef } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { setToLS } from "helper/utilities";
import { FEATURE_ROUTE_BASED } from "helper/constantsDefined";
import { useDispatch } from "react-redux";
import { updateIsBuyer } from "actions/permissionActions";
import useToast from "routes/hooks/useToast";
import { ToastContainer } from "react-toastify";
import ActionModal from "routes/components/ActionModal";
import classes from "./NavbarTopMenuToggle.scss";

const NavbarTopMenuToggle = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const showToast = useToast();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [toggleOn, setToggleOn] = useState(true);
    const [toggleIsEnable, setToggleIsEnable] = useState(true);
    const refActionModal = useRef(null);

    useEffect(() => {
        if (permissionReducer && permissionReducer?.currentCompany) {
            if (permissionReducer.featureBasedOn === "ADMIN") {
                setToggleIsEnable(false);
            }
            const { isBuyer } = permissionReducer;

            // just turn it on when buyer and supplier is true
            // if (currentCompany.buyer && currentCompany.supplier) {
            //     setToggleIsEnable(true);c
            // }
            setToggleOn(!isBuyer);
        }
    }, [authReducer, permissionReducer]);

    const onToggleChanged = (value) => {
        const { currentCompany } = permissionReducer;
        if (currentCompany.buyer && currentCompany.supplier) {
            refActionModal.current.toggleModal();
            setToggleOn(value);
            setToLS(FEATURE_ROUTE_BASED.IS_BUYER, !value);
            dispatch(updateIsBuyer(!value));
        } else {
            showToast("error", t("You don't have permission to switch to another one"));
        }
    };

    if (toggleIsEnable) {
        return (
            <>
                <div className={classes["toggle-menu"]}>
                    <p className={[classes["text-buyer"], toggleOn ? "" : classes.active].join(" ")}>{t("Buyer")}</p>
                    <InputSwitch
                        className={classes["toggle-button"]}
                        checked={toggleOn}
                        onChange={(e) => onToggleChanged(e.value)}
                    />
                    <p className={[classes["text-supplier"], !toggleOn ? "" : classes.active].join(" ")}>{t("Supplier")}</p>
                </div>
                <ActionModal
                    ref={refActionModal}
                    title={t("Switch Profile Notice")}
                    body={t("You are become a ") + (toggleOn ? "Supplier" : "Buyer")}
                    button="Yes"
                    color="primary"
                    action={() => {}}
                />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    draggable={false}
                    hideProgressBar
                />
            </>
        );
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                draggable={false}
                hideProgressBar
            />
        </>
    );
};

export default NavbarTopMenuToggle;
