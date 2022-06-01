/* eslint-disable max-len */
import React, { useEffect, useState } from "react";
import {
    Container,
    Button,
    Row,
    Col,
    Card,
    CardBody,
    CardHeader,
    Label
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import StickyFooter from "components/StickyFooter";
import ExtVendorService from "services/ExtVendorService";
import URL_CONFIG from "services/urlConfig";
import { v4 as uuidv4 } from "uuid";
import useToast from "routes/hooks/useToast";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllBankAccount, getAllPaymentTerms,
    creatExternalVendor, getVendorDetail,
    updateState, reconnectSupplier,
    disconnectSupplier, updateSupplier,
    createAndConnectExternalVendor,
    createExternalVendorNonConnect
} from "actions/externalVendorActions";
import * as Yup from "yup";
import {
    Formik, Field, Form, ErrorMessage, FieldArray
} from "formik";
import classNames from "classnames";
import Countries from "/public/assets/Countries.jsx";
import DialCodes from "/public/assets/DialCodes.js";
import { Checkbox } from "primereact/checkbox";
import UserService from "services/UserService";
import { usePermission } from "routes/hooks";
import AgDropdownSelection from "components/AgDropdownSelection";
import {
    CompanyProfileCard, ContactPersonCard,
    VendorGrid, DefaultCell, ActionDelete,
    Loading
} from "../components";

