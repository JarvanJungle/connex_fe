import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AddressDataService from "services/AddressService";
import { useTranslation } from "react-i18next";
import { AvForm, AvField } from "availity-reactstrap-validation";
import ButtonSpinner from "components/ButtonSpinner";
import Countries from "/public/assets/Countries.jsx";
import { Checkbox } from "primereact/checkbox";

import {
    Container,
    Row,
    Card,
    CardBody,
    CardHeader,
    FormGroup,
    Button,
    Col
} from "components";

import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import { debounce } from "helper/utilities";
import classes from "./AddressDetails.module.scss";

const AddressDetails = (props) => {
    const toast = useToast();
    let message = "Opp! Something went wrong.";

    const showToast = (type) => toast(type, t(message));

    const { t } = useTranslation();
    const history = useHistory();

    const [isCreate, setIsCreate] = useState(false);
    const [address, setAddress] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [countryList, setCountryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddressDefault, setIsAddressDefault] = useState(false);
    const handleRolePermission = usePermission(FEATURE.ADDRESS);

    const getAddressDetails = () => {
        // get the uuid
        const query = new URLSearchParams(props.location.search);
        const token = query.get("uuid");
        if (token !== null) {
            AddressDataService.getAddressDetails(token).then((response) => {
                if (response.data.status === "OK") {
                    const returnData = response.data.data;
                    setIsAddressDefault(returnData.default);
                    setAddress(returnData);
                } else {
                    message = response.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
            });
        }

        // for create path
        if (props.history.location.pathname.includes("create")) {
            const companyRole = JSON.parse(localStorage.getItem("companyRole"));
            const newAddress = {
                addressLabel: "",
                addressFirstLine: "",
                addressSecondLine: "",
                city: "",
                state: "",
                country: "",
                postalCode: "",
                default: false,
                active: true,
                companyUuid: companyRole.companyUuid
            };
            setAddress(newAddress);
            setIsCreate(true);
        }
    };

    useEffect(() => {
        getAddressDetails();
        setCountryList(Countries.countries);
    }, []);

    const handleInvalidSubmit = () => {
        message = "Validation error, please check your input";
        showToast("error");
    };

    const cancelEdit = () => {
        setIsEdit(false);
    };

    const handleValidSubmit = () => {
        setIsLoading(true);
        if (!isCreate) {
            AddressDataService.updateAddressDetails(address).then(() => {
                message = "Update Succesfully";
                showToast("success");
                cancelEdit();
                getAddressDetails();
                setIsLoading(false);
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
                setIsLoading(false);
            });
        } else {
            AddressDataService.createAddress(address).then((response) => {
                if (response.data.status === "OK") {
                    message = "Address Create Succesfully";
                    showToast("success");
                    setIsLoading(false);
                } else {
                    message = response.data.message;
                    showToast("error");
                    setIsLoading(false);
                }
                history.push(URL_CONFIG.LIST_ADDRESSES);
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
                setIsLoading(false);
            });
        }
    };

    const handleEdit = () => {
        setIsEdit(true);
    };

    return (
        <>
            <AvForm onValidSubmit={debounce(handleValidSubmit)} onInvalidSubmit={debounce(handleInvalidSubmit)}>
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            <HeaderMain
                                title={!isCreate ? (t("Company Address Details")) : (t("Create Company Address"))}
                                className="mb-3 mb-lg-3"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <Card>
                                <CardHeader tag="h6">
                                    {t("Company Address Details")}
                                </CardHeader>
                                <CardBody>
                                    <Row className="mb-4">
                                        <Col md={2}>
                                            <label className={`${classes.inputText1}`}>
                                                {" "}
                                                {`${t("Address Label")}`}
                                                <span style={{ color: "red" }}>*</span>
                                                {" "}
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <AvField
                                                    type="text"
                                                    name="addressLabel"
                                                    placeholder={t("Enter Address Label")}
                                                    className={classes.inputClass}
                                                    value={address.addressLabel}
                                                    onChange={(e) => setAddress({ ...address, addressLabel: e.target.value })}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("Enter Address Label") },
                                                        minLength: { value: 2, errorMessage: t("AddressLabelValidation") },
                                                        maxLength: { value: 20, errorMessage: t("AddressLabelValidation") }
                                                    }}
                                                    disabled={!isCreate}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row className="mb-4">
                                        <Col md={2}>
                                            <label className={classes.inputText1}>
                                                {" "}
                                                {`${t("Address Line")} 1`}
                                                <span style={{ color: "red" }}>*</span>
                                                {" "}
                                            </label>
                                        </Col>
                                        <Col md={10}>
                                            <FormGroup>
                                                <AvField
                                                    type="text"
                                                    name="addressFirstLine"
                                                    placeholder={t("Enter Address Line 1")}
                                                    className={classes.inputClass}
                                                    value={address.addressFirstLine}
                                                    onChange={(e) => setAddress({ ...address, addressFirstLine: e.target.value })}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("Enter Address Line 1") },
                                                        minLength: { value: 5, errorMessage: t("AddressLineOneLengthValidation") },
                                                        maxLength: { value: 50, errorMessage: t("AddressLineOneLengthValidation") }
                                                    }}
                                                    disabled={!isEdit && !isCreate}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row className="mb-4">
                                        <Col md={2}>
                                            <label className={classes.inputText1}>
                                                {" "}
                                                {`${t("Address Line")} 2`}
                                                {" "}
                                            </label>
                                        </Col>
                                        <Col md={10}>
                                            <FormGroup>
                                                <AvField
                                                    type="text"
                                                    name="addressSecondLine"
                                                    placeholder={t("Enter Address Line 2")}
                                                    className={classes.inputClass}
                                                    value={address.addressSecondLine}
                                                    onChange={(e) => setAddress({ ...address, addressSecondLine: e.target.value })}
                                                    validate={{
                                                        maxLength: { value: 200, errorMessage: t("AddressLineTwoLengthValidation") }
                                                    }}
                                                    disabled={!isEdit && !isCreate}
                                                />

                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row className="mb-4">
                                        <Col md={2}>
                                            <label className={classes.inputText1}>
                                                {" "}
                                                {`${t("State/Province")}`}
                                                <span style={{ color: "red" }}>*</span>
                                                {" "}
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <AvField
                                                    type="text"
                                                    name="state"
                                                    placeholder={t("Enter State/Province")}
                                                    className={classes.inputClass}
                                                    value={address.state}
                                                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("Enter State/Province") },
                                                        minLength: { value: 2, errorMessage: t("StateLengthValidation") },
                                                        maxLength: { value: 100, errorMessage: t("StateLengthValidation") }
                                                    }}
                                                    disabled={!isEdit && !isCreate}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={2}>
                                            <label className={classes.inputText1}>
                                                {" "}
                                                {t("City")}
                                                {" "}
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <AvField
                                                    type="text"
                                                    name="city"
                                                    placeholder={t("Enter City")}
                                                    className={classes.inputClass}
                                                    value={address.city}
                                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                    validate={{
                                                        maxLength: { value: 100, errorMessage: t("CityLengthValidation") }
                                                    }}
                                                    disabled={!isEdit && !isCreate}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row className="mb-4">
                                        <Col md={2}>
                                            <label className={classes.inputText1}>
                                                {" "}
                                                {`${t("Postal Code")}`}
                                                <span style={{ color: "red" }}>*</span>
                                                {" "}
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <AvField
                                                    type="text"
                                                    name="postalCode"
                                                    placeholder={t("Enter Postal Code")}
                                                    className={classes.inputClass}
                                                    value={address.postalCode}
                                                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("Enter Postal Code") },
                                                        minLength: { value: 2, errorMessage: t("PostalCodeLengthValidation") },
                                                        maxLength: { value: 20, errorMessage: t("PostalCodeLengthValidation") }
                                                    }}
                                                    disabled={!isEdit && !isCreate}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={2}>
                                            <label className={classes.inputText1}>
                                                {" "}
                                                {`${t("Country")}`}
                                                <span style={{ color: "red" }}>*</span>
                                                {" "}
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <AvField
                                                    type="select"
                                                    name="country"
                                                    style={{ color: !address.country && "#a4afbd" }}
                                                    className={classes.inputClass}
                                                    value={address.country}
                                                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("PleaseSelectCountry") }
                                                    }}
                                                    disabled={!isEdit && !isCreate}
                                                >
                                                    <option key="" value="" hidden>{t("PleaseSelectCountry")}</option>
                                                    {countryList.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
                                                </AvField>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}>
                            <Card className="mb-2">
                                <CardBody>
                                    <div className="mb-3">
                                        <div className="p-field-checkbox">
                                            <Checkbox
                                                checked={address.default}
                                                onChange={() => setAddress({ ...address, default: !address.default })}
                                                disabled={(!isEdit && !isCreate) || isAddressDefault}
                                                id="default"
                                            />
                                            <label className="mb-0 ml-2" htmlFor="default">
                                                {t("Set Default Address")}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="p-field-checkbox">
                                            <Checkbox
                                                checked={address.active}
                                                onChange={() => setAddress({ ...address, active: !address.active })}
                                                disabled={(!isEdit && !isCreate) || isAddressDefault}
                                                id="active"
                                            />
                                            <label className="mb-0 ml-2" htmlFor="active">
                                                {t("Set Active Status")}
                                            </label>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <br />
                    <br />
                </Container>
                <StickyFooter>
                    {(!isEdit && !isCreate)
                    && (
                        <div className="mx-0 px-3 d-flex justify-content-between">
                            <Button color="secondary" className="mb-2 mr-2 px-3" onClick={() => { history.push(URL_CONFIG.LIST_ADDRESSES); }}>
                                {t("Back")}
                            </Button>
                            {handleRolePermission?.write && (
                                <Button color="facebook" className="mb-2 mr-2 px-3" onClick={() => handleEdit()}>
                                    {t("Edit")}
                                    {" "}
                                    <i className="fa fa-pencil" />
                                </Button>
                            )}
                        </div>
                    )}
                    {isEdit
                    && (
                        <div className="mx-0 px-3 d-flex justify-content-between">
                            <Button color="secondary" className="mb-2 mr-2 px-3" onClick={() => { history.push(URL_CONFIG.LIST_ADDRESSES); }}>
                                {t("Back")}
                            </Button>
                            <ButtonSpinner text={t("Save")} className="mb-2 mr-2 px-3" isLoading={isLoading} />
                        </div>
                    )}
                    {isCreate
                    && (
                        <div className="mx-0 px-3 d-flex justify-content-between">
                            <Button color="secondary" className="mb-2 mr-2 px-3" onClick={() => { history.push(URL_CONFIG.LIST_ADDRESSES); }}>
                                {t("Back")}
                            </Button>
                            <ButtonSpinner text={t("Create")} className="mb-2 mr-2 px-3" isLoading={isLoading} />
                        </div>
                    )}
                </StickyFooter>
            </AvForm>
        </>
    );
};

export default AddressDetails;
