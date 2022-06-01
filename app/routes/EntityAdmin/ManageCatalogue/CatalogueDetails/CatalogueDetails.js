import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AvForm } from "availity-reactstrap-validation";
import {
    Container,
    Row,
    Col,
    Button,
    ButtonToolbar
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import ButtonSpinner from "components/ButtonSpinner";
import ActionModal from "routes/components/ActionModal";
import UOMService from "services/UOMService";
import SupplierService from "services/SupplierService";
import TaxRecordService from "services/TaxRecordService";
import CurrenciesService from "services/CurrenciesService";
import CatalogueService from "services/CatalogueService";
import ProjectForecastService from "services/ProjectForecastService";
import {
    convertToLocalTime, debounce, defaultColDef, formatDateTime
} from "helper/utilities";
import CUSTOM_CONSTANTS, { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import moment from "moment";
import { clearNumber, formatDisplayDecimal } from "helper/utilities";
import GLService from "services/GLService";
import CategoryService from "services/CategoryService/CategoryService";
import _ from "lodash";
import { usePermission } from "routes/hooks";
import PriceAuditTrailingTable from "./PriceAuditTrailingTable";
import CatalogueForm from "./CatalogueForm";
import CATALOGUES_ROUTE from "../route";

const CatalogueDetails = (props) => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const showToast = useToast();
    const refActionModal = useRef(null);

    const [isCreate, setIsCreate] = useState(true);
    const [isEdit, setIsEdit] = useState(true);
    const [uomList, setUomList] = useState([]);
    const [supplierList, setSupplierList] = useState([]);
    const [taxList, setTaxList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [glList, setGLList] = useState([]);
    const [auditTrails, setAuditTrails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isContracted, setIsContracted] = useState(false);
    const [form, setForm] = useState({
        isActive: true,
        contracted: false
    });
    const handleRolePermission = usePermission(FEATURE.CATALOGUE);

    // const [backupForm, setBackupForm] = useState({});

    const [detailsStates, setDetailsStates] = useState({
        companyUuid: "",
        uuid: ""
    });
    useEffect(() => {
        const query = new URLSearchParams(props.location.search);
        const uuid = query.get("uuid");
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));
        setDetailsStates((prevStates) => ({
            ...prevStates,
            companyUuid: companyRole.companyUuid,
            uuid
        }));
        if (uuid) {
            setIsCreate(false);
            setIsEdit(false);
        }
    }, []);

    const getCatalogueAuditTrail = async () => {
        try {
            const responseAuditTrail = await CatalogueService
                .getAuditTrailCatalogue(
                    {
                        companyUuid: detailsStates.companyUuid,
                        catalogueItemCode: detailsStates.uuid
                    }
                );

            if (responseAuditTrail.data.status === "OK") {
                setAuditTrails(responseAuditTrail.data.data);
            } else {
                showToast("error", responseAuditTrail.data.message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const getDataResponse = (responseData, type = "array") => {
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            const { status, data, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                return data;
            }
            showToast("error", message);
        } else {
            const { response } = responseData && responseData.reason;
            showToast("error", response.data.message || response.data.error);
        }
        return type === "array" ? [] : {};
    };

    const getCatalogueDetails = async () => {
        try {
            if (detailsStates.companyUuid) {
                const query = new URLSearchParams(props.location.search);
                const token = query.get("uuid");

                const responses = await Promise.allSettled([
                    UOMService.getUOMRecords(detailsStates.companyUuid),
                    SupplierService.retrieveAllSuppliersUnderCompany(detailsStates.companyUuid),
                    TaxRecordService.getTaxRecords(detailsStates.companyUuid),
                    CurrenciesService.getCurrencies(detailsStates.companyUuid),
                    GLService.getGLs(detailsStates.companyUuid),
                    CategoryService.getListCategory(detailsStates.companyUuid),
                    ProjectForecastService.getProjects(detailsStates.companyUuid)
                ]);
                const [
                    responseUom,
                    responseSupplier,
                    responseTax,
                    responseCurrency,
                    responseGL,
                    responseCategory,
                    responseProjects
                ] = responses;

                const uomListAll = getDataResponse(responseUom);

                const sortedUom = _.sortBy(
                    uomListAll, [(uom) => uom.uomCode.toLowerCase()]
                );
                setUomList(sortedUom);

                const suppliers = getDataResponse(responseSupplier);

                setSupplierList(suppliers.map((item) => ({
                    ...item,
                    companyLabel: `${item.companyCode} (${item.companyName})`
                })));

                const taxListActive = getDataResponse(responseTax);
                setTaxList(taxListActive);

                const currencyListAll = getDataResponse(responseCurrency);
                setCurrencyList(currencyListAll);

                const glListAll = getDataResponse(responseGL);
                setGLList(glListAll);

                const categoryListAll = getDataResponse(responseCategory);

                const sortedCategory = _.sortBy(
                    categoryListAll, [(cat) => cat.categoryName.toLowerCase()]
                );
                setCategoryList(sortedCategory);

                const projectListAll = getDataResponse(responseProjects);
                setProjectList(projectListAll);

                if (location.pathname.includes(CATALOGUES_ROUTE.MANAGE_CATALOGUES_DETAILS)) {
                    getCatalogueAuditTrail();
                }
                if (token !== null) {
                    const responseCatalogue = await CatalogueService
                        .getCatalogueDetails(
                            { companyUuid: detailsStates.companyUuid, catalogueItemCode: token }
                        );
                    if (responseCatalogue.data.status === "OK") {
                        const resData = responseCatalogue.data.data;
                        const formatData = {
                            ...resData,
                            unitPrice: resData.unitPrice,
                            validFrom:
                                formatDateTime(
                                    resData.validFrom, CUSTOM_CONSTANTS.YYYYMMDD
                                ),
                            validTo:
                                formatDateTime(
                                    resData.validTo, CUSTOM_CONSTANTS.YYYYMMDD
                                )
                        };
                        setIsContracted(resData.contracted);
                        setForm(formatData);
                        // setBackupForm(formatData);
                    } else {
                        showToast("error", responseCatalogue.data.message);
                    }
                }
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    useEffect(() => {
        getCatalogueDetails();
    }, [detailsStates]);

    const toggleEdit = () => {
        setIsEdit(!isEdit);
    };

    const updateForm = (name, value) => {
        setForm({
            ...form,
            [name]: value
        });
    };

    const changeItemCode = async (value) => {
        if (value) {
            try {
                const res = await CatalogueService
                    .getCatalogueDetailsByItemCode(detailsStates.companyUuid, value);
                const { data } = res.data;
                setForm({
                    ...form,
                    catalogueItemCode: data?.catalogueItemCode || value,
                    catalogueItemName: data?.catalogueItemName || "",
                    itemCategory: data?.itemCategory || "",
                    uomCode: data?.uomCode || "",
                    description: data?.description || "",
                    itemModel: data?.itemModel || "",
                    itemSize: data?.itemSize || "",
                    itemBrand: data?.itemBrand || "",
                    glAccountNumber: data?.glAccountNumber || "",
                    lockItemName: !!data
                });
            } catch (error) {
                showToast("error", error.response.data.message);
            }
        }
    };

    const handleChangeSupplierCode = async (code) => {
        const supplier = supplierList.find((value) => value.companyCode === code);
        const res = await SupplierService
            .retrieveSuppliersDetails(detailsStates.companyUuid, supplier.uuid);
        const supplierDetail = res.data.data;
        setForm({
            ...form,
            supplierCode: code,
            supplierName: supplier ? supplier.companyName : "",
            taxCode: supplierDetail.tax ? supplierDetail.tax.taxCode : "",
            taxRate: supplierDetail.tax ? supplierDetail.tax.taxRate : ""
        });
    };

    const handleChangeTaxCode = (code) => {
        const tax = taxList.find((value) => value.taxCode === code);
        setForm({
            ...form,
            taxCode: code,
            taxRate: tax ? tax.taxRate : ""
        });
    };

    const handleChangeIsActive = () => {
        setForm({
            ...form,
            isActive: !form.isActive
        });
    };

    const handleChangeIsContracted = () => {
        setForm({
            ...form,
            contracted: !form.contracted
        });
    };

    const handleCreateOrUpdate = async () => {
        try {
            setIsLoading(true);
            const supplier = supplierList.find((value) => value.companyCode === form.supplierCode);
            const body = {
                ...form,
                companyUuid: detailsStates.companyUuid,
                supplierUuid: supplier?.uuid || null,
                supplierCode: form.supplierCode || null,
                supplierName: form.supplierName || null,
                taxCode: form.taxCode || null,
                taxRate: form.taxRate || null,
                unitPrice: Number(clearNumber(form.unitPrice)),
                validFrom: moment(new Date(form.validFrom)).format(CUSTOM_CONSTANTS.DDMMYYYY),
                validTo: moment(new Date(form.validTo)).format(CUSTOM_CONSTANTS.DDMMYYYY),
                categoryDto: categoryList.filter(
                    (item) => item.categoryName === form.itemCategory
                )[0],
                isManual: false,
                contractedQty: Number(form?.contractedQty || 0),
                projects: form.projects ?? [],
                contractedPrice: Number(form?.contractedPrice || 0)
            };

            if (!form.validFrom) delete body.validFrom;
            if (!form.validTo) delete body.validTo;

            delete body.updatedOn;

            if (isCreate) {
                const response = await CatalogueService.postCreateCatalogue(body);
                if (response.data.status === "OK") {
                    setIsLoading(false);
                    history.push(CATALOGUES_ROUTE.MANAGE_CATALOGUES);
                    showToast("success", response.data.message);
                } else {
                    showToast("error", response.data.message);
                    setIsLoading(false);
                }
            } else {
                const response = await CatalogueService.putUpdateCatalogue(body, form.uuid);
                if (response.data.status === "OK") {
                    setIsLoading(false);
                    setIsEdit(false);
                    getCatalogueAuditTrail();
                    showToast("success", response.data.message);
                } else {
                    showToast("error", response.data.message);
                    setIsLoading(false);
                }
            }
        } catch (error) {
            showToast("error", error.response.data.message);
            setIsLoading(false);
        }
    };

    const handleValidSubmit = async () => {
        handleCreateOrUpdate();
    };
    const handleInvalidSubmit = () => {
        showToast("error", "Validation error, please check your input");
    };
    const auditColumnDefs = [
        {
            headerName: t("CatalogueUnitPrice"),
            field: "unitPrice",
            cellStyle: () => ({
                textAlign: "right"
            }),
            valueFormatter: (param) => param.value
        },
        {
            headerName: t("UOM"),
            field: "uomCode"
        },
        {
            headerName: t("CatalogueTaxCode"),
            field: "taxCode"
        },
        {
            headerName: t("CatalogueTaxPercentage"),
            field: "taxRate",
            cellStyle: () => ({
                textAlign: "right"
            }),
            valueFormatter: (param) => formatDisplayDecimal(param.value,
                CUSTOM_CONSTANTS.DEFAULT_PRECISION_NUMBER)
        },
        {
            headerName: t("CataloguePRN"),
            field: "pricingRfqNumber"
        },
        {
            headerName: t("CatalogueValidFrom"),
            field: "validFrom"
        },
        {
            headerName: t("CatalogueValidTo"),
            field: "validTo"
        },
        {
            headerName: t("CatalogueUpdatedAt"),
            field: "updatedAt",
            valueFormatter: (param) => convertToLocalTime(
                param.value,
                CUSTOM_CONSTANTS.DDMMYYYHHmmss
            )
        },
        {
            headerName: t("CatalogueUpdatedBy"),
            field: "updatedBy"
        }
    ];

    return (
        <>
            <AvForm onValidSubmit={debounce(handleValidSubmit)} onInvalidSubmit={debounce(handleInvalidSubmit)}>
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            {
                                location.pathname === CATALOGUES_ROUTE.MANAGE_CATALOGUES_CREATE
                                    ? (
                                        <HeaderMain
                                            title={(t("CreateCatalogueItem"))}
                                            className="mb-3 mb-lg-3"
                                        />
                                    )
                                    : (
                                        <HeaderMain
                                            title={(t("CatalogueDetails"))}
                                            className="mb-3 mb-lg-3"
                                        />
                                    )
                            }
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <CatalogueForm
                                isCreate={isCreate}
                                isEdit={isEdit}
                                isContracted={isContracted}
                                form={form}
                                updateForm={updateForm}
                                changeItemCode={changeItemCode}
                                handleChangeSupplierCode={handleChangeSupplierCode}
                                handleChangeTaxCode={handleChangeTaxCode}
                                handleChangeIsActive={handleChangeIsActive}
                                handleChangeIsContracted={handleChangeIsContracted}
                                uomList={uomList}
                                supplierList={supplierList}
                                taxList={taxList}
                                currencyList={currencyList}
                                categoryList={categoryList}
                                projectList={projectList}
                                glList={glList}
                                headerName={location.pathname === CATALOGUES_ROUTE.MANAGE_CATALOGUES_CREATE ? t("NewCatalogueItem") : t("Catalogue Item Details")}
                            />
                            <PriceAuditTrailingTable
                                columnDefs={auditColumnDefs}
                                defaultColDef={defaultColDef}
                                rowData={auditTrails}
                            />
                        </Col>
                    </Row>
                </Container>

                <StickyFooter>
                    <Row className="justify-content-between mx-0 px-3">
                        <Button
                            color="secondary"
                            className="mb-2"
                            onClick={() => history.goBack()}
                        >
                            {t("Back")}
                        </Button>
                        {
                            isCreate ? (
                                <ButtonSpinner text={t("Create")} className="mb-2" isLoading={isLoading} type="submit" />
                            ) : (
                                <>
                                    {
                                        isEdit ? (
                                            <ButtonToolbar>
                                                <ButtonSpinner
                                                    className="mb-2"
                                                    isLoading={isLoading}
                                                    type="submit"
                                                    text={t("Update")}
                                                />
                                            </ButtonToolbar>
                                        ) : (handleRolePermission?.write && (
                                            <Button className="mb-2 btn-facebook" onClick={toggleEdit}>
                                                {`${t("Edit")} `}
                                                <i className="fa fa-pencil ml-1" />
                                            </Button>
                                        )
                                        )
                                    }
                                </>
                            )
                        }
                    </Row>
                </StickyFooter>
            </AvForm>
            <ActionModal
                ref={refActionModal}
                title="Do you wish to create this record?"
                body="Do you wish to create this record?"
                button="Yes"
                color="success"
                action={handleCreateOrUpdate}
            />
        </>
    );
};

export default CatalogueDetails;
