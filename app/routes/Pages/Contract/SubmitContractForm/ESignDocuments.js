import { Card, CardBody, Row, Col} from 'components';
import React from 'react';
import { useTranslation } from "react-i18next";
import { AgGridReact } from 'ag-grid-react';
function ESignDocuments() {

    const { t, i18n } = useTranslation();
    const rowDataEsign = [
        {action: <div><i class="fa fa-trash-o" aria-hidden="true"></i></div>, fileLabel: " ", attachment: " ", description: " ", updatedOn : " " , uploadedOn: " "}       
    ];

    const columnDefsESign = [
        {
            headerName: t("Action"),
            field: "action",

        },
        {
            headerName: t("File Label"),
            field: "fileLabel",
        },
        {
            headerName: t("Attachment"),
            field: "attachment",
        },
        {
            headerName: t("Description"),
            field: "description",
        }, 
        {
            headerName: t("Updated On"),
            field: "updatedOn",
        },
        {
            headerName: t("Uploaded On"),
            field: "uploadedOn",
        }]
   
    return (
        <div>
                 <Card>
                <CardBody>
                    <div className="font-weight-bold"> eSign Documents </div>
                    <Row className="mb-3">
                        <div>Documents Details</div>
                        <Col lg={12}>
                            <div className="ag-theme-custom-react" style={{ height: "150px" }}>
                                <AgGridReact
                                    columnDefs={columnDefsESign}
                                    rowData={rowDataEsign}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                    <div>Approver Route</div>
                        <Col lg={12}>
                            <div className="ag-theme-custom-react" style={{ height: "150px" }}>
                                <AgGridReact
                                    columnDefs={columnDefsESign}
                                    rowData={rowDataEsign}
                                />
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </div>
    )
}

export default ESignDocuments
