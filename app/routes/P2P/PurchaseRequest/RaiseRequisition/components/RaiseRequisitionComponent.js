import React from "react";
import { useHistory } from "react-router-dom";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { Field } from "formik";
import { RadioButton } from "primereact/radiobutton";
import { RFQ_ROUTES } from "routes/P2P/RequestForQuotation";
import { convertToLocalTime, formatDateString } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { SelectInput } from "../../components";

const RaiseRequisitionComponent = (props) => {
    const history = useHistory();
    const {
        t, values, errors,
        touched,
        typeOfRequisitions,
        natureOfRequisitions,
        projects,
        projectTrades,
        setFieldValue,
        onChangeNature,
        onChangeProject,
        onChangeRequisitionType,
        onChangeProjectTrade,
        internalAttachments,
        externalAttachments,
        internalConversations,
        externalConversations,
        rowDataItemReq
    } = props;

    const handleChangeRFQProcess = (event) => {
        const { value } = event;
        const purchaseDetails = {
            currencyCode: values.currencyCode,
            prTitle: values.prTitle,
            procurementType: values.procurementType,
            requestorName: values.requester,
            submittedDate: convertToLocalTime(
                new Date(),
                CUSTOM_CONSTANTS.YYYYMMDDHHmmss
            ),
            deliveryAddress: values.deliveryAddress,
            deliveryDate: values.deliveryDate || "",
            purchaseReqDocumentMetadata: internalAttachments
                .concat(externalAttachments),
            conversations: internalConversations
                .concat(externalConversations),
            note: values.note,
            purchaseReqItem: []
        };
        if (String(values.project) === "true") {
            purchaseDetails.project = true;
            purchaseDetails.projectCode = values.projectCode;
            purchaseDetails.projectUuid = values.projectUuid;
        } else purchaseDetails.project = false;
        rowDataItemReq.forEach((data) => {
            const itemRequest = {
                uuid: data.uuid,
                itemCode: data.itemCode || "",
                itemName: data.itemName || "",
                itemDescription: data.itemDescription || "",
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: data?.uom?.uomCode ?? "",
                itemQuantity: data.itemQuantity || 0,
                note: data.note || "",
                address: data.address,
                requestedDeliveryDate: formatDateString(
                    data.requestedDeliveryDate,
                    CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                sourceCurrency: data.sourceCurrency,
                itemUnitPrice: Number(data?.itemUnitPrice ?? 0)
            };
            purchaseDetails.purchaseReqItem.push(itemRequest);
        });
        if (Boolean(value) === true) {
            setFieldValue("rfqProcess", Boolean(value));
            history.push({
                pathname: RFQ_ROUTES.RAISE_RFQ,
                state: { purchaseDetails }
            });
        }
        if (Boolean(value) === false) {
            setFieldValue("rfqProcess", Boolean(value));
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("RaiseRequisition")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <SelectInput
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
                        />
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
                        />
                    </Col>
                </Row>
                {
                    Boolean(values.project) === true
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
                                        optionLabel="projectCode"
                                        optionValue="projectCode"
                                        disable={!values.project || values.project === "false"}
                                        onChange={(e) => onChangeProject(e)}
                                        value={values.projectCode}
                                    />
                                </Col>
                            </Row>
                            {
                                values.requisitionType === "Developer Work Request"
                                && (
                                    <Row>
                                        <Col xs={12}>
                                            <SelectInput
                                                name="tradeCode"
                                                label={t("SelectProjectTrade")}
                                                className="label-required"
                                                placeholder={t("PleaseSelectProjectTrade")}
                                                errors={errors.tradeCode}
                                                touched={touched.tradeCode}
                                                options={projectTrades}
                                                optionLabel="tradeTitle"
                                                optionValue="tradeCode"
                                                disable={!values.project || values.project === "false"}
                                                onChange={(e) => onChangeProjectTrade(e)}
                                                value={values.tradeCode}
                                            />
                                        </Col>
                                    </Row>
                                )
                            }
                        </>
                    )
                }
                <Row>
                    <Col xs={4}>
                        <Label className="p-0">{t("Do you want to go for RFQ Process?")}</Label>
                    </Col>
                    <Col xs={4}>
                        <Field name="rfqProcess">
                            {({ field }) => (
                                <Row className="align-items-center mx-0">
                                    <RadioButton
                                        {...field}
                                        inputId="rfqProcess"
                                        onChange={handleChangeRFQProcess}
                                        checked={values.rfqProcess}
                                        value
                                    />
                                    <Label htmlFor="rfqProcess" className="mb-0 ml-2">
                                        {t("Yes")}
                                    </Label>
                                </Row>
                            )}
                        </Field>
                    </Col>
                    <Col xs={4}>
                        <Field name="rfqProcess">
                            {({ field }) => (
                                <Row className="align-items-center mx-0">
                                    <RadioButton
                                        {...field}
                                        inputId="rfqProcess"
                                        checked={!values.rfqProcess}
                                        onChange={handleChangeRFQProcess}
                                        value={false}
                                    />
                                    <Label htmlFor="rfqProcess" className="mb-0 ml-2">
                                        {t("No")}
                                    </Label>
                                </Row>
                            )}
                        </Field>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default RaiseRequisitionComponent;
