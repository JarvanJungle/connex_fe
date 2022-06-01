import React, {
    forwardRef, useEffect, useImperativeHandle, useMemo, useState
} from "react";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";
import CompaniesService from "services/CompaniesService";
import { useSelector } from "react-redux";
import AddressService from "services/AddressService";
import POTemplateDefault from "routes/P2P/PurchaseOrder/components/POPreviewModal/POTemplateDefault";
import POTemplate1 from "routes/P2P/PurchaseOrder/components/POPreviewModal/POTemplate1";
import DocumentTemplateService from "services/DocumentTemplateService";
import bg from "./bg.svg";

const tableRowStyles = { height: "auto" };

const POPreviewModal = forwardRef((props, ref) => {
    const {
        data, companyUuid, typeTemplate
    } = props;
    const { t } = useTranslation();
    const [isShow, setIsShow] = useState(false);
    const [company, setCompany] = useState(null);
    const [itemList, setItemList] = useState([]);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const authReducer = useSelector((state) => state.authReducer);
    const { currentCompany } = permissionReducer;
    const { userDetails } = authReducer;
    const [companyLogo, setCompanyLogo] = useState();
    const [documentTemplateSettings, setDocumentTemplateSettings] = useState();

    const toggle = () => setIsShow(!isShow);

    useImperativeHandle(ref, () => ({ toggle }));

    const getCurrentCompany = async (uuid) => {
        const companyDetails = (await CompaniesService
            .getCompany(uuid))?.data?.data;
        const addresses = (await AddressService
            .getCompanyAddresses(uuid))?.data?.data;
        companyDetails.address = addresses?.find((address) => address.default);
        setCompany(companyDetails);
    };

    const getDocumentTemplateSettings = async (uuid) => {
        try {
            const settingData = await DocumentTemplateService.getDocumentTemplateSettings(uuid);
            setDocumentTemplateSettings(settingData?.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (companyUuid) {
            getCurrentCompany(companyUuid).catch(console.error);
            getDocumentTemplateSettings(companyUuid).catch(console.error);
        }
    }, [companyUuid]);

    useEffect(() => {
        if (currentCompany) {
            setCompanyLogo(currentCompany.logoUrl);
        }
    }, [currentCompany]);

    useEffect(() => {
        if (data?.itemList?.length > 0) {
            const newItemList = [];
            data.itemList.forEach((item, index) => {
                newItemList.push({ ...item, index: index + 1 });
                if (item.notes) newItemList.push({ index: "", note: item.notes });
            });
            setItemList(newItemList);
        }
    }, [data?.itemList]);

    const getStyle = (item, index) => (
        item[index + 1]?.note
            ? { paddingBottom: 0 }
            : {}
    );

    const formatAddress = (address) => {
        if (!address) return "";
        let result = "";
        if (address?.addressFirstLine) result += address?.addressFirstLine;
        if (address?.addressSecondLine) result += `, ${address?.addressSecondLine}`;
        if (address?.state) result += `, ${address?.state}`;
        if (address?.city) result += `, ${address?.city}`;
        if (address?.country) result += `, ${address?.country}`;
        if (address?.postalCode) result += ` ${address?.postalCode}`;
        return result;
    };

    const templateName = useMemo(() => (typeTemplate || (documentTemplateSettings?.[data?.isPR ? "poWPrice" : "poWOPrice"] ?? "DEFAULT")), [documentTemplateSettings, data]);

    return (
        <Modal show={isShow} onHide={toggle} size="lg" scrollable>
            <Modal.Header closeButton>{t("PreviewPurchaseOrder")}</Modal.Header>
            <Modal.Body>
                <div className="px-4 py-5" style={{ backgroundImage: `url(${bg})` }}>
                    {templateName === "DEFAULT"
                        && (
                            <POTemplateDefault
                                {...props}
                                company={company}
                                companyLogo={companyLogo}
                                itemList={itemList}
                                userDetails={userDetails}
                                getStyle={getStyle}
                                formatAddress={formatAddress}
                                tableRowStyles={tableRowStyles}
                            />
                        )}
                    {templateName === "TEMPLATE_2" && (
                        <POTemplate1
                            {...props}
                            company={company}
                            companyLogo={companyLogo}
                            itemList={itemList}
                            userDetails={userDetails}
                            getStyle={getStyle}
                            formatAddress={formatAddress}
                            tableRowStyles={tableRowStyles}
                        />
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
});
POPreviewModal.displayName = "POPreviewModal";

export default POPreviewModal;
