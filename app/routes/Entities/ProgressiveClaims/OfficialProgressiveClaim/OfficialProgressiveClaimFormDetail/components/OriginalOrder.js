import React, {
    useState, useEffect, useRef, useImperativeHandle
} from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import _ from "lodash";
import {
    Col,
    Row,
    Table,
    MultiSelect,
    ButtonToolbar,
    Button
} from "components";
import { Checkbox } from "primereact/checkbox";
import { AgGridTable } from "routes/components";
import IconButton from "@material-ui/core/IconButton";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVReader } from "react-papaparse";
import ButtonSpinner from "components/ButtonSpinner";
import {
    PC_STATUS,
    originalOrder,
    originalSummary
} from "../../Helper";
import CustomTooltip from "../../../../../Pages/Contract/components/ContractItems/CustomTooltip";

const colourScheme = {
    BUYER: "#AEC57D",
    SUPPLIER: "#A9A2C1"
};

const saveData = {};
const getUuid = (item = {}) => item.uuid || item.itemUuid;
const editableFields = {
    workCode: {
        canEdit: true,
        justDraftEdit: false,
        canEditStatus: [
            PC_STATUS.CREATED,
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION,
            PC_STATUS.PENDING_ISSUE
        ]
    },
    description: {
        canEdit: true,
        justDraftEdit: false,
        canEditStatus: [
            PC_STATUS.CREATED,
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION,
            PC_STATUS.PENDING_ISSUE
        ]
    },
    uom: {
        canEdit: true,
        justDraftEdit: false,
        onlyChildEdit: true,
        canEditStatus: [
            PC_STATUS.CREATED,
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION,
            PC_STATUS.PENDING_ISSUE
        ]
    },
    remarks: {
        canEdit: true,
        justDraftEdit: false,
        canEditStatus: [
            PC_STATUS.CREATED,
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION,
            PC_STATUS.PENDING_ISSUE
        ]
    },
    retention: {
        canEdit: false,
        justDraftEdit: true,
        canEditStatus: [
            PC_STATUS.CREATED,
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION,
            PC_STATUS.PENDING_ISSUE
        ]
    },
    quantity: {
        canEdit: true,
        onlyChildEdit: true,
        canEditStatus: [
            PC_STATUS.CREATED,
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION,
            PC_STATUS.PENDING_ISSUE
        ]
    },
    unitPrice: {
        canEdit: true,
        onlyChildEdit: true,
        canEditStatus: [
            PC_STATUS.CREATED,
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION,
            PC_STATUS.PENDING_ISSUE
        ]
    },
    previouslyActualCumulativeClaimedQty: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    previouslyActualCumulativeClaimedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    previouslyActualCumulativeClaimedAmount: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    cumulativeDraftClaimedQty: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    cumulativeDraftClaimedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    cumulativeDraftClaimedAmount: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    cumulativeActualClaimedQty: {
        canEdit: true,
        onlyChildEdit: true,
        canEditStatus: [PC_STATUS.CREATED, PC_STATUS.PENDING_ISSUE],
        editaleOnlySide: ["SUPPLIER"],
        colorBySide: colourScheme.SUPPLIER
    },
    cumulativeActualClaimedPercentage: {
        canEdit: true,
        onlyChildEdit: true,
        canEditStatus: [PC_STATUS.CREATED, PC_STATUS.PENDING_ISSUE],
        editaleOnlySide: ["SUPPLIER"],
        colorBySide: colourScheme.SUPPLIER
    },
    cumulativeActualClaimedAmount: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentDraftClaimedQty: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentDraftClaimedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentDraftClaimedAmount: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentDraftClaimedRemarks: {
        canEdit: false,
        canEditStatus: [PC_STATUS.CREATED, PC_STATUS.PENDING_ISSUE],
        editaleOnlySide: ["SUPPLIER"],
        colorBySide: colourScheme.SUPPLIER
    },
    currentActualClaimedQty: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentActualClaimedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentActualClaimedAmount: {
        canEdit: false,
        colorBySide: colourScheme.SUPPLIER
    },
    currentActualClaimedRemarks: {
        canEdit: true,
        canEditStatus: [PC_STATUS.CREATED, PC_STATUS.PENDING_ISSUE],
        editaleOnlySide: ["SUPPLIER"],
        colorBySide: colourScheme.SUPPLIER
    },
    previouslyActualCumulativeCertifiedQty: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    previouslyActualCumulativeCertifiedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    previouslyActualCumulativeCertifiedAmount: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    cumulativeDraftCertifiedQty: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    cumulativeDraftCertifiedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    cumulativeDraftCertifiedAmount: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    certify: {
        canEdit: true,
        canEditStatus: [
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION
        ],
        showOnStatus: [PC_STATUS.PENDING_VALUATION, PC_STATUS.PENDING_SUBMISSION],
        editaleOnlySide: ["BUYER"]
    },
    cumulativeActualCertifiedQty: {
        canEdit: true,
        onlyChildEdit: true,
        canEditStatus: [
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION
        ],
        editaleOnlySide: ["BUYER"],
        colorBySide: colourScheme.BUYER
    },
    cumulativeActualCertifiedPercentage: {
        canEdit: true,
        onlyChildEdit: true,
        canEditStatus: [
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION
        ],
        editaleOnlySide: ["BUYER"],
        colorBySide: colourScheme.BUYER
    },
    cumulativeActualCertifiedAmount: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentDraftCertifiedQty: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentDraftCertifiedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentDraftCertifiedAmount: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentDraftCertifiedRemarks: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentActualCertifiedQty: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentActualCertifiedPercentage: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentActualCertifiedAmount: {
        canEdit: false,
        colorBySide: colourScheme.BUYER
    },
    currentActualCertifiedRemarks: {
        canEdit: true,
        canEditStatus: [
            PC_STATUS.PENDING_VALUATION,
            PC_STATUS.PENDING_SUBMISSION
        ],
        showOnStatus: [PC_STATUS.PENDING_VALUATION, PC_STATUS.PENDING_SUBMISSION],
        editaleOnlySide: ["BUYER"]
    }
};