const VendorDetails = (props) => {
    const toast = useToast();
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    const externalVendorSelector = useSelector((state) => state.externalVendorReducer);
    const {
        paymentTerms,
        bankAccounts,
        externalVendorDetail,
        isCreate,
        isEdit,
        supplierUuid,
        listOfContactPerson,
        rowContactPersonEdit,
        loading
    } = externalVendorSelector;
    const [connectionUuid, setConnectionUuid] = useState("");
    const [prevAddressLabels, setPrevAddressLabels] = useState([]);
    const ROW_HEIGHT = 41;
    const vendorPermission = usePermission(FEATURE.EXTERNAL_VENDOR);

    const initialValues = {
        buyer: true,
        seller: false,
        companyCode: "",
        companyName: "",
        uen: "",
        countryOfOrigin: "",
        paymentTerm: "",
        bankAccToReceivePayment: "",
        gstRegNo: "",
        gstRegBusiness: false,
        fullName: "",
        emailAddress: "",
        countryCode: "",
        workNumber: "",
        addressesDto: [{
            addressLabel: "",
            addressFirstLine: "",
            addressSecondLine: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
            uuid: "",
            default: true
        }],
        taxUuid: "",
        taxPercentage: ""
    };

    const validationSchema = Yup.object().shape({
        companyCode: Yup.string()
            .required(t("PleaseEnterValidCompanyCode")),
        companyName: Yup.string()
            .required(t("PleaseEnterValidCompanyName")),
        uen: Yup.string()
            .required(t("PleaseEnterValidCompanyRegNo")),
        countryOfOrigin: Yup.string()
            .required(t("PleaseSelectValidCountryOfOrigin")),
        paymentTerm: Yup.string()
            .required(t("PleaseSelectValidPaymentTerm")),
        fullName: Yup.string()
            .required(t("PleaseEnterValidFullName")),
        emailAddress: Yup.string()
            .email(t("PleaseEnterValidEmail"))
            .required(t("PleaseEnterValidEmail")),
        countryCode: Yup.string()
            .required(t("PleaseSelectValidDialCode")),
        workNumber: Yup.string()
            .matches(/[\d-]/, t("PleaseEnterValidPhoneNumber"))
            .required(t("PleaseEnterValidPhoneNumber")),
        addressesDto: Yup.array()
            .of(
                Yup.object().shape({
                    addressLabel: Yup.string()
                        .required(t("PleaseEnterValidAddressLabel")),
                    addressFirstLine: Yup.string()
                        .required(t("PleaseEnterValidAddressLine1")),
                    state: Yup.string()
                        .required(t("PleaseEnterValidStateProvince")),
                    country: Yup.string()
                        .required(t("PleaseSelectValidCountry")),
                    postalCode: Yup.string()
                        .required(t("PleaseEnterValidPostalCode"))
                })
            ),
        gstRegBusiness: Yup.boolean(),
        // gstRegNo: Yup.string()
        //     .when("gstRegBusiness", {
        //         is: true,
        //         then: Yup.string().required(t("PleaseEnterValidTaxRegNo"))
        //     }),
        // taxUuid: Yup.string()
        //     .when("gstRegBusiness", {
        //         is: true,
        //         then: Yup.string().required(t("PleaseSelectTaxCode"))
        //     }),
        // taxPercentage: Yup.string()
        //     .when("gstRegBusiness", {
        //         is: true,
        //         then: Yup.string().required(t("PleaseSelectTaxCode"))
        //     })
        gstRegNo: Yup.string()
            .test(
                "InValidTaxRegNo",
                t("PleaseEnterValidTaxRegNo"),
                (value, testContext) => {
                    const { parent } = testContext;
                    return ((!!value && !!parent.gstRegBusiness)
                        || (!value && !parent.gstRegBusiness)
                        || !parent.seller
                    );
                }
            ),
        taxUuid: Yup.string()
            .test(
                "InValidTaxCode",
                t("PleaseSelectTaxCode"),
                (value, testContext) => {
                    const { parent } = testContext;
                    return ((!!value && !!parent.gstRegBusiness)
                        || (!value && !parent.gstRegBusiness)
                        || !parent.seller
                    );
                }
            ),
        taxPercentage: Yup.string()
            .test(
                "InValidTaxCode",
                t("PleaseSelectTaxCode"),
                (value, testContext) => {
                    const { parent } = testContext;
                    return ((!!value && !!parent.gstRegBusiness)
                        || (!value && !parent.gstRegBusiness)
                        || !parent.seller
                    );
                }
            )
    });

    const onSavePressHandler = (values) => {
        const body = { ...values };

        body.companyCode = values.companyCode?.toUpperCase();
        body.companyName = values.companyName?.toUpperCase();
        body.uen = values.uen.toUpperCase();
        body.gstRegNo = values.gstRegNo?.toUpperCase();

        body.supplierUserList = [{
            fullName: values.fullName,
            emailAddress: values.emailAddress,
            countryCode: values.countryCode,
            workNumber: values.workNumber,
            default: true
        }];

        listOfContactPerson.forEach((user) => {
            if (user.countryCode || user.emailAddress || user.fullName || user.workNumber) {
                body.supplierUserList.push({
                    countryCode: user.countryCode,
                    emailAddress: user.emailAddress,
                    fullName: user.fullName,
                    workNumber: user.workNumber,
                    default: false
                });
            }
        });

        const addressesDto = [];
        values.addressesDto.forEach((address) => {
            if (address.uuid) {
                addressesDto.push(address);
            } else {
                addressesDto.push({
                    addressFirstLine: address.addressFirstLine,
                    addressLabel: address.addressLabel,
                    addressSecondLine: address.addressSecondLine,
                    city: address.city,
                    country: address.country,
                    default: address.default,
                    postalCode: address.postalCode,
                    state: address.state
                });
            }
        });

        body.addressDto = addressesDto;

        body.gstRegBusiness = values.gstRegBusiness ? "Registered" : "Non Registered";
        body.bankAccToReceivePayment = {
            uuid: values.bankAccToReceivePayment
        };
        body.tax = {
            uuid: values.taxUuid
        };
        body.paymentTerm = {
            ptUuid: values.paymentTerm
        };

        if (!body.seller && body.buyer) {
            delete body.gstRegNo;
            delete body.gstRegBusiness;
            delete body.tax;
        }

        if (body.seller && !body.buyer) {
            delete body.bankAccToReceivePayment;
        }

        if (isCreate && !connectionUuid) {
            // Create new supplier
            dispatch(createExternalVendorNonConnect(UserService.getCurrentCompanyUuid(), body)).then((res) => {
                if (res.data.status === RESPONSE_STATUS.OK) {
                    toast("success", res.data.message);
                    setTimeout(() => {
                        history.push(URL_CONFIG.LIST_EXT_VENDOR);
                    }, 1000);
                } else {
                    toast("error", res.data.message);
                }
            }).catch((error) => {
                toast("error", error.response ? error.response.data.message : error.message);
            });
        }

        if (isEdit) { // update supplier
            delete body.companyCode;

            body.uuid = supplierUuid;

            dispatch(updateSupplier(UserService.getCurrentCompanyUuid(), body)).then((res) => {
                if (res.data.status === RESPONSE_STATUS.OK) {
                    toast("success", res.data.message);
                    dispatch(updateState("isEdit", false));
                    const contactPersons = body.supplierUserList.filter(
                        (item) => item.default === false
                    ).map((item) => ({ ...item, uuid: uuidv4 }));
                    dispatch(updateState("listOfContactPerson", contactPersons));
                    const listAddressLabel = body.addressesDto.map((address) => address.addressLabel);
                    setPrevAddressLabels(listAddressLabel);
                } else {
                    toast("error", res.data.message);
                }
            }).catch((error) => {
                toast("error", error.response ? error.response.data.message : error.message);
            });
        }
    };

    const onSaveNConnectPressHandler = (values) => {
        const body = { ...values };

        body.companyCode = values.companyCode?.toUpperCase();
        body.companyName = values.companyName?.toUpperCase();
        body.uen = values.uen?.toUpperCase();
        body.gstRegNo = values.gstRegNo?.toUpperCase();

        body.supplierUserList = [{
            fullName: values.fullName,
            emailAddress: values.emailAddress,
            countryCode: values.countryCode,
            workNumber: values.workNumber,
            default: true
        }];

        listOfContactPerson.forEach((user) => {
            if (user.countryCode || user.emailAddress || user.fullName || user.workNumber) {
                body.supplierUserList.push({
                    countryCode: user.countryCode,
                    emailAddress: user.emailAddress,
                    fullName: user.fullName,
                    workNumber: user.workNumber,
                    default: false
                });
            }
        });

        const addressesDto = [];
        values.addressesDto.forEach((address) => {
            if (address.uuid) {
                addressesDto.push(address);
            } else {
                addressesDto.push({
                    addressFirstLine: address.addressFirstLine,
                    addressLabel: address.addressLabel,
                    addressSecondLine: address.addressSecondLine,
                    city: address.city,
                    country: address.country,
                    default: address.default,
                    postalCode: address.postalCode,
                    state: address.state
                });
            }
        });

        body.addressDto = addressesDto;

        body.gstRegBusiness = values.gstRegBusiness ? "Registered" : "Non Registered";
        body.bankAccToReceivePayment = {
            uuid: values.bankAccToReceivePayment
        };
        body.tax = {
            uuid: values.taxUuid
        };
        body.paymentTerm = {
            ptUuid: values.paymentTerm
        };

        if (!body.seller && body.buyer) {
            delete body.gstRegNo;
            delete body.gstRegBusiness;
            delete body.tax;
        }

        if (body.seller && !body.buyer) {
            delete body.bankAccToReceivePayment;
        }

        if (!connectionUuid) {
            // Create new supplier
            dispatch(creatExternalVendor(UserService.getCurrentCompanyUuid(), body)).then((res) => {
                if (res.data.status === RESPONSE_STATUS.OK) {
                    toast("success", res.data.message);
                    setTimeout(() => {
                        history.push(URL_CONFIG.LIST_EXT_VENDOR);
                    }, 1000);
                } else {
                    toast("error", res.data.message);
                }
            }).catch((error) => {
                toast("error", error?.response?.data?.message ?? error?.message ?? error);
            });
        } else {
            // Create new supplier and accept connection request
            dispatch(createAndConnectExternalVendor(
                UserService.getCurrentCompanyUuid(), body, connectionUuid
            )).then((res) => {
                if (res.data.status === RESPONSE_STATUS.OK) {
                    toast("success", res.data.message);
                    setTimeout(() => {
                        history.push(URL_CONFIG.LIST_EXT_VENDOR);
                    }, 1000);
                } else {
                    toast("error", res.data.message);
                }
            }).catch((error) => {
                toast("error", error?.response?.data?.message ?? error?.message ?? error);
            });
        }
    };

    const onDisconnectPressHandler = () => {
        dispatch(disconnectSupplier(
            UserService.getCurrentCompanyUuid(), supplierUuid
        )).then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                externalVendorDetail.connected = false;
                dispatch(updateState("externalVendorDetail", externalVendorDetail));
                dispatch(updateState("isEdit", false));
                toast("success", res.data.message);
            } else {
                toast("error", res.data.message);
            }
        }).catch((error) => {
            toast("error", error.message || error);
        });
    };

    const onReconnectPressHandler = (values) => {
        const body = { ...values };

        body.companyCode = values.companyCode?.toUpperCase();
        body.companyName = values.companyName?.toUpperCase();
        body.uen = values.uen.toUpperCase();
        body.gstRegNo = values.gstRegNo?.toUpperCase();

        body.supplierUserList = [{
            fullName: values.fullName,
            emailAddress: values.emailAddress,
            countryCode: values.countryCode,
            workNumber: values.workNumber,
            default: true
        }];

        listOfContactPerson.forEach((user) => {
            if (user.countryCode || user.emailAddress || user.fullName || user.workNumber) {
                body.supplierUserList.push({
                    countryCode: user.countryCode,
                    emailAddress: user.emailAddress,
                    fullName: user.fullName,
                    workNumber: user.workNumber,
                    default: false
                });
            }
        });

        const addressesDto = [];
        values.addressesDto.forEach((address) => {
            if (address.uuid) {
                addressesDto.push(address);
            } else {
                addressesDto.push({
                    addressFirstLine: address.addressFirstLine,
                    addressLabel: address.addressLabel,
                    addressSecondLine: address.addressSecondLine,
                    city: address.city,
                    country: address.country,
                    default: address.default,
                    postalCode: address.postalCode,
                    state: address.state
                });
            }
        });

        body.addressDto = addressesDto;

        body.gstRegBusiness = values.gstRegBusiness ? "Registered" : "Non Registered";
        body.bankAccToReceivePayment = {
            uuid: values.bankAccToReceivePayment
        };
        body.tax = {
            uuid: values.taxUuid
        };
        body.paymentTerm = {
            ptUuid: values.paymentTerm
        };

        if (!body.seller && body.buyer) {
            delete body.gstRegNo;
            delete body.gstRegBusiness;
            delete body.tax;
        }

        if (body.seller && !body.buyer) {
            delete body.bankAccToReceivePayment;
        }

        delete body.companyCode;

        body.uuid = supplierUuid;

        dispatch(reconnectSupplier(UserService.getCurrentCompanyUuid(), body)).then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                dispatch(updateState("isEdit", false));
                const contactPersons = body.supplierUserList.filter(
                    (item) => item.default === false
                ).map((item) => ({ ...item, uuid: uuidv4 }));
                dispatch(updateState("listOfContactPerson", contactPersons));
                const listAddressLabel = body.addressesDto.map((address) => address.addressLabel);
                setPrevAddressLabels(listAddressLabel);
                toast("success", t("AConnectionRequestIsSentToVendorSuccessfully"));
            } else {
                toast("error", res.data.message);
            }
        }).catch((error) => {
            toast("error", error.message || error);
        });
    };

    useEffect(() => {
        if (location.pathname.includes("details") && loading) {
            dispatch(getAllBankAccount(UserService.getCurrentCompanyUuid()));
            dispatch(getAllPaymentTerms(UserService.getCurrentCompanyUuid()));
            const query = new URLSearchParams(location.search);
            const uuid = query.get("uuid");
            dispatch(updateState("supplierUuid", uuid));
            dispatch(getVendorDetail(UserService.getCurrentCompanyUuid(), uuid));
            dispatch(updateState("isCreate", false));
            dispatch(updateState("isEdit", false));
        }
    }, [loading]);

    useEffect(() => {
        if (location.pathname.includes("details")) {
            dispatch(updateState("loading", true));
        }

        if (location.pathname.includes("create")) {
            dispatch(updateState("loading", false));
            dispatch(getAllBankAccount(UserService.getCurrentCompanyUuid()));
            dispatch(getAllPaymentTerms(UserService.getCurrentCompanyUuid()));

            const query = new URLSearchParams(location.search);

            const uuidConnection = query.get("connectionUuid");
            if (uuidConnection) {
                setConnectionUuid(uuidConnection);
                const {
                    connectionVendor
                } = props.location.state;
                if (connectionVendor) {
                    dispatch(updateState("externalVendorDetail", connectionVendor));
                }
            }
            dispatch(updateState("isCreate", true));
            dispatch(updateState("isEdit", false));
        }

        return () => {
            dispatch(updateState("isCreate", false));
            dispatch(updateState("isEdit", false));
            dispatch(updateState("externalVendorDetail", {}));
            dispatch(updateState("listOfContactPerson", []));
            dispatch(updateState("message", {
                value: "",
                type: "",
                action: ""
            }));
            dispatch(updateState("loading", false));
        };
    }, []);

    useEffect(() => {
        if (rowContactPersonEdit) {
            let newListOfContactPerson = [...listOfContactPerson];
            newListOfContactPerson = newListOfContactPerson.map((user) => {
                if (user.uuid === rowContactPersonEdit.uuid) {
                    return rowContactPersonEdit;
                }
                return user;
            });
            dispatch(updateState("listOfContactPerson", newListOfContactPerson));
        }
    }, [rowContactPersonEdit]);

    const onCheckboxValueChange = (value, values, setFieldValue, name, index) => {
        if (value === false) { return; }
        values.addressesDto.forEach((address, idx) => {
            if (idx === index) {
                setFieldValue(name, value);
            } else {
                setFieldValue(`addressesDto.${idx}.default`, false);
            }
        });
    };

    const onAddPressHandler = (dirty, errors, push) => {
        if (!dirty || (dirty && errors && (Object.keys(errors).length))) {
            toast("error", "Validation error, please check your input.");
            return;
        }

        push({
            addressLabel: "",
            addressFirstLine: "",
            addressSecondLine: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
            default: false
        });
    };

    const onCompanyProfileCBChange = (key, value, values, setFieldValue) => {
        if (key === "buyer") {
            if (!values.seller && value === false) {
                setFieldValue("buyer", value);
                setFieldValue("seller", true);
                return;
            }

            setFieldValue("buyer", value);

            return;
        }

        if (key === "seller") {
            if (!values.buyer && value === false) {
                setFieldValue("buyer", true);
                setFieldValue("seller", value);

                return;
            }

            setFieldValue("seller", value);
        }
    };

    const cellValueChanged = (params) => {
        const { data } = params;
        dispatch(updateState("rowContactPersonEdit", data));
    };

    const onCountryOfOriginChange = (value, values, setFieldValue) => {
        setFieldValue("countryOfOrigin", value);
        const countryCodeValue = DialCodes.dialCodes.find(
            (dialCode) => dialCode.label === value
        ).value;
        if (value) {
            setFieldValue("countryCode", countryCodeValue);
        }
    };

    const onTaxCodeChange = (value, values, setFieldValue, taxRecords) => {
        setFieldValue("taxUuid", value);
        const taxRecordPercentage = taxRecords.find(
            (taxRecord) => taxRecord.uuid === value
        ).taxRate;
        if (value) {
            setFieldValue("taxPercentage", taxRecordPercentage);
        }
    };

    const onGstRegChange = (value, values, setFieldValue) => {
        if (value === false) {
            setFieldValue("gstRegBusiness", value);
            setFieldValue("taxUuid", "");
            setFieldValue("taxPercentage", "");
            setFieldValue("gstRegNo", "");
        }
    };

    const getHeightTableListContactPerson = () => {
        if (isEdit || isCreate) {
            if (listOfContactPerson.length < 3) return "275px";
            if (listOfContactPerson.length >= 3 && listOfContactPerson.length <= 5) {
                return `${145 + listOfContactPerson.length * ROW_HEIGHT}px`;
            }
        } else {
            if (listOfContactPerson.length < 1) return "190px";
            if (listOfContactPerson.length >= 1 && listOfContactPerson.length <= 5) {
                return `${145 + listOfContactPerson.length * ROW_HEIGHT}px`;
            }
        }
        return `${145 + 5 * ROW_HEIGHT}px`;
    };

    const getHeightTableListBankAccountInfor = () => {
        if (Number(externalVendorDetail?.supplierBankAccountList?.length) < 1) return "190px";
        if (Number(externalVendorDetail?.supplierBankAccountList?.length) >= 1
            && Number(externalVendorDetail?.supplierBankAccountList?.length) <= 5) {
            return `${160 + Number(externalVendorDetail?.supplierBankAccountList?.length) * ROW_HEIGHT}px`;
        }
        return `${160 + 5 * ROW_HEIGHT}px`;
    };

    return (
        <Container fluid>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, setFieldTouched, dirty, handleSubmit
                }) => {
                    useEffect(() => {
                        if (Object.keys(externalVendorDetail).length) {
                            const { supplierUserList, addressesDto } = externalVendorDetail;
                            const mainContactPerson = supplierUserList.find(
                                (user) => user.default === true
                            );
                            let listContactPerson = supplierUserList.filter(
                                (user) => user.default === false
                            );
                            listContactPerson = listContactPerson.map(
                                (user) => ({ ...user, uuid: uuidv4() })
                            );
                            dispatch(updateState("listOfContactPerson", listContactPerson));
                            setFieldValue("buyer", externalVendorDetail.buyer);
                            setFieldValue("seller", externalVendorDetail.seller);
                            setFieldValue("companyCode", externalVendorDetail.companyCode);
                            setFieldValue("companyName", externalVendorDetail.companyName);
                            setFieldValue("uen", externalVendorDetail.uen);
                            setFieldValue("countryOfOrigin", externalVendorDetail.countryOfOrigin);
                            setFieldValue("paymentTerm", externalVendorDetail.paymentTerm ? externalVendorDetail.paymentTerm.ptUuid : "");
                            setFieldValue("bankAccToReceivePayment", externalVendorDetail.bankAccToReceivePayment ? externalVendorDetail.bankAccToReceivePayment?.uuid : "");
                            setFieldValue("gstRegNo", externalVendorDetail.gstRegNo);
                            setFieldValue("gstRegBusiness", externalVendorDetail.gstRegBusiness === "Registered");
                            setFieldValue("fullName", mainContactPerson.fullName);
                            setFieldValue("emailAddress", mainContactPerson.emailAddress);
                            setFieldValue("countryCode", mainContactPerson.countryCode);
                            setFieldValue("workNumber", mainContactPerson.workNumber);
                            setFieldValue("taxUuid", externalVendorDetail.tax ? externalVendorDetail.tax?.uuid : "");
                            setFieldValue("taxPercentage", externalVendorDetail.tax ? externalVendorDetail.tax?.taxRate : "");
                            addressesDto.forEach((address, index) => {
                                setFieldValue(`addressesDto.${index}.addressLabel`, address.addressLabel);
                                setFieldValue(`addressesDto.${index}.addressFirstLine`, address.addressFirstLine);
                                setFieldValue(`addressesDto.${index}.addressSecondLine`, address.addressSecondLine);
                                setFieldValue(`addressesDto.${index}.city`, address.city);
                                setFieldValue(`addressesDto.${index}.state`, address.state);
                                setFieldValue(`addressesDto.${index}.country`, address.country);
                                setFieldValue(`addressesDto.${index}.postalCode`, address.postalCode);
                                setFieldValue(`addressesDto.${index}.uuid`, address.uuid);
                                setFieldValue(`addressesDto.${index}.default`, address.default);
                            });
                            const listAddressLabel = addressesDto.map((address) => address.addressLabel);
                            setPrevAddressLabels(listAddressLabel);
                            dispatch(updateState("loading", false));
                        }
                    }, [externalVendorDetail]);

                    return (
                        <>
                            {
                                !loading
                                        && (
                                            <Form>
                                                <Row className="mb-1">
                                                    <Col lg={12}>
                                                        {location.pathname.includes("create")
                                                            ? (
                                                                <HeaderMain
                                                                    title={t("CreateExtVendor")}
                                                                    className="mb-3 mb-lg-3"
                                                                />
                                                            ) : (
                                                                <HeaderMain
                                                                    title={t("EditExtVendor")}
                                                                    className="mb-3 mb-lg-3"
                                                                />
                                                            )}
                                                    </Col>
                                                </Row>
                                                {/* Company Profile */}
                                                <Row style={{ marginBottom: 36 }}>
                                                    <Col lg={12}>
                                                        <CompanyProfileCard
                                                            t={t}
                                                            onCompanyProfileCBChange={onCompanyProfileCBChange}
                                                            onCountryOfOriginChange={onCountryOfOriginChange}
                                                            onTaxCodeChange={onTaxCodeChange}
                                                            onGstRegChange={onGstRegChange}
                                                            paymentTerms={paymentTerms}
                                                            bankAccounts={bankAccounts}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            isEdit={isEdit}
                                                            isCreate={isCreate}
                                                        />
                                                    </Col>
                                                </Row>

                                                {/* Main Contact Person */}
                                                <Row style={{ marginBottom: 36 }}>
                                                    <Col lg={12}>
                                                        <ContactPersonCard
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            isEdit={isEdit}
                                                            isCreate={isCreate}
                                                        />
                                                    </Col>
                                                </Row>

                                                {/* Company Address */}
                                                <FieldArray name="addressesDto">
                                                    {({ push, remove }) => (
                                                        <>
                                                            {values.addressesDto.length > 0
                                                                && (
                                                                    values.addressesDto.map((address, index) => {
                                                                        const addressErrors = (
                                                                            errors.addressesDto?.length
                                                                            && errors.addressesDto[index]) || {};
                                                                        const addressTouched = (
                                                                            touched.addressesDto?.length
                                                                            && touched.addressesDto[index]) || {};
                                                                        return (
                                                                            // eslint-disable-next-line react/no-array-index-key
                                                                            <Card className="mb-5" key={index}>
                                                                                <CardHeader tag="h6">
                                                                                    {`${t("CompanyAddress")} ${index + 1}`}
                                                                                </CardHeader>
                                                                                <CardBody>
                                                                                    <Col lg={12}>
                                                                                        <Row className="d-lg-flex">
                                                                                            <Col lg={6}>
                                                                                                <Row className="label-required form-group">
                                                                                                    <Col md={4} lg={4}>
                                                                                                        <Label className="p-0">{t("AddressLabel")}</Label>
                                                                                                    </Col>
                                                                                                    <Col md={8} lg={8}>
                                                                                                        <Field
                                                                                                            name={`addressesDto.${index}.addressLabel`}
                                                                                                            type="text"
                                                                                                            placeholder={t("EnterAddressLabel")}
                                                                                                            className={classNames("form-control", {
                                                                                                                "is-invalid": addressErrors.addressLabel && addressTouched.addressLabel
                                                                                                            })}
                                                                                                            disabled={(!isCreate && !isEdit)
                                                                                                                || (isEdit && prevAddressLabels.includes(values.addressesDto[index].addressLabel))}
                                                                                                            onChange={handleChange}
                                                                                                        />
                                                                                                        <ErrorMessage name={`addressesDto.${index}.addressLabel`} component="div" className="invalid-feedback" />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </Col>
                                                                                            <Col lg={6} />
                                                                                        </Row>
                                                                                        <Row className="d-lg-flex">
                                                                                            <Col lg={6}>
                                                                                                <Row className="label-required form-group">
                                                                                                    <Col md={4} lg={4}>
                                                                                                        <Label className="p-0">{t("AddressLine1")}</Label>
                                                                                                    </Col>
                                                                                                    <Col md={8} lg={8}>
                                                                                                        <Field
                                                                                                            name={`addressesDto.${index}.addressFirstLine`}
                                                                                                            type="text"
                                                                                                            placeholder={t("EnterAddressLine1")}
                                                                                                            className={classNames("form-control", {
                                                                                                                "is-invalid": addressErrors.addressFirstLine && addressTouched.addressFirstLine
                                                                                                            })}
                                                                                                            disabled={!isCreate && !isEdit}
                                                                                                            onChange={handleChange}
                                                                                                        />
                                                                                                        <ErrorMessage name={`addressesDto.${index}.addressFirstLine`} component="div" className="invalid-feedback" />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </Col>
                                                                                            <Col lg={6}>
                                                                                                <Row className="form-group">
                                                                                                    <Col md={4} lg={4}>
                                                                                                        <Label className="p-0">{t("AddressLine2")}</Label>
                                                                                                    </Col>
                                                                                                    <Col md={8} lg={8}>
                                                                                                        <Field
                                                                                                            name={`addressesDto.${index}.addressSecondLine`}
                                                                                                            type="text"
                                                                                                            placeholder={t("EnterAddressLine2")}
                                                                                                            className={classNames("form-control", {
                                                                                                                "is-invalid": addressErrors.addressSecondLine && addressTouched.addressSecondLine
                                                                                                            })}
                                                                                                            disabled={!isCreate && !isEdit}
                                                                                                            onChange={handleChange}
                                                                                                        />
                                                                                                        <ErrorMessage name={`addressesDto.${index}.addressSecondLine`} component="div" className="invalid-feedback" />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </Col>
                                                                                        </Row>
                                                                                        <Row className="d-lg-flex">
                                                                                            <Col lg={6}>
                                                                                                <Row className="form-group">
                                                                                                    <Col md={4} lg={4}>
                                                                                                        <Label className="p-0">{t("City")}</Label>
                                                                                                    </Col>
                                                                                                    <Col md={8} lg={8}>
                                                                                                        <Field
                                                                                                            name={`addressesDto.${index}.city`}
                                                                                                            type="text"
                                                                                                            placeholder={t("EnterCity")}
                                                                                                            className={classNames("form-control", {
                                                                                                                "is-invalid": addressErrors.city && addressTouched.city
                                                                                                            })}
                                                                                                            disabled={!isCreate && !isEdit}
                                                                                                            onChange={handleChange}
                                                                                                        />
                                                                                                        <ErrorMessage name={`addressesDto.${index}.city`} component="div" className="invalid-feedback" />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </Col>
                                                                                            <Col lg={6}>
                                                                                                <Row className="label-required form-group">
                                                                                                    <Col md={4} lg={4}>
                                                                                                        <Label className="p-0">{t("PostalCode")}</Label>
                                                                                                    </Col>
                                                                                                    <Col md={8} lg={8}>
                                                                                                        <Field
                                                                                                            name={`addressesDto.${index}.postalCode`}
                                                                                                            type="text"
                                                                                                            placeholder={t("EnterPostalCode")}
                                                                                                            className={classNames("form-control", {
                                                                                                                "is-invalid": addressErrors.postalCode && addressTouched.postalCode
                                                                                                            })}
                                                                                                            disabled={!isCreate && !isEdit}
                                                                                                            onChange={handleChange}
                                                                                                        />
                                                                                                        <ErrorMessage name={`addressesDto.${index}.postalCode`} component="div" className="invalid-feedback" />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </Col>
                                                                                        </Row>
                                                                                        <Row className="d-lg-flex">
                                                                                            <Col lg={6}>
                                                                                                <Row className="label-required form-group">
                                                                                                    <Col md={4} lg={4}>
                                                                                                        <Label className="p-0">{t("StateProvince")}</Label>
                                                                                                    </Col>
                                                                                                    <Col md={8} lg={8}>
                                                                                                        <Field
                                                                                                            name={`addressesDto.${index}.state`}
                                                                                                            type="text"
                                                                                                            placeholder={t("EnterStateProvince")}
                                                                                                            className={classNames("form-control", {
                                                                                                                "is-invalid": addressErrors.state && addressTouched.state
                                                                                                            })}
                                                                                                            disabled={!isCreate && !isEdit}
                                                                                                            onChange={handleChange}
                                                                                                        />
                                                                                                        <ErrorMessage name={`addressesDto.${index}.state`} component="div" className="invalid-feedback" />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </Col>
                                                                                            <Col lg={6}>
                                                                                                <Row className="label-required form-group">
                                                                                                    <Col md={4} lg={4}>
                                                                                                        <Label className="p-0">{t("Country")}</Label>
                                                                                                    </Col>
                                                                                                    <Col md={8} lg={8}>
                                                                                                        <Field name={`addressesDto.${index}.country`}>
                                                                                                            {({ field }) => (
                                                                                                                <select
                                                                                                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                                                                                                    {...field}
                                                                                                                    className={classNames("form-control", {
                                                                                                                        "is-invalid": addressErrors.country && addressTouched.country
                                                                                                                    })}
                                                                                                                    disabled={!isCreate && !isEdit}
                                                                                                                    onChange={handleChange}
                                                                                                                >
                                                                                                                    <option value="" hidden defaultValue>{t("PleaseSelectCountry")}</option>
                                                                                                                    {Countries.countries.map((country) => (
                                                                                                                        <option
                                                                                                                            key={uuidv4()}
                                                                                                                            value={country.name}
                                                                                                                        >
                                                                                                                            {country.name}
                                                                                                                        </option>
                                                                                                                    ))}
                                                                                                                </select>
                                                                                                            )}
                                                                                                        </Field>
                                                                                                        <ErrorMessage name={`addressesDto.${index}.country`} component="div" className="invalid-feedback" />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </Col>
                                                                                        </Row>
                                                                                        <Row className="d-lg-flex">
                                                                                            <Col lg={6}>
                                                                                                <div className="p-field-checkbox">
                                                                                                    <Checkbox
                                                                                                        name={`addressesDto.${index}.default`}
                                                                                                        inputId={`defaultAddress-${index}`}
                                                                                                        onChange={(e) => onCheckboxValueChange(
                                                                                                            e.checked,
                                                                                                            values,
                                                                                                            setFieldValue,
                                                                                                            `addressesDto.${index}.default`,
                                                                                                            index
                                                                                                        )}
                                                                                                        checked={address.default}
                                                                                                        disabled={!isCreate && !isEdit}
                                                                                                    />
                                                                                                    <label
                                                                                                        htmlFor={`defaultAddress-${index}`}
                                                                                                        className="mb-0"
                                                                                                    >
                                                                                                        {t("SetAsDefaultAddress")}
                                                                                                    </label>
                                                                                                </div>
                                                                                            </Col>
                                                                                        </Row>
                                                                                        {(index === values.addressesDto.length - 1 && index > 0)
                                                                                            && (
                                                                                                <div>
                                                                                                    <Button
                                                                                                        color="danger"
                                                                                                        className="mb-2 mr-2 px-3"
                                                                                                        onClick={() => {
                                                                                                            remove(index);
                                                                                                        }}
                                                                                                        disabled={(!isCreate && !isEdit) || values.addressesDto[index].default}
                                                                                                    >
                                                                                                        <i className="fa fa-trash" />
                                                                                                        {` ${t("Delete")}`}
                                                                                                    </Button>
                                                                                                    <Button
                                                                                                        color="primary"
                                                                                                        className="mb-2 px-3"
                                                                                                        onClick={() => {
                                                                                                            setFieldTouched(`addressesDto.${index}.addressLabel`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.addressFirstLine`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.addressSecondLine`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.city`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.state`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.country`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.postalCode`, true);
                                                                                                            onAddPressHandler(dirty, errors.addressesDto, push);
                                                                                                        }}
                                                                                                        disabled={!isCreate && !isEdit}
                                                                                                    >
                                                                                                        <span className="mr-1">+</span>
                                                                                                        <span>{t("AddMore")}</span>
                                                                                                    </Button>
                                                                                                </div>
                                                                                            )}
                                                                                        {(index === values.addressesDto.length - 1 && index === 0)
                                                                                            && (
                                                                                                <div>
                                                                                                    <Button
                                                                                                        color="primary"
                                                                                                        className="mb-2 px-3"
                                                                                                        onClick={() => {
                                                                                                            setFieldTouched(`addressesDto.${index}.addressLabel`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.addressFirstLine`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.addressSecondLine`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.city`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.state`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.country`, true);
                                                                                                            setFieldTouched(`addressesDto.${index}.postalCode`, true);
                                                                                                            onAddPressHandler(dirty, errors.addressesDto, push);
                                                                                                        }}
                                                                                                        disabled={!isCreate && !isEdit}
                                                                                                    >
                                                                                                        <span className="mr-1">+</span>
                                                                                                        <span>{t("AddMore")}</span>
                                                                                                    </Button>
                                                                                                </div>
                                                                                            )}
                                                                                    </Col>
                                                                                </CardBody>
                                                                            </Card>
                                                                        );
                                                                    })
                                                                )}
                                                        </>
                                                    )}
                                                </FieldArray>

                                                {/* List Of Contact Person */}
                                                <Card className="mb-5">
                                                    <CardHeader tag="h6">
                                                        {t("ListOfContactPerson")}
                                                    </CardHeader>
                                                    <Row className="mx-0 px-4 pt-3 justify-content-end">
                                                        <Button
                                                            color="primary"
                                                            onClick={() => {
                                                                const newListOfContactPerson = [...listOfContactPerson];
                                                                newListOfContactPerson.push({
                                                                    countryCode: "",
                                                                    default: false,
                                                                    emailAddress: "",
                                                                    fullName: "",
                                                                    uuid: uuidv4(),
                                                                    workNumber: ""
                                                                });
                                                                dispatch(updateState("listOfContactPerson", newListOfContactPerson));
                                                            }}
                                                            disabled={!isCreate && !isEdit}
                                                        >
                                                            <span className="mr-1">+</span>
                                                            <span>{t("Add")}</span>
                                                        </Button>
                                                    </Row>
                                                    <CardBody>
                                                        <Col lg={12}>
                                                            <Row className="d-lg-flex">
                                                                <VendorGrid
                                                                    width="100%"
                                                                    height={getHeightTableListContactPerson()}
                                                                    columnDefs={ExtVendorService.getLisOfContactPersonColDefs(t, (!isCreate && !isEdit))}
                                                                    rowData={listOfContactPerson}
                                                                    onGridReady={(params) => { params.api.sizeColumnsToFit(); }}
                                                                    paginationPageSize={5}
                                                                    frameworkComponents={{
                                                                        actionDelete: ActionDelete,
                                                                        agDropdownSelection: AgDropdownSelection
                                                                    }}
                                                                    gridOptions={{ onCellEditingStopped: cellValueChanged }}
                                                                />
                                                            </Row>
                                                        </Col>
                                                    </CardBody>
                                                </Card>

                                                {/* Bank Account Information */}
                                                {location.pathname.includes("detail") && externalVendorDetail.seller
                                                    && (
                                                        <Card className="mb-5">
                                                            <CardHeader tag="h6">
                                                                {t("BankAccountInformation")}
                                                            </CardHeader>
                                                            <CardBody>
                                                                <Col lg={12}>
                                                                    <Row className="d-lg-flex">
                                                                        <VendorGrid
                                                                            width="100%"
                                                                            height={getHeightTableListBankAccountInfor()}
                                                                            columnDefs={ExtVendorService.getBankAccountColDefs(t)}
                                                                            rowData={externalVendorDetail.supplierBankAccountList}
                                                                            onGridReady={() => { }}
                                                                            paginationPageSize={5}
                                                                            frameworkComponents={{
                                                                                defaultCell: DefaultCell
                                                                            }}
                                                                        />
                                                                    </Row>
                                                                </Col>
                                                            </CardBody>
                                                        </Card>
                                                    )}

                                                {/* Footer */}
                                                <StickyFooter>
                                                    {((isCreate)
                                                        || (!isCreate && Object.keys(externalVendorDetail).length))
                                                        && (
                                                            <Row className="mx-0 px-3 justify-content-between">
                                                                <Button
                                                                    color="secondary"
                                                                    className="mb-2 mr-2 px-3"
                                                                    onClick={() => history.goBack()}
                                                                >
                                                                    {t("Back")}
                                                                </Button>
                                                                {vendorPermission.write && (
                                                                    <>
                                                                        {isCreate
                                                                            ? (
                                                                                <div>
                                                                                    {!connectionUuid && (
                                                                                        <Button
                                                                                            type="button"
                                                                                            color="primary"
                                                                                            className="mb-2 mr-2 px-3"
                                                                                            onClick={() => {
                                                                                                handleSubmit();
                                                                                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                                                    toast("error", "Validation error, please check your input.");
                                                                                                    return;
                                                                                                }
                                                                                                onSavePressHandler(values);
                                                                                            }}
                                                                                        >
                                                                                            {t("Save")}
                                                                                        </Button>
                                                                                    )}
                                                                                    <Button
                                                                                        color="primary"
                                                                                        className="mb-2 mr-2 px-3"
                                                                                        onClick={() => {
                                                                                            handleSubmit();
                                                                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                                                toast("error", "Validation error, please check your input.");
                                                                                                return;
                                                                                            }

                                                                                            onSaveNConnectPressHandler(values, setFieldValue);
                                                                                        }}
                                                                                    >
                                                                                        {t("SaveNConnect")}
                                                                                    </Button>
                                                                                </div>
                                                                            )
                                                                            : (
                                                                                <div>
                                                                                    {!isEdit
                                                                                        ? (
                                                                                            <>
                                                                                                <Button
                                                                                                    className="mb-2 mr-2 px-3 btn-facebook"
                                                                                                    onClick={() => dispatch(updateState("isEdit", true))}
                                                                                                >
                                                                                                    {t("Edit")}
                                                                                                    <i className="ml-1 fa fa-pencil" />
                                                                                                </Button>
                                                                                                {isCreate || (!isCreate && externalVendorDetail.connected === false)
                                                                                                    ? (
                                                                                                        <Button
                                                                                                            color="primary"
                                                                                                            className="mb-2 mr-2 px-3"
                                                                                                            onClick={() => onReconnectPressHandler(values)}
                                                                                                        >
                                                                                                            {t("Reconnect")}
                                                                                                        </Button>
                                                                                                    )
                                                                                                    : (
                                                                                                        <Button
                                                                                                            color="danger"
                                                                                                            className="mb-2 mr-2 px-3"
                                                                                                            onClick={onDisconnectPressHandler}
                                                                                                        >
                                                                                                            {t("Disconnect")}
                                                                                                        </Button>
                                                                                                    )}
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    color="primary"
                                                                                                    className="mb-2 mr-2 px-3"
                                                                                                    onClick={() => {
                                                                                                        if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                                                            toast("error", "Validation error, please check your input.");
                                                                                                            return;
                                                                                                        }
                                                                                                        handleSubmit();
                                                                                                        onSavePressHandler(values);
                                                                                                    }}
                                                                                                >
                                                                                                    {t("Save")}
                                                                                                </Button>
                                                                                                {isCreate || (!isCreate && externalVendorDetail.connected === false)
                                                                                                    ? (
                                                                                                        <Button
                                                                                                            color="primary"
                                                                                                            className="mb-2 mr-2 px-3"
                                                                                                            onClick={() => onReconnectPressHandler(values)}
                                                                                                        >
                                                                                                            {t("Reconnect")}
                                                                                                        </Button>
                                                                                                    )
                                                                                                    : (
                                                                                                        <Button
                                                                                                            color="danger"
                                                                                                            className="mb-2 mr-2 px-3"
                                                                                                            onClick={onDisconnectPressHandler}
                                                                                                        >
                                                                                                            {t("Disconnect")}
                                                                                                        </Button>
                                                                                                    )}
                                                                                            </>
                                                                                        )}
                                                                                </div>
                                                                            )}
                                                                    </>
                                                                )}

                                                            </Row>
                                                        )}
                                                </StickyFooter>
                                            </Form>
                                        )
                            }

                            {
                                loading
                                && (
                                    <Loading />
                                )
                            }

                        </>
                    );
                }}
            </Formik>
        </Container>
    );
};

export default VendorDetails;
