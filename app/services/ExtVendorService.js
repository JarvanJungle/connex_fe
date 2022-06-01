/* eslint-disable max-len */
import axios from "axios";
import CONFIG from "./urlConfig";
import DialCodes from "/public/assets/DialCodes.js";

class ExtVendorService {
    getVendorsColDefs(t, hideAction) {
        return [
            {
                headerName: t("ConnectionStatus"),
                field: "connectionStatus",
                cellRenderer: (params) => {
                    if (params.data.connectionStatus) {
                        return `<div 
                                    style='display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border-radius: 4px;
                                    padding: 5px;
                                    height: 32px;
                                    border: 1px solid #828282;'
                                >${params.data.connectionStatus}</div>`;
                    }
                    return "";
                },
                cellStyle: {
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }
            },
            {
                headerName: t("CompanyCode"),
                field: "companyCode"
            },
            {
                headerName: t("CompanyName"),
                field: "companyName"
            },
            {
                headerName: t("CompanyRegNo"),
                field: "uen"
            },
            {
                headerName: t("TaxRegisteredCompany"),
                field: "gstRegBusiness",
                cellRenderer: (params) => {
                    if (params.data) {
                        if (params.data.gstRegBusiness === "Registered" || params.data.gstRegBusiness === "yes") {
                            return "Yes";
                        }
                        return "No";
                    }
                    return "";
                },
                cellStyle: { textAlign: "center" }
            },
            {
                headerName: t("ContactPerson"),
                field: "defaultSupplierUser.fullName"
            },
            {
                headerName: t("Email"),
                field: "defaultSupplierUser.emailAddress"
            },
            {
                headerName: t("SystemStatus"),
                field: "systemStatus",
                cellRenderer: (params) => {
                    if (params.data) {
                        if (params.data.systemStatus || params.data.systemStatus === "active") {
                            return "Active";
                        }
                        return "Inactive";
                    }
                    return "";
                }
            },
            {
                headerName: t("Action"),
                field: "action",
                filter: false,
                hide: hideAction,
                cellRenderer: (params) => {
                    if (params.data.connectionStatus === "CONNECTED") {
                        return `<span style="color:red; cursor: pointer;" class="d-flex align-items-center">
                                    <i class="fa fa-close mr-2"
                                        style="font-size:15px;color:red">
                                    </i>
                                    Disconnect
                                </span>`;
                    }
                    if (params.data.connectionStatus && params.data.connectionStatus !== "CONNECTED") {
                        return `<span style="color:navy; cursor: pointer;" class="d-flex align-items-center">
                                    <i class="fa fa-plus mr-2"
                                        style="font-size:15px;color:navy">
                                    </i>
                                    Reconnect
                                </span>`;
                    }
                    return "";
                },
                cellStyle: { textAlign: "left" }
            },
            {
                headerName: t("UpdatedOn"),
                field: "updatedOn",
                sort: "desc",
                hide: true
            }
        ];
    }

    getBankAccountColDefs(t) {
        return [
            {
                headerName: t("BankLabel"),
                field: "bankLabel"
            },
            {
                headerName: t("BankName"),
                field: "bankName"
            },
            {
                headerName: t("BankAccNo"),
                field: "bankAccountNo"
            },
            {
                headerName: t("AccHolderName"),
                field: "accountHolderName"
            },
            {
                headerName: t("BranchName"),
                field: "bankName"
            },
            {
                headerName: t("BranchCode"),
                field: "branchCode"
            },
            {
                headerName: t("SwiftCode"),
                field: "swiftCode"
            },
            {
                headerName: t("BranchAddress"),
                field: "branchAddress",
                valueFormatter: (params) => {
                    const { data } = params;
                    const { branchAddressLine1, branchAddressLine2 } = data;
                    if (branchAddressLine1 && branchAddressLine2) {
                        return `${branchAddressLine1}, ${branchAddressLine2}`;
                    }
                    if (branchAddressLine1) {
                        return branchAddressLine1;
                    }
                    if (branchAddressLine2) {
                        return branchAddressLine2;
                    }
                    return "";
                }
            },
            {
                headerName: t("City"),
                field: "branchCity"
            },
            {
                headerName: t("PostalCode"),
                field: "postalCode"
            },
            {
                headerName: t("Currency"),
                field: "currency"
            },
            {
                headerName: t("Default"),
                field: "default",
                cellRenderer: "defaultCell",
                cellStyle: () => ({
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                })
            }
        ];
    }

