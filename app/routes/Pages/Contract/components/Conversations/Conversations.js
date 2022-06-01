import React from "react";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import {
    Row,
    Col
} from "components";
import { formatDateString, convertDate2String } from "helper/utilities";
import {
    Conversation
} from "routes/components";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { v4 as uuidv4 } from "uuid";
import EntitiesService from "services/EntitiesService";

const ContractingConversion = (props) => {
    const {
        t,
        conversation,
        userDetails,
        setConversation,
        showToast,
        disabled,
        setDirty,
        enableAddComment = false
    } = props;

    const COLORS_CODE = {
        PURPLE: "#A9A2C1"
    };

    const sendCommentConversation = async (comment, isInternal) => {
        setDirty();
        if (isInternal) {
            const { rowDataInternalConversation } = conversation;
            const internalConversationLines = [...conversation.internalConversationLines];
            const newRowData = [...rowDataInternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: convertDate2String(
                    new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss
                ),
                comment,
                externalConversation: false
            });

            internalConversationLines.push({
                text: comment
            });

            setConversation((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));

            return;
        }

        const { rowDataExternalConversation } = conversation;
        const externalConversationLines = [...conversation.externalConversationLines];
        const newRowData = [...rowDataExternalConversation];

        newRowData.push({
            userName: userDetails.name,
            userRole: userDetails.designation,
            userUuid: userDetails.uuid,
            dateTime: convertDate2String(
                new Date().toISOString(), CUSTOM_CONSTANTS.DDMMYYYHHmmss
            ),
            comment,
            externalConversation: true
        });

        externalConversationLines.push({
            text: comment
        });

        setConversation((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };

    const addNewRowAttachment = (isInternal) => {
        setDirty();
        if (isInternal) {
            const { rowDataInternalAttachment } = conversation;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                uploadOn: formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4(),
                isNew: true
            });

            setConversation((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));

            return;
        }

        const { rowDataExternalAttachment } = conversation;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
            uploadOn: formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4(),
            isNew: true
        });

        setConversation((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
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
            if (response.data.status === "OK") {
                return ({
                    fileLabel: responseData.fileName,
                    guid: responseData.guid
                });
            }
            showToast("error", response.data.message);
        } catch (error) {
            if (error.response) {
                if (error.response.data.status === "BAD_REQUEST") {
                    showToast("error", "We don't support this file format, please upload another.");
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
            if (response.data.status === "OK") {
                return true;
            }
            showToast("error", response.data.message);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return false;
    };

    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        setDirty();
        if (isInternal) {
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            const rowDeleted = rowData.find((row) => row.uuid === uuid);
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }

            setConversation((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }
        setConversation((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onAddAttachment = (event, uuid, rowData, isInternal) => {
        setDirty();
        handleFileUpload(event).then((result) => {
            if (!result) return;

            if (isInternal) {
                const newRowData = [...rowData];
                newRowData.forEach((row, index) => {
                    if (row.uuid === uuid) {
                        newRowData[index] = {
                            ...row,
                            guid: result.guid,
                            attachment: result.fileLabel,
                            externalDocument: !isInternal
                        };
                    }
                });

                setConversation((prevStates) => ({
                    ...prevStates,
                    rowDataInternalAttachment: newRowData
                }));
                return;
            }

            const newRowData = [...rowData];
            newRowData.forEach((row, index) => {
                if (row.uuid === uuid) {
                    newRowData[index] = {
                        ...row,
                        guid: result.guid,
                        attachment: result.fileLabel,
                        externalDocument: !isInternal
                    };
                }
            });

            setConversation((prevStates) => ({
                ...prevStates,
                rowDataExternalAttachment: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onCellEditingStopped = (params, isInternal) => {
        setDirty();
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = conversation;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setConversation((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = conversation;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setConversation((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    return (
        <>
            <HeaderSecondary
                title={t("Conversations")}
                className="mb-2"
            />
            <Row className="mb-2">
                <Col xs={12}>
                    {/* Internal Conversations */}
                    <Conversation
                        title={t("InternalConversations")}
                        activeTab={conversation.activeInternalTab}
                        setActiveTab={(idx) => {
                            setConversation((prevStates) => ({
                                ...prevStates,
                                activeInternalTab: idx
                            }));
                        }}
                        sendConversation={(comment) => sendCommentConversation(
                            comment, true
                        )}
                        addNewRowAttachment={() => addNewRowAttachment(true)}
                        rowDataConversation={conversation
                            .rowDataInternalConversation}
                        rowDataAttachment={conversation.rowDataInternalAttachment}
                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(
                            uuid, rowData, true
                        )}
                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(
                            e, uuid, rowData, true
                        )}
                        onCellEditingStopped={(params) => onCellEditingStopped(
                            params, true
                        )}
                        defaultExpanded
                        disabled={disabled}
                        enableAddComment={enableAddComment}
                    />
                </Col>
            </Row>

            <Row className="mb-4">
                <Col xs={12}>
                    {/* External Conversations */}
                    <Conversation
                        title={t("ExternalConversations")}
                        activeTab={conversation.activeExternalTab}
                        setActiveTab={(idx) => {
                            setConversation((prevStates) => ({
                                ...prevStates,
                                activeExternalTab: idx
                            }));
                        }}
                        sendConversation={(comment) => sendCommentConversation(comment, false)}
                        addNewRowAttachment={() => addNewRowAttachment(false)}
                        rowDataConversation={conversation.rowDataExternalConversation}
                        rowDataAttachment={conversation.rowDataExternalAttachment}
                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(
                            uuid, rowData, false
                        )}
                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(
                            e, uuid, rowData, false
                        )}
                        onCellEditingStopped={(params) => onCellEditingStopped(params, false)}
                        defaultExpanded
                        borderTopColor={COLORS_CODE.PURPLE}
                        disabled={disabled}
                        enableAddComment={enableAddComment}
                    />
                </Col>
            </Row>
        </>
    );
};

export default ContractingConversion;
