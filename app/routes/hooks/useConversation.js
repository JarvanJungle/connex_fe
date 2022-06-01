import { useState } from "react";
import useToast from "routes/hooks/useToast";
import { useSelector } from "react-redux";
import ConversationService from "services/ConversationService/ConversationService";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS } from "helper/constantsDefined";
import { convertDate2String } from "helper/utilities";

const useConversation = () => {
    const showToast = useToast();
    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;
    const [internalConversations, setInternalConversation] = useState([]);
    const [externalConversations, setExternalConversation] = useState([]);
    const [internalConversationLines, setInternalConversationLines] = useState([]);
    const [externalConversationLines, setExternalConversationLines] = useState([]);

    const getDataConversation = (responsesData, isInternal = true) => {
        const result = [];
        responsesData.forEach((responseData) => {
            if (responseData.status === RESPONSE_STATUS.FULFILLED) {
                const { value } = responseData;
                if (value) {
                    const { data, status, message } = value && value.data;
                    if (status === RESPONSE_STATUS.OK) {
                        if (data) {
                            data.conversations.forEach((item) => {
                                result.push({
                                    userName: item.sender,
                                    userRole: item.designation,
                                    userUuid: item.userUuid,
                                    dateTime: convertDate2String(
                                        item.date || item.createdAt,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    comment: item.text,
                                    externalConversation: !isInternal
                                });
                            });
                        }
                    } else {
                        showToast("error", message);
                    }
                }
            } else {
                const { response } = responseData && responseData.reason;
                showToast("error", response.data.message || response.data.error);
            }
        });
        return result;
    };

    const setConversations = async (conversations, isResponse, isInternal) => {
        if (isInternal && !isResponse) {
            const comments = conversations.map((item) => item.comment);
            setInternalConversation([...internalConversations, ...conversations]);
            setInternalConversationLines([...internalConversationLines, ...comments]);
        }
        if (!isInternal && !isResponse) {
            const comments = conversations.map((item) => item.comment);
            setExternalConversation([...externalConversations, ...conversations]);
            setExternalConversationLines([...externalConversationLines, ...comments]);
        }
        if (isInternal && isResponse) {
            setInternalConversation([
                ...internalConversations,
                ...getDataConversation(conversations, isInternal)
            ]);
        }
        if (!isInternal && isResponse) {
            setExternalConversation([
                ...externalConversations,
                ...getDataConversation(conversations, isInternal)
            ]);
        }
    };

    const sendCommentConversation = async (comment, isInternal) => {
        let newConversations = [];
        let newConversationLines = [];
        if (isInternal) {
            newConversations = [...internalConversations];
            newConversationLines = [...internalConversationLines];
        }
        if (!isInternal) {
            newConversations = [...externalConversations];
            newConversationLines = [...externalConversationLines];
        }

        newConversations.push({
            userName: userDetails.name,
            userRole: userDetails.designation,
            userUuid: userDetails.uuid,
            dateTime: new Date(),
            comment,
            externalConversation: false
        });
        newConversationLines.push({
            text: comment
        });

        if (isInternal) {
            setInternalConversation(newConversations);
            setInternalConversationLines(newConversationLines);
        }
        if (!isInternal) {
            setExternalConversation(newConversations);
            setExternalConversationLines(newConversationLines);
        }
    };

    const postConversation = async (
        referenceId,
        companyUuid,
        isInternal = null,
        reason = null
    ) => {
        try {
            if (isInternal === true
                && (internalConversationLines.length > 0
                || (reason?.text && reason?.isInternal === true))
            ) {
                const conversationBody = {
                    referenceId,
                    supplierUuid: userDetails.uuid,
                    conversations: internalConversationLines
                };
                if (reason && reason?.isInternal === true) {
                    conversationBody.conversations.push({
                        text: reason.text
                    });
                }
                await ConversationService.createInternalConversation(
                    companyUuid, conversationBody
                );
            }

            if (isInternal === false
                && (externalConversationLines.length > 0
                    || (reason?.text && reason?.isInternal === false))
            ) {
                const conversationBody = {
                    referenceId,
                    supplierUuid: userDetails.uuid,
                    conversations: externalConversationLines
                };
                if (reason && reason?.isInternal === false) {
                    conversationBody.conversations.push({
                        text: reason.text
                    });
                }
                await ConversationService.createExternalConversation(
                    companyUuid, conversationBody
                );
            }

            if (isInternal === null) {
                if (internalConversationLines.length > 0
                    || (reason?.text && reason?.isInternal === true)
                ) {
                    const internalConversationBody = {
                        referenceId,
                        supplierUuid: userDetails.uuid,
                        conversations: internalConversationLines
                    };

                    if (reason && reason?.isInternal === true) {
                        internalConversationBody.conversations.push({
                            text: reason.text
                        });
                    }

                    await ConversationService.createInternalConversation(
                        companyUuid, internalConversationBody
                    );
                }

                if (externalConversationLines.length > 0
                    || (reason?.text && reason?.isInternal === false)
                ) {
                    const externalConversationBody = {
                        referenceId,
                        supplierUuid: userDetails.uuid,
                        conversations: externalConversationLines
                    };

                    if (reason && reason?.isInternal === false) {
                        externalConversationBody.conversations.push({
                            text: reason.text
                        });
                    }

                    await ConversationService.createExternalConversation(
                        companyUuid, externalConversationBody
                    );
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    return [
        internalConversations,
        externalConversations,
        {
            setConversations,
            sendCommentConversation,
            postConversation
        }
    ];
};

export default useConversation;
