import React, { useState } from "react";
import {
    Row,
    Col
} from "components";

import { TabView, TabPanel } from "primereact/tabview";

import {
    ConversationComponent,
    AttachmentComponent
} from "./components";
import { Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core";
import AddingOfItemsComponent from "../AddingOfItemsComponent";

const AdvancedConversationsComponent = (props) => {
    const {
        t,
        internalRowData,
        externalRowData,
        attachmentRowData,
        values,
        showToast,
        setFieldValue,
        attachmentGridRef
    } = props;

    return (
        <Row id="advancedConversationsComponent">
            <Col
                md={12}
                lg={12}
            >
                <Row className="py-3">
                    <Col
                        md={12}
                        lg={12}
                    >
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<i className="pi pi-chevron-down" />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <h4>
                                    {t("Internal Conversation")}
                                </h4>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Col
                                    md={12}
                                    lg={12}
                                >
                                    <TabView className="custom-tab-view">
                                        <TabPanel header={t("Conversation")}>
                                            <ConversationComponent
                                                t={t}
                                                rowData={internalRowData}
                                            />
                                        </TabPanel>
                                        <TabPanel className="p-0" header={t("Attachment")}>
                                            <AttachmentComponent
                                                t={t}
                                                rowData={attachmentRowData}
                                                values={values}
                                                showToast={showToast}
                                                setFieldValue={setFieldValue}
                                                gridRef={attachmentGridRef}
                                            />
                                        </TabPanel>
                                    </TabView>
                                </Col>
                            </AccordionDetails>
                        </Accordion>
                    </Col>
                </Row>

                <Row className="py-3">
                    <Col
                        md={12}
                        lg={12}
                    >
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<i className="pi pi-chevron-down" />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <h4>
                                    {t("External Conversation")}
                                </h4>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Col
                                    md={12}
                                    lg={12}
                                >
                                    <ConversationComponent
                                        t={t}
                                        rowData={externalRowData}
                                    />
                                </Col>
                            </AccordionDetails>
                        </Accordion>
                    </Col>
                </Row>
            </Col>

        </Row>
    );
};

export default AdvancedConversationsComponent;
