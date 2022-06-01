import { useState } from "react";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { useTranslation } from "react-i18next";
import EntitiesService from "services/EntitiesService";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { convertToLocalTime, itemAttachmentSchema } from "helper/utilities";
import { v4 as uuidv4 } from "uuid";

const useAttachment = (props) => {
    const {
        setDirtyFunc,
        defaultValue
    } = props;
    const { t } = useTranslation();
    const showToast = useToast();
    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;
    const [internalAttachments, setInternalAttachments] = useState(defaultValue ?? []);
    const [externalAttachments, setExternalAttachments] = useState(defaultValue ?? []);

    const getAttachmentList = (attachmentList, isExternal) => {
        const attachments = attachmentList.filter(
            (attachment) => attachment.externalDocument === isExternal
        );
        return attachments.map((
            {
                fileName, fileLabel,
                fileDescription, description,
                uploadedBy, uploadBy,
                uploadOn, uploadedOn,
                ...rest
            }
        ) => ({
            ...rest,
            fileLabel: fileLabel || fileName,
            fileDescription: fileDescription || description,
            uploadedBy: uploadedBy || uploadBy,
            uploadedOn: convertToLocalTime(uploadOn || uploadedOn)
        }));
    };

    const setAttachments = (attachments, isResponse, isInternal) => {
        if (isInternal && !isResponse) setInternalAttachments(attachments);
        if (!isInternal && !isResponse) setExternalAttachments(attachments);
        if (isInternal && isResponse) setInternalAttachments(getAttachmentList(attachments, false));
        if (!isInternal && isResponse) setExternalAttachments(getAttachmentList(attachments, true));
    };

    const addNewRowAttachment = (isInternal) => {
        if (setDirtyFunc) setDirtyFunc();

        let newAttachments = [];
        if (isInternal) newAttachments = [...internalAttachments];
        if (!isInternal) newAttachments = [...externalAttachments];

        newAttachments.push({
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: new Date(),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: !isInternal,
            uuid: uuidv4(),
            isNew: true
        });

        if (isInternal) setInternalAttachments(newAttachments);
        if (!isInternal) setExternalAttachments(newAttachments);
    };

    const handleFileUpload = async (event) => {
        try {
            const data = new FormData();
            const file = event.target.files[0];
            data.append("file", file);
            data.append("category", "purchase-service/documents");
            data.append("uploaderRole", "user");
            const response = await EntitiesService.uploadDocuments(data);
            const responseData = response.data.data;
            if (response.data.status === RESPONSE_STATUS.OK) {
                return ({
                    fileLabel: responseData.fileName,
                    guid: responseData.guid
                });
            }
            showToast("error", response.data.message);
        } catch (error) {
            if (error.response) {
                if (error.response.data.status === RESPONSE_STATUS.BAD_REQUEST) {
                    showToast("error", t("WeDontSupportThisFileFormatPleaseUploadAnother"));
                } else {
                    showToast("error", error.response.data.message);
                }
            } else {
                showToast("error", error.message);
            }
        }
        return null;
    };

    const handelDeleteFile = async (guid) => {
        try {
            const response = await EntitiesService.deleteDocuments(guid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                return true;
            }
            showToast("error", response.data.message);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return false;
    };

    const onAddAttachment = (event, uuid, rowData, isInternal) => {
        if (setDirtyFunc) setDirtyFunc();
        handleFileUpload(event).then((result) => {
            if (!result) return;

            const newRowData = [...rowData];
            newRowData.forEach((row, index) => {
                if (row.uuid === uuid) {
                    newRowData[index] = {
                        ...row,
                        guid: result.guid,
                        attachment: result.fileLabel
                    };
                }
            });

            if (isInternal) setInternalAttachments(newRowData);
            if (!isInternal) setExternalAttachments(newRowData);
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }

        if (isInternal) setInternalAttachments(newRowData);
        if (!isInternal) setExternalAttachments(newRowData);
    };

    const onCellEditingStopped = (params, isInternal) => {
        if (setDirtyFunc) setDirtyFunc();
        const { data } = params;

        let newAttachments = [];
        if (isInternal) newAttachments = [...internalAttachments];
        if (!isInternal) newAttachments = [...externalAttachments];

        newAttachments.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newAttachments[index] = { ...data };
            }
        });

        if (isInternal) setInternalAttachments(newAttachments);
        if (!isInternal) setExternalAttachments(newAttachments);
    };

    const getNewAttachments = async (featureCode) => {
        try {
            let attachments = internalAttachments.concat(externalAttachments).filter(
                (attachment) => attachment.isNew === true
            );
            switch (featureCode) {
            case FEATURE.PO:
                attachments = attachments.map(
                    ({
                        isNew, uploadedOn, fileLabel,
                        attachment, uploadedTime, fileDescription,
                        uploadedBy, ...rest
                    }) => ({
                        ...rest,
                        description: fileDescription,
                        fileName: fileLabel || attachment,
                        uploadOn: convertToLocalTime(
                            uploadedTime || uploadedOn,
                            CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                        ),
                        uploadBy: uploadedBy
                    })
                );
                break;
            default:
                attachments = attachments.map(
                    ({
                        isNew, uploadedOn, fileLabel, attachment, uuid, ...rest
                    }) => ({
                        ...rest,
                        fileLabel: fileLabel || attachment,
                        uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                    })
                );
                break;
            }

            await itemAttachmentSchema.validate(attachments);
            return attachments;
        } catch (error) {
            return error.message;
        }
    };

    return [
        internalAttachments,
        externalAttachments,
        {
            setAttachments,
            getNewAttachments,
            addNewRowAttachment,
            onAddAttachment,
            onDeleteAttachment,
            onCellEditingStopped
        }
    ];
};

export default useAttachment;