const OriginalOrder = (props) => {
    const {
        t,
        values = {},
        setFieldValue,
        borderTopColor,
        users,
        onAddChildItem = () => { },
        onDeleteItem = () => { },
        onChangeOriginalOrder,
        rowData = [],
        onExpandRow = () => { },
        draftDetail = {},
        uoms,
        refCb,
        isBuyer,
        onCellValueChanged = () => { },
        subHeader = "",
        userDetails
    } = props;
    const rowDataWorkSpaceRootLevel = rowData.filter((x) => x.groupNumber.length === 1);

    const [gridAPI, setGridApi] = useState({
        summary: null,
        originalItem: null
    });
    const [changedSubmitInfo, setChangedSubmitInfo] = useState({
        createNodes: [],
        editNodeList: [],
        oldRootNodeUuids: []
    });
    const submitInfoRef = useRef(changedSubmitInfo);

    useEffect(() => {
        submitInfoRef.current = changedSubmitInfo;
    }, [changedSubmitInfo]);

    const getAllRowNodeDatas = () => {
        const nodeData = [];
        gridAPI?.originalItem?.forEachNode((node) => nodeData.push(node.data));
        return nodeData;
    };

    const getAllRowNodes = () => {
        const nodeData = [];
        gridAPI?.originalItem?.forEachNode((node) => nodeData.push(node));
        return nodeData;
    };
    const getRootParentItem = (data) => getAllRowNodeDatas().find((x) => x.groupNumber.length === 1 && x.groupNumber[0] === data.groupNumber[0]);
    const addUomsList = (colDefs, uomsList) => {
        for (let i = 0; i < colDefs.length; i++) {
            if (colDefs[i].field === "uom") {
                colDefs[i].cellEditorParams.values = uomsList;
                break;
            }
            if (colDefs[i].children) {
                addUomsList(colDefs[i].children, uomsList);
            }
        }
    };
    const getGroupNumber = (item) => (Array.isArray(item.groupNumber) ? item.groupNumber.at(-1) : item.groupNumber);
    const getTotalBindingAmount = () => {
        const rowNodes = getAllRowNodes();
        let total = 0;
        let cumulativeClaimedMainConWorksTotalAmount = 0;
        let cumulativeCertifiedMainConWorksTotalAmount = 0;
        const cumulativeCertifiedWorkDoneTotalAmount = 0;
        let currentClaimedMainConWorksTotalAmount = 0;
        if (rowNodes && rowNodes.length > 0) {
            rowNodes.forEach((item) => {
                const {
                    level, aggData, data: {
                        cumulativeActualClaimedAmount = 0,
                        cumulativeActualClaimedQty = 0,
                        cumulativeActualCertifiedQty = 0,
                        cumulativeActualCertifiedAmount = 0,
                        totalAmount = 0,
                        quantity = 0,
                        unitPrice = 0,
                        currentActualClaimedAmount = 0
                    }
                } = item;
                if (level === 0) {
                    total += (aggData?.totalAmount || (quantity * unitPrice) || totalAmount || 0);
                    cumulativeClaimedMainConWorksTotalAmount += (aggData?.cumulativeActualClaimedAmount || (cumulativeActualClaimedQty * unitPrice) || cumulativeActualClaimedAmount || 0);
                    cumulativeCertifiedMainConWorksTotalAmount += (aggData?.cumulativeActualCertifiedAmount || (cumulativeActualCertifiedQty * unitPrice) || cumulativeActualCertifiedAmount || 0);
                    currentClaimedMainConWorksTotalAmount += aggData?.cumulativeActualClaimedAmount || cumulativeActualClaimedAmount;
                }
            });
        }
        return {
            totalAmount: total,
            cumulativeClaimedMainConWorksTotalAmount,
            cumulativeCertifiedMainConWorksTotalAmount,
            cumulativeCertifiedWorkDoneTotalAmount,
            currentClaimedMainConWorksTotalAmount
        };
    };

    const visibleFunc = (field, values) => {
        if (editableFields[field]?.showOnStatus) {
            return editableFields[field]?.showOnStatus.includes(draftDetail?.pcStatus);
        }

        return true;
    };
    const editableCheck = (params) => {
        const parentRoot = getRootParentItem(params.data);
        const side = isBuyer ? "BUYER" : "SUPPLIER";
        const spectifyCase = side !== "SUPPLIER" && (draftDetail?.pcStatus === PC_STATUS.PENDING_VALUATION || draftDetail?.pcStatus === PC_STATUS.PENDING_SUBMISSION);
        const { uuid } = userDetails || {};
        const matchRole = (parentRoot.evaluators && parentRoot.evaluators.some((item) => item.uuid === uuid));
        if (params
            && params.colDef
            && editableFields[params.colDef.field]
            && editableFields[params.colDef.field].canEdit
        ) {
            if (!matchRole && spectifyCase) return false;
            if (editableFields[params.colDef.field].onlyChildEdit) {
                if (params.node.allChildrenCount || params.data.hasChildren) {
                    if (!params.data.draftItem && !saveData[params.node.data.itemUuid]) saveData[params.node.data.itemUuid] = {};
                    if (params.node.data.quantity) {
                        if (saveData[params.node.data.itemUuid]) saveData[params.node.data.itemUuid].quantity = params.node.data.quantity;
                        params.node.setDataValue("quantity", null);
                        params.node.setDataValue("totalAmount", null);
                    }
                    if (params.node.data.unitPrice) {
                        if (saveData[params.node.data.itemUuid]) saveData[params.node.data.itemUuid].unitPrice = params.node.data.unitPrice;
                        params.node.setDataValue("unitPrice", null);
                    }
                    return false;
                } if (saveData[params.node.data.itemUuid]) {
                    if (saveData[params.node.data.itemUuid].quantity) {
                        params.node.setDataValue("quantity", saveData[params.node.data.itemUuid].quantity);
                    }
                    if (saveData[params.node.data.itemUuid].unitPrice) {
                        params.node.setDataValue("unitPrice", saveData[params.node.data.itemUuid].unitPrice);
                    }
                }
                if (
                    !params.data.hasChildren
                    && !params.node.level
                    && spectifyCase && (params.colDef.field === "quantity"
                        || params.colDef.field === "unitPrice")
                ) {
                    return false;
                }
            }
            if (editableFields[params.colDef.field].justDraftEdit) {
                if (!params.data.draftItem) {
                    return false;
                }
            }
            if (!editableFields[params.colDef.field].canEditStatus.includes(draftDetail?.pcStatus)) {
                return false;
            }
            if (editableFields[params.colDef.field].editaleOnlySide) {
                if (!editableFields[params.colDef.field].editaleOnlySide.includes(side)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    const editableFunc = (isStyle) => {
        if (isStyle) {
            return (params) => {
                if (editableCheck(params)) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                if (editableFields[params.colDef.field] && editableFields[params.colDef.field].colorBySide) {
                    return {
                        backgroundColor: editableFields[params.colDef.field].colorBySide
                        // border: "1px solid #E4E7EB"
                    };
                }
                return {
                };
            };
        }
        return (params) => {
            if (editableCheck(params)) {
                return true;
            }
            return false;
        };
    };
    useImperativeHandle(refCb, () => ({
        getSubmitOriginOrderData() {
            return changedSubmitInfo;
        }
    }));
    useEffect(() => {
        setChangedSubmitInfo((prevStates) => ({
            ...prevStates,
            oldRootNodeUuids: rowDataWorkSpaceRootLevel.map((item) => item.itemUuid)
        }));
        const rowDataMapped = rowData && rowData.map((item) => {
            const isPendingItemStatus = !isBuyer && [
                PC_STATUS.CREATED,
                PC_STATUS.RECALLED,
                PC_STATUS.PENDING_ISSUE,
                PC_STATUS.PENDING_ACKNOWLEDGEMENT,
                PC_STATUS.SENT_BACK_BY_MAIN_CONTRACTOR].includes(draftDetail?.pcStatus);

            // item.isBuyer = isBuyer;
            // item.pcStatus = draftDetail?.pcStatus;
            item.isPendingItemStatus = isPendingItemStatus;

            return item;
        });
        gridAPI?.originalItem?.setRowData(rowDataMapped);
    }, [rowData]);

    const processAssignEditableCheck = (colDefs) => {
        for (let i = 0; i < colDefs.length; i++) {
            colDefs[i].editable = editableFunc();
            colDefs[i].cellStyle = editableFunc(true);
            if (!visibleFunc(colDefs[i].field, draftDetail)) {
                gridAPI?.originalItem?.columnApi?.setColumnVisible(colDefs[i].field, false);
            }
            if (colDefs[i].children) {
                processAssignEditableCheck(colDefs[i].children);
            }
        }
    };

    const formatUom = (uom) => {
        if (uom && typeof uom === "object") {
            uom = { ...uom };
            uom = uom.uomCode;
        }
        return uom;
    };

    const onRowDataChanged = (propsChanged) => {
        onChangeOriginalOrder(getTotalBindingAmount());
        if (gridAPI.originalItem) {
            const colDefs = gridAPI.originalItem.getColumnDefs();
            processAssignEditableCheck(colDefs);
            if (uoms.length) {
                addUomsList(colDefs, uoms);
            }
            gridAPI.originalItem.refreshClientSideRowModel("aggregate");
            gridAPI.originalItem.setColumnDefs(colDefs);
            gridAPI.originalItem.expandAll();
            if (propsChanged.type === "rowDataUpdated") {
                const createdNodes = [...changedSubmitInfo.createNodes];
                const rowDatas = getAllRowNodeDatas();
                const filterdCreatedNodes = createdNodes.filter((item) => {
                    item.uom = formatUom(item.uom);
                    if (item.draftItem && !rowDatas.find((itemRow) => getGroupNumber(itemRow) === getGroupNumber(item))) {
                        return false;
                    }
                    return true;
                });
                setChangedSubmitInfo((prevStates) => ({
                    ...prevStates,
                    ...{ createNodes: filterdCreatedNodes }
                }));
            }
        }
    };
    const onGridReady = (gridApiName, params, columnFit = false) => {
        if (columnFit) {
            params.api.sizeColumnsToFit();
        }
        gridAPI[gridApiName] = params.api;
        gridAPI[gridApiName].columnApi = params.columnApi;
        setGridApi(gridAPI);
    };

    const EvaluatorCellRenderer = (params) => {
        const { value = [] } = params;
        let nameText = "";
        if (value.length) {
            nameText = `${value.length} Users Selected`;
        }
        return (
            <span>
                {nameText}
            </span>
        );
    };

    const EvaluatorSelectedCellRenderer = (params) => {
        const { value = [] } = params;
        let nameText = "";
        value?.forEach((item, i) => {
            nameText += item.name + (value.length - 1 === i ? "" : ", ");
        });
        return (
            <span>
                {nameText}
            </span>
        );
    };

    const GroupCellRenderer = (params) => {
        const {
            data,
            agGridReact
        } = params;
        const {
            groupNumber,
            quantity,
            unitPrice,
            draftItem,
            hasChildren
        } = data;
        const value = groupNumber.at(-1);
        const parentRoot = getRootParentItem(params.data);
        const side = isBuyer ? "BUYER" : "SUPPLIER";
        const spectifyCase = side !== "SUPPLIER" && (draftDetail?.pcStatus === PC_STATUS.PENDING_VALUATION || draftDetail?.pcStatus === PC_STATUS.PENDING_SUBMISSION);
        const { uuid } = userDetails || {};
        const matchRole = (parentRoot.evaluators && parentRoot.evaluators.some((item) => item.uuid === uuid));
        return (
            <>
                <span>
                    {value}
                    &nbsp;
                </span>
                {
                    hasChildren && (
                        <IconButton
                            size="small"
                            onClick={() => onExpandRow(data, getAllRowNodeDatas())}
                            style={{ color: "blue" }}
                        >
                            <i className="fa fa-angle-down" />
                        </IconButton>
                    )
                }
                {
                    (draftItem && (
                        <IconButton
                            size="small"
                            onClick={() => onDeleteItem(data.uuid || data.itemUuid, getAllRowNodes(), gridAPI)}
                            style={{ color: "red" }}
                        >
                            <i className="fa fa-trash" />
                        </IconButton>
                    ))
                }
                {
                    (!matchRole && spectifyCase) ? null : (
                        <IconButton
                            size="small"
                            onClick={() => {
                                onAddChildItem(
                                    data,
                                    getAllRowNodeDatas(),
                                    gridAPI
                                );
                            }}
                            style={{ color: "#AEC57D" }}
                        >
                            <i className="fa fa-plus-circle" />
                        </IconButton>
                    )
                }
            </>
        );
    };

    const UOMCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {
                    (value != null && typeof value === "object") ? value.uomName : value
                }
            </span>
        );
    };
    const pickExistingRowNode = (conditionId, value) => {
        let result = null;
        gridAPI?.dwrItem?.forEachNode((rowNode) => {
            if (rowNode && rowNode.data && rowNode.data[conditionId] === value) {
                result = rowNode;
            }
        });
        return result;
    };

    const onChangeRetention = (params) => {
        const setAllChild = (node, retention) => {
            if (!node.childrenAfterSort || !node.childrenAfterSort.length) return null;
            return node.childrenAfterSort.map((item) => {
                item.setDataValue("retention", retention);
                setAllChild(item, retention);
            });
        };
        const { data, node } = params;
        const retention = !data.retention;
        node.setDataValue("retention", retention);
        if (node.childrenAfterSort) {
            setAllChild(node, retention);
        }
    };

    const buildSubmitInfo = (addChangeI) => {
        // return;
        const addChange = _.cloneDeep(addChangeI);
        const editNodeList = _.cloneDeep(submitInfoRef?.current?.editNodeList);
        const listProcess = editNodeList;
        addChange.map((item) => {
            const findIndex = listProcess.findIndex((itemEdit) => getGroupNumber(itemEdit) === getGroupNumber(item));
            if (findIndex === -1) {
                listProcess.push(item);
            } else {
                listProcess[findIndex] = item;
            }
        });

        listProcess.map((item) => {
            item.uom = formatUom(item.uom);
            item.groupNumber = getGroupNumber(item);
            return item;
        });
        setChangedSubmitInfo((prevStates) => ({
            ...prevStates,
            editNodeList: listProcess
        }));
    };

    const onChangeCertify = (params, type, checked) => {
        const addChange = [];
        if (type === "all") {
            getAllRowNodes().forEach((item) => {
                item.data.certify = checked;
                if (checked) {
                    item.data.cumulativeActualCertifiedQty = item.data.cumulativeActualClaimedQty;
                    item.data.cumulativeActualCertifiedPercentage = item.data.cumulativeActualClaimedPercentage;
                }
                addChange.push(item.data);
            });
            params.api.applyTransaction({ update: addChange });
            buildSubmitInfo(addChange);
            return;
        }
        const setAllChild = (node, certify, addChangeI) => {
            if (!node.childrenAfterSort || !node.childrenAfterSort.length) return null;
            return node.childrenAfterSort.map((item) => {
                item.data.certify = certify;
                if (certify) {
                    item.data.cumulativeActualCertifiedQty = item.data.cumulativeActualClaimedQty;
                    item.data.cumulativeActualCertifiedPercentage = item.data.cumulativeActualClaimedPercentage;
                }
                addChangeI.push(item.data);
                setAllChild(item, certify, addChangeI);
            });
        };
        const { data, node } = params;
        const certify = !data.certify;
        data.certify = certify;
        if (certify) {
            data.cumulativeActualCertifiedQty = data.cumulativeActualClaimedQty;
            data.cumulativeActualCertifiedPercentage = data.cumulativeActualClaimedPercentage;
        }
        addChange.push(data);
        if (node.childrenAfterSort) {
            setAllChild(node, certify, addChange);
        }
        params.api.applyTransaction({ update: addChange });
        getAllRowNodes().forEach((item) => onCellValueChanged(item));
        buildSubmitInfo(addChange);
    };

    const HaveRetentionRenderer = (params) => {
        const { data } = params;
        const editable = params?.colDef?.editable && typeof params?.colDef?.editable === "function" ? params?.colDef?.editable(params) : false;
        return (
            <Checkbox
                name="retention"
                disabled={!editable}
                checked={data.retention}
                onChange={() => onChangeRetention(params)}
            />
        );
    };

    const HaveCertifyRenderer = (params) => {
        const { data } = params;
        const editable = params?.colDef?.editable && typeof params?.colDef?.editable === "function" ? params?.colDef?.editable(params) : false;
        return (
            <Checkbox
                disabled={!editable}
                name="certify"
                checked={data.certify}
                onChange={() => onChangeCertify(params)}
            />
        );
    };
    const HaveCertifyHeaderRenderer = (params) => {
        const { displayName } = params;
        const checked = getAllRowNodeDatas().some((item) => !item.certify);
        return (
            <>
                <Checkbox
                    className="mr-3"
                    name="certifyAll"
                    checked={!checked}
                    onChange={() => { onChangeCertify(params, "all", !!checked); }}
                />
                {displayName}
            </>
        );
    };
    const handleExport = () => {
        gridAPI.originalItem.exportDataAsCsv({
            fileName: CSVTemplate.WorkSpace_File_Name,
            allColumns: true
            // processCellCallback: (cell) =>
            // // if (cell.column?.colId === "updatedOn") {
            // //     return formatDateString(
            // //         cell.value,
            // //         CUSTOM_CONSTANTS.DDMMYYYHHmmss
            // //     );
            // // }
            // {
            //     return cell.value;
            // }

        });
    };

    const buttonRef = useRef();

    // Upload
    const handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef?.current) {
            buttonRef?.current.open(e);
        }
    };
    const handleOnUploadError = (err) => {
        // message = err;
        console.log("error", err);
    };
    const handleOnUploadDrop = (csvData) => {
        function convertDataToWorkbook(data) {
            /* convert data to binary string */
            var data = new Uint8Array(data);
            const arr = new Array();

            for (let i = 0; i !== data.length; ++i) {
                arr[i] = String.fromCharCode(data[i]);
            }

            const bstr = arr.join("");
            console.log(bstr);
        }
        convertDataToWorkbook(csvData);
    };

    const cellValueChanged = (params) => {
        const nodeData = getAllRowNodeDatas();
        onChangeOriginalOrder(getTotalBindingAmount());
        const editNodeList = _.clone(changedSubmitInfo.editNodeList);
        const createNodes = _.clone(changedSubmitInfo.createNodes);
        const dataRow = _.clone(params.data);
        let listProcess = params.data.draftItem ? createNodes : editNodeList;
        if (!listProcess.find((itemEdit) => getGroupNumber(itemEdit) === getGroupNumber(dataRow))) {
            listProcess.push(dataRow);
        } else {
            listProcess = listProcess.map((item) => {
                if (getGroupNumber(item) === getGroupNumber(dataRow)) item = dataRow;
                return item;
            });
        }
        listProcess.map((item) => {
            item.uom = formatUom(item.uom);
            item.groupNumber = getGroupNumber(item);
            return item;
        });
        const stateListSet = {};
        if (params.data.draftItem) stateListSet.createNodes = listProcess;
        else stateListSet.editNodeList = listProcess;
        setChangedSubmitInfo((prevStates) => ({
            ...prevStates,
            ...stateListSet
        }));

        const rowNodes = getAllRowNodes();
        gridAPI?.originalItem?.refreshCells({ rowNodes });
        onCellValueChanged(params.data, nodeData);
    };

    return (
        <>
            <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>{subHeader || t("Main Quantity Surveyor & Architect")}</Typography>
                    <Row className="mb-2">
                        <Col xs={6}>
                            <Table className="mb-0 table-small-height" bordered responsive>
                                <thead>
                                    <tr>
                                        <td>{t("SelectMainQuantitySurveyor")}</td>
                                        <td>{t("SelectedMainQuantitySurveyor")}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <MultiSelect
                                                name="quantitySurveyors"
                                                className="form-control"
                                                options={users.map((user) => ({
                                                    name: user.name,
                                                    value: user.uuid
                                                }))}
                                                objectName="Users"
                                                setFieldValue={setFieldValue}
                                                defaultValue={values.quantitySurveyors}
                                                disabled
                                                displaySelected={false}
                                            />
                                        </td>
                                        <td>
                                            {
                                                (values.quantitySurveyors
                                                    && values.quantitySurveyors.length > 0)
                                                && (
                                                    values.quantitySurveyors
                                                        .map((surveyor) => (
                                                            <div key={surveyor.uuid}>
                                                                {surveyor.name}
                                                                {" "}
                                                            </div>
                                                        ))
                                                )
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                                <thead>
                                    <tr>
                                        <td>{t("SelectArchitect")}</td>
                                        <td>{t("SelectedArchitect")}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <MultiSelect
                                                name="architects"
                                                className="form-control"
                                                options={users.map((user) => ({
                                                    name: user.name,
                                                    value: user.uuid
                                                }))}
                                                objectName="Architect"
                                                setFieldValue={setFieldValue}
                                                defaultValue={values.architects}
                                                disabled
                                                displaySelected={false}
                                            />
                                        </td>
                                        <td>
                                            {
                                                (
                                                    values.architects
                                                    && values.architects.length > 0
                                                ) && (
                                                    values.architects.map((architect) => (
                                                        <div key={architect.uuid}>
                                                            {architect.name}
                                                        </div>
                                                    ))
                                                )
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    <Typography component="span" style={{ width: "100%" }}>{t("Summary")}</Typography>
                    <Row className="mb-4">
                        <Col xs={12}>
                            <AgGridTable
                                sizeColumnsToFit
                                columnDefs={originalSummary}
                                rowData={rowDataWorkSpaceRootLevel}
                                pagination={false}
                                singleClickEdit
                                stopEditingWhenCellsLoseFocus
                                gridHeight={250}
                                onGridReady={(params) => onGridReady("summary", params, true)}
                                frameworkComponents={{
                                    uomCellRenderer: UOMCellRenderer,
                                    evaluatorCellRenderer: EvaluatorCellRenderer,
                                    evaluatorSelectedCellRenderer: EvaluatorSelectedCellRenderer
                                }}
                                enableCellChangeFlash
                                suppressCellFlash
                                suppressExcelExport
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <ButtonToolbar className="justify-content-end">
                                <Button
                                    color="primary"
                                    onClick={handleExport}
                                    className="mr-1"
                                >
                                    <i className="fa fa-download mr-2" />
                                    <span>{t("Download CSV")}</span>
                                </Button>
                                <CSVReader
                                    ref={buttonRef}
                                    onFileLoad={handleOnUploadDrop}
                                    onError={handleOnUploadError}
                                    noClick
                                    noDrag
                                >
                                    {() => (
                                        <ButtonSpinner
                                            text={t("Upload.csv")}
                                            icon="fa fa-upload"
                                            className="mr-1"
                                            onclick={handleOpenDialog}
                                        />
                                    )}
                                </CSVReader>
                            </ButtonToolbar>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <AgGridTable
                                // getRowNodeId={(data) => getGroupNumber(data)}
                                defaultColDef={{
                                    flex: 1,
                                    enableValue: true,
                                    enableRowGroup: true,
                                    filter: true,
                                    sortable: true,
                                    resizable: true,
                                    tooltipComponent: "customTooltip"
                                }}
                                sizeColumnsToFit
                                columnDefs={originalOrder}
                                rowData={[]}
                                pagination={false}
                                singleClickEdit={false}
                                stopEditingWhenCellsLoseFocus
                                gridHeight={700}
                                onGridReady={(params) => onGridReady("originalItem", params)}
                                animateRows
                                groupDefaultExpanded={-1}
                                getDataPath={(data) => data.groupNumber}
                                enableCellChangeFlash
                                onRowDataChanged={onRowDataChanged}
                                onRowDataUpdated={onRowDataChanged}
                                onCellValueChanged={cellValueChanged}
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                                treeData
                                frameworkComponents={{
                                    groupCellRenderer: GroupCellRenderer,
                                    haveRetentionRenderer: HaveRetentionRenderer,
                                    haveCertifyRenderer: HaveCertifyRenderer,
                                    haveCertifyHeaderRenderer: HaveCertifyHeaderRenderer,
                                    customTooltip: CustomTooltip
                                }}
                                autoGroupColumnDef={{
                                    headerName: t("Group"),
                                    minWidth: 300,
                                    cellRendererParams: {
                                        suppressCount: true,
                                        innerRenderer: "groupCellRenderer"
                                    }
                                }}
                            />
                        </Col>
                    </Row>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

export default OriginalOrder;