    getLisOfContactPersonColDefs(t, disabled) {
        const extractCountryCodes = (dialCodes) => {
            const sortedDialCodes = dialCodes.sort(
                (a, b) => a.label.localeCompare(b.label)
            );
            return sortedDialCodes.map((dialCode) => `+${dialCode.value}`);
        };
        const formatCountryCode = (value, dialCodes) => {
            if (value) {
                const countryCode = value?.substring(1);
                const countryCodeLabel = dialCodes.find(
                    (dialCode) => dialCode.value === countryCode
                ).label;
                return value ? `${countryCodeLabel} (+${countryCode})` : "";
            }
            return "";
        };
        return [
            {
                headerName: t("Action"),
                field: "action",
                cellRenderer: "actionDelete",
                maxWidth: 120
            },
            {
                headerName: t("FullName"),
                field: "fullName",
                editable: !disabled,
                cellStyle: () => ({
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                }),
            },
            {
                headerName: t("CountryCode"),
                field: "countryCode",
                editable: !disabled,
                cellStyle: () => ({
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                }),
                cellEditor: "agDropdownSelection",
                cellEditorParams: {
                    values: extractCountryCodes(DialCodes.dialCodes),
                    getOption: (value) => ({ label: formatCountryCode(value, DialCodes.dialCodes), value: value })
                },
            },
            {
                headerName: t("ContactNumber"),
                field: "workNumber",
                editable: !disabled,
                cellStyle: () => ({
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                })
            },
            {
                headerName: t("EmailAddress"),
                field: "emailAddress",
                editable: !disabled,
                cellStyle: () => ({
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                }),
                cellRenderer: (params) => {
                    if (params.data.emailAddress) {
                        return `<span style="color: #0463D2; text-decoration: underline;">${params.data.emailAddress}</span>`;
                    }
                    return "";
                },
            }
        ];
    }

    getExternalVendors(companyUuid) {
        const url = CONFIG.LIST_EXT_VENDOR_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    disconnectSupplier(companyUuid, supplierUuid) {
        const url = CONFIG.DISCONNECT_SUPPLIER_URL.replace("{companyUuid}", companyUuid).replace("{supplierUuid}", supplierUuid);
        return axios.put(url);
    }

    reconnectSupplier(companyUuid, body) {
        const url = CONFIG.RECONNECT_SUPPLIER_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    uploadSupplier(companyUuid, body) {
        const url = CONFIG.UPLOAD_SUPPLIER.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    createExternalVendor(companyUuid, body) {
        const url = CONFIG.CREATE_EXT_VENDOR_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    createExternalVendorNonConnect(companyUuid, body) {
        const url = CONFIG.CREATE_EXT_VENDOR_NO_CONNECT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    updateExternalVendor(companyUuid, body) {
        const url = CONFIG.UPDATE_EXT_VENDOR_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    createAndConnectExternalVendor(companyUuid, body, connectionUuid = "") {
        let url = "";
        if (connectionUuid) {
            // Create new external vendor and accept connection
            url = CONFIG.CREATE_EXT_VENDOR_AND_ACCEPT_CONNECTION_URL.replace("{companyUuid}", companyUuid).replace("{connectionUuid}", connectionUuid);
        } else {
            // Create new external vendor and send a connection request
            url = CONFIG.CREATE_AND_CONNECT_EXT_VENDOR_URL.replace("{companyUuid}", companyUuid);
        }
        return axios.post(url, body);
    }

    getExternalVendorDetails(companyUuid, uuid) { // undefined
        let url = CONFIG.GET_DETAIL_EXT_VENDOR_URL;
        url = url.replace("{companyUuid}", companyUuid).replace("{uuid}", uuid);
        return axios.get(url);
    }
}

export default new ExtVendorService();
