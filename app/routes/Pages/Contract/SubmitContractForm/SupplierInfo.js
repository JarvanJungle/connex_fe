import React from 'react';
import { Row, Col,Card,CardBody } from 'components';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';

function SupplierInfo() {
    return (
        <Card className = "mt-3 mb-3" style={{width: '49%', display: 'flex'}}>
            <div className="m-4 font-weight-bold">Supplier Information</div>
            <CardBody>
            <Row xs="2">
                    <Col>
                    <div className="divcontainer" style = {{lineHeight:3}}>
                        <div>Company Name</div> 
                        <div>Contract Name</div> 
                        <div>Contact Email</div> 
                        <div>Contact Number</div> 
                        <div>Tax Reg No.</div>  
                        <div>Country</div> 
                        <div>Address</div> 
                        <div>Address Details</div>
                    </div>
                    </Col>
                    <Col>
                  
                        <div><Dropdown /> </div>
                        <div><Dropdown /> </div>
                        <div><Dropdown /> </div>
                        <div><Dropdown />  </div>
                        <div><Dropdown /> </div> 
                        <div><Dropdown />  </div>
                       <div> <Dropdown /></div>
                        <div><Dropdown /> </div>
                    
                    </Col>
            </Row>
            </CardBody>
        </Card>
    )
}

export default SupplierInfo
