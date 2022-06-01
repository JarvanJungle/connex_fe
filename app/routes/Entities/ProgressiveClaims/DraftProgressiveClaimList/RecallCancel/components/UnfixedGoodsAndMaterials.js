import React, {
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import IconButton from "@material-ui/core/IconButton";
import { Checkbox } from "primereact/checkbox";
import { AgGridTable } from "routes/components";
import { v4 as uuidv4 } from "uuid";
import {
    convertDate2String
} from "helper/utilities";
import _ from "lodash";
import {
    Button,
    ButtonToolbar,
    Col,
    Row
} from "../../../../../../components";
import {
    DPC_STATUS,
    unfixedGroup,
    unfixedSummary,
    unfixedGroupHistory
} from "../../Helper";
import EntityServices from "../../../../../../services/EntitiesService";
import useToast from "../../../../../hooks/useToast";
import CUSTOM_CONSTANTS from "../../../../../../helper/constantsDefined";

const editableFields = {
    workCode: {
        canEdit: true,
        justDraftEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    description: {
        canEdit: true,
        justDraftEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    uom: {
        canEdit: true,
        justDraftEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    deliveryOrder: {
        canEdit: true,
        justDraftEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    deliveryOrderDate: {
        canEdit: true,
        justDraftEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    attachment: {
        canEdit: true,
        justDraftEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    mainConClaimQty: {
        canEdit: true,
        justDraftEdit: true,
        onlyChildEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    mainConClaimUnitPrice: {
        canEdit: true,
        justDraftEdit: true,
        onlyChildEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    mainConClaimRemarks: {
        canEdit: true,
        justDraftEdit: true,
        onlyChildEdit: true,
        canEditStatus: [DPC_STATUS.CREATED]
    },
    retention: {
        canEdit: true,
        canEditStatus: [
            DPC_STATUS.CREATED,
            DPC_STATUS.PENDING_VALUATION,
            DPC_STATUS.PENDING_SUBMISSION
        ]
    },
    certify: {
        canEdit: true,
        canEditStatus: [
            DPC_STATUS.PENDING_VALUATION,
            DPC_STATUS.PENDING_SUBMISSION
        ],
        showOnStatus: [DPC_STATUS.PENDING_VALUATION, DPC_STATUS.PENDING_SUBMISSION],
        editaleOnlySide: ["BUYER"],
        disabledKey: "isCertified"
    },
    cetifiedQty: {
        canEdit: true,
        canEditStatus: [
            DPC_STATUS.PENDING_VALUATION,
            DPC_STATUS.PENDING_SUBMISSION
        ],
        editaleOnlySide: ["BUYER"],
        disabledKey: "isCertified"
    },
    cetifiedUnitPrice: {
        canEdit: true,
        canEditStatus: [
            DPC_STATUS.PENDING_VALUATION,
            DPC_STATUS.PENDING_SUBMISSION
        ],
        editaleOnlySide: ["BUYER"],
        disabledKey: "isCertified"
    },
    cetifiedRemarks: {
        canEdit: false,
        showOnStatus: [DPC_STATUS.CREATED]
    },
    totalCumulativeBalance: {
        canEdit: false,
        showOnStatus: [DPC_STATUS.PENDING_VALUATION, DPC_STATUS.PENDING_SUBMISSION]
    }
};

const editableHistoryFields = {
    description: {
        canEdit: true,
        canEditStatus: [
            DPC_STATUS.PENDING_VALUATION,
            DPC_STATUS.PENDING_SUBMISSION
        ],
        editaleOnlySide: ["BUYER"],
        justDraftEdit: true
    },
    qtyInstalled: {
        canEdit: true,
        canEditStatus: [
            DPC_STATUS.PENDING_VALUATION,
            DPC_STATUS.PENDING_SUBMISSION
        ],
        editaleOnlySide: ["BUYER"],
        justDraftEdit: true
    },
    attachment: {
        canEdit: true,
        canEditStatus: [
            DPC_STATUS.PENDING_VALUATION,
            DPC_STATUS.PENDING_SUBMISSION
        ],
        editaleOnlySide: ["BUYER"],
        justDraftEdit: true
    }
};

const editableSummaryFields = {
    retentionPercentage: {
        canEdit: true,
        canEditStatus: [
            DPC_STATUS.PENDING_VALUATION,
            DPC_STATUS.PENDING_SUBMISSION
        ],
        editaleOnlySide: ["BUYER"]
    }
};

const getDatePicker = () => {
    function Datepicker() {
    }

    Datepicker.prototype.init = function (params) {
        this.eInput = document.createElement("input");
        this.eInput.setAttribute("type", "date");
        this.eInput.classList.add("form-control");
        this.eInput.style.cssText = "height: 42px";
        this.cell = params.eGridCell;
        this.oldWidth = this.cell.style.width;
        this.cell.style.width = "200px";
        this.cell.style.height = "42px";
        this.eInput.value = params.value;
    };
    Datepicker.prototype.getGui = function () {
        return this.eInput;
    };
    Datepicker.prototype.afterGuiAttached = function () {
        this.eInput.focus();
        this.eInput.select();
    };
    Datepicker.prototype.getValue = function () {
        this.cell.style.width = this.oldWidth;
        return this.eInput.value;
    };
    Datepicker.prototype.destroy = function () {
    };
    Datepicker.prototype.isPopup = function () {
        return false;
    };

    return Datepicker;
};

const UnfixedGoodsAndMaterials = (props) => {
    const {
        t,
        rowData,
        onAddItemManual,
        onDeleteItem,
        onAddChildItem,
        uoms,
        onAddAttachment,
        onDeleteAttachment,
        refCb,
        values,
        draftDetail,
        onChangeUnfixedGoods,
        onlyShowDownload = false,
        isBuyer
    } = props;

    const [gridAPI, setGridApi] = useState({
        summary: null,
        items: null,
        histories: null
    });

    const [columnApi, setColumnApi] = useState({
        summary: null,
        items: null
    });
    const showToast = useToast();
    const [changedSubmitInfo, setChangedSubmitInfo] = useState({
        addUnfixedItems: [],
        createUnfixedItems: [],
        editUnfixedItems: [],
        removeUnfixedItems: [],
        rootUnfixedItems: [],
        unfixedClaimsHistory: []
    });
    const submitInfoRef = useRef(changedSubmitInfo);
    const rowDataWorkSpaceRootLevel = rowData.filter((x) => x.groupNumber.length === 1)
        .map((item) => {
            item.quantitySurveyors = values.quantitySurveyors;
            return item;
        });
    const [unfixedHistoryList, setUnfixedHistoryList] = useState(
        rowData.reduce((prev, item) => {
            if (item.unfixedClaimsHistory && item.unfixedClaimsHistory.length) {
                const unfixed = item.unfixedClaimsHistory.map((itemHistory) => {
                    const unfixedHistory = itemHistory;
                    unfixedHistory.ufgmUuid = item.ufgmUuid;
                    unfixedHistory.groupNumber = item.groupNumber.at(-1);
                    if (!unfixedHistory.unitPrice) {
                        unfixedHistory.unitPrice = item.cetifiedUnitPrice;
                    }
                    return unfixedHistory;
                });
                prev = [...prev, ...unfixed];
            }
            return prev;
        }, [])
    );

    const editableCheck = (params, settings) => {
        const side = isBuyer ? "BUYER" : "SUPPLIER";
        const editAbleSettings = settings || editableFields;
        if (
            params
        && params.colDef
        && editAbleSettings[params.colDef.field]
        && editAbleSettings[params.colDef.field].canEdit
        ) {
            if (editAbleSettings[params.colDef.field].onlyChildEdit) {
                if (params.node.allChildrenCount || params.data.hasChildren) {
                    if (params.node.data.mainConClaimQty) {
                        params.node.setDataValue("mainConClaimQty", null);
                        params.node.setDataValue("mainConClaimTotalAmount", null);
                    }
                    if (params.node.data.mainConClaimUnitPrice) {
                        params.node.setDataValue("mainConClaimUnitPrice", null);
                    }
                    return false;
                }
            }
            if (editAbleSettings[params.colDef.field].justDraftEdit) {
                if (!params.data.draftItem) {
                    return false;
                }
            }
            if (
                !editAbleSettings[params.colDef.field].canEditStatus.includes(
                    draftDetail?.dpcStatus
                )
            ) {
                return false;
            }
            if (
                editAbleSettings[params.colDef.field].disabledKey
          && params.data[editAbleSettings[params.colDef.field].disabledKey]
            ) {
                return false;
            }
            if (editAbleSettings[params.colDef.field].editaleOnlySide) {
                if (
                    !editAbleSettings[params.colDef.field].editaleOnlySide.includes(side)
                ) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    const editableFunc = (isStyle, settings) => {
        if (isStyle) {
            return (params) => {
                if (editableCheck(params, settings)) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    };
                }
                return {};
            };
        }
        return (params) => {
            if (editableCheck(params, settings)) {
                return true;
            }
            return false;
        };
    };

    const visibleFunc = (field) => {
        if (editableFields[field]?.showOnStatus) {
            return editableFields[field]?.showOnStatus.includes(
                draftDetail?.dpcStatus
            );
        }

        return true;
    };

    const processAssignEditableCheck = (colDefs, settings) => {
        for (let i = 0; i < colDefs.length; i++) {
            colDefs[i].editable = editableFunc(false, settings);
            colDefs[i].cellStyle = editableFunc(true, settings);
            if (!visibleFunc(colDefs[i].field, draftDetail)) {
                columnApi.items?.setColumnVisible(colDefs[i].field, false);
            }
            if (colDefs[i].children) {
                processAssignEditableCheck(colDefs[i].children, settings);
            }
        }
    };

    const getAllRowNodeDatas = () => {
        const nodeData = [];
        gridAPI?.items?.forEachNode((node) => nodeData.push(node.data));
        return nodeData;
    };

    const getAllRowHistoryNodes = () => {
        const nodeData = [];
        gridAPI?.histories?.forEachNode((node) => nodeData.push(node));
        return nodeData;
    };

    const getAllRowNodes = () => {
        const nodeData = [];
        gridAPI?.items?.forEachNode((node) => nodeData.push(node));
        return nodeData;
    };

    const getTotalBindingAmount = () => {
        const rowNodes = getAllRowNodes();
        let cumulativeClaimedUnfixedTotalAmount = 0;
        let cumulativeCertifiedUnfixedTotalAmount = 0;
        const cumulativeBalanceWorkDone = 0;
        if (rowNodes && rowNodes.length > 0) {
            rowNodes.forEach((item) => {
                const {
                    level,
                    aggData,
                    data: {
                        mainConClaimTotalAmount = 0,
                        mainConClaimQty = 0,
                        mainConClaimUnitPrice = 0,
                        cetifiedQty = 0,
                        cetifiedTotalAmount = 0,
                        cetifiedUnitPrice = 0
                    }
                } = item;
                if (level === 0) {
                    cumulativeClaimedUnfixedTotalAmount += (aggData?.mainConClaimTotalAmount || (mainConClaimQty * mainConClaimUnitPrice) || mainConClaimTotalAmount || 0);
                    cumulativeCertifiedUnfixedTotalAmount += (aggData?.cetifiedTotalAmount || (cetifiedQty * cetifiedUnitPrice) || cetifiedTotalAmount || 0);
                }
            });
        }
        return {
            cumulativeClaimedUnfixedTotalAmount,
            cumulativeCertifiedUnfixedTotalAmount,
            cumulativeBalanceWorkDone
        };
    };

    const onGridReady = (gridApiName, params, columnFit = false) => {
        if (columnFit) {
            params.api.sizeColumnsToFit();
        }

        gridAPI[gridApiName] = params.api;
        columnApi[gridApiName] = params.columnApi;
        setGridApi(gridAPI);
        setColumnApi(columnApi);
    };

    const getGroupNumber = (item) => (Array.isArray(item.groupNumber)
        ? item.groupNumber.at(-1)
        : item.groupNumber);

    const calculateBalance = () => {
        const certifiedQtyAll = {};
        getAllRowHistoryNodes().map((itemMap) => {
            const item = itemMap.data;
            const parent = getAllRowNodeDatas().find(
                (row) => getGroupNumber(row) === getGroupNumber(item)
            );
            if (parent) {
                const { cetifiedQty = 0 } = parent;
                if (!certifiedQtyAll[getGroupNumber(item)]) {
                    certifiedQtyAll[getGroupNumber(item)] = cetifiedQty;
                }
                const balanceToInstall = certifiedQtyAll[getGroupNumber(item)] - item.qtyInstalled;
                if (item.balanceToInstall !== balanceToInstall) {
                    itemMap.setDataValue("balanceToInstall", balanceToInstall);
                }
                certifiedQtyAll[getGroupNumber(item)] -= item.qtyInstalled;
            }
            return item;
        });
    };

    const EvaluatorCellRenderer = (params) => {
        const { value } = params;
        let nameText = "";
        if (value?.length) {
            nameText = `${value.length} Users Selected`;
        }
        return (
            <span>
                {nameText}
            </span>
        );
    };

    const SelectedEvaluatorRenderer = (params) => {
        const { value = [] } = params;
        let nameText = "";
        value?.forEach((item, i) => {
            nameText += item.name + (value.length - 1 === i ? "" : ", ");
        });
        return <span>{nameText}</span>;
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

    const onAddCertified = async (parentNode) => {
        const item = {
            ufgmUuid: parentNode.ufgmUuid,
            unfixedClaimDate: convertDate2String(
                new Date(),
                CUSTOM_CONSTANTS.DDMMYYYHHmmss
            ),
            description: null,
            attachment: null,
            qtyInstalled: null,
            balanceToInstall: null,
            unitPrice: parentNode.cetifiedUnitPrice,
            toRelease: null,
            totalCumulativeBalance: null,
            draftItem: true,
            groupNumber: parentNode.groupNumber.at(-1),
            uuid: uuidv4()
        };
        gridAPI?.histories?.applyTransaction({
            add: [item],
            addIndex: null
        });
        setUnfixedHistoryList((prevStates) => ([
            ...prevStates,
            item
        ]));
    };

    const GroupCellRenderer = (params) => {
        const {
            data
        } = params;
        if (data?.groupNumber) {
            const {
                groupNumber,
                quantity,
                unitPrice,
                draftItem,
                isCertified
            } = data;
            const value = groupNumber.at(-1);
            return (
                <>
                    <span>
                        {value}
                  &nbsp;
                    </span>
                    {draftItem && (
                        <IconButton
                            size="small"
                            onClick={() => {
                                const editNodeList = [
                                    ...submitInfoRef?.current?.editUnfixedItems
                                ];
                                const createNodes = [
                                    ...submitInfoRef?.current?.createUnfixedItems
                                ];
                                let listProcess = data.draftItem
                                    ? createNodes
                                    : editNodeList;
                                listProcess = listProcess.filter(
                                    (item) => item.ufgmUuid !== data.ufgmUuid
                                );
                                const stateListSet = {};
                                if (params.data.draftItem) {
                                    stateListSet.createUnfixedItems = listProcess;
                                } else {
                                    stateListSet.editUnfixedItems = listProcess;
                                }
                                setChangedSubmitInfo((prevStates) => ({
                                    ...prevStates,
                                    ...stateListSet
                                }));
                                onDeleteItem(
                                    data.uuid || data.ufgmUuid,
                                    getAllRowNodes(),
                                    gridAPI
                                );
                                onChangeUnfixedGoods(getTotalBindingAmount());
                            }}
                            style={{ color: "red" }}
                        >
                            <i className="fa fa-trash" />
                        </IconButton>
                    )}
                    {!quantity
                    && !unitPrice
                    && !isBuyer && ![
                        DPC_STATUS.PENDING_VALUATION,
                        DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION,
                        DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION,
                        DPC_STATUS.CONVERTED_TO_OFFICIAL_CLAIMS
                    ].includes(draftDetail?.dpcStatus)
                    && (
                        <IconButton
                            size="small"
                            onClick={() => onAddChildItem(data, getAllRowNodeDatas(), gridAPI)}
                            style={{ color: "#AEC57D" }}
                        >
                            <i className="fa fa-plus-circle" />
                        </IconButton>
                    )}
                    {
                        ((isBuyer && isCertified)) && (
                            <IconButton
                                size="small"
                                onClick={() => onAddCertified(data)}
                                style={{ color: "#AEC57D" }}
                            >
                                <i className="fa fa-plus-circle" />
                            </IconButton>
                        )
                    }
                </>
            );
        }

        return "";
    };

    const HaveRetentionRenderer = (params) => {
        const { data } = params;
        const editable = params?.colDef?.editable
        && typeof params?.colDef?.editable === "function"
            ? params?.colDef?.editable(params)
            : false;
        return (
            <Checkbox
                name="retention"
                disabled={!editable}
                checked={data.retention}
                onChange={() => onChangeRetention(params)}
            />
        );
    };

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

    const onRowDataChanged = () => {
        onChangeUnfixedGoods(getTotalBindingAmount());
        if (gridAPI.items) {
            const colDefs = gridAPI.items.getColumnDefs();
            processAssignEditableCheck(colDefs);
            if (uoms.length) {
                addUomsList(colDefs, uoms);
            }
            gridAPI.items.setColumnDefs(colDefs);
            gridAPI.items.expandAll();
        }
        setChangedSubmitInfo((prevStates) => ({
            ...prevStates,
            rootUnfixedItems: rowDataWorkSpaceRootLevel.map((item) => item.ufgmUuid)
        }));
    };

    const onRowDataHistoryChanged = () => {
        if (gridAPI.histories) {
            const colDefs = gridAPI.histories.getColumnDefs();
            processAssignEditableCheck(colDefs, editableHistoryFields);
            gridAPI.histories.setColumnDefs(colDefs);
            calculateBalance();
        }
        setChangedSubmitInfo((prevStates) => ({
            ...prevStates,
            unfixedClaimsHistory: unfixedHistoryList
        }));
    };

    const onRowDataSummaryChanged = () => {
        if (gridAPI.summary) {
            const colDefs = gridAPI.summary.getColumnDefs();
            processAssignEditableCheck(colDefs, editableSummaryFields);
            gridAPI.summary.setColumnDefs(colDefs);
        }
    };

    const cellValueChanged = (params) => {
        onChangeUnfixedGoods(getTotalBindingAmount());
        const editNodeList = _.clone(changedSubmitInfo.editUnfixedItems);
        const createNodes = _.clone(changedSubmitInfo.createUnfixedItems);
        const dataRow = _.clone(params.data);
        let listProcess = params.data.draftItem ? createNodes : editNodeList;
        if (
            !listProcess.find(
                (itemEdit) => getGroupNumber(itemEdit) === getGroupNumber(dataRow)
            )
        ) {
            listProcess.push(dataRow);
        } else {
            listProcess = listProcess.map((item) => {
                if (getGroupNumber(item) === getGroupNumber(dataRow)) { item = dataRow; }
                return item;
            });
        }
        listProcess.map((item) => {
            const draft = item;
            draft.groupNumber = getGroupNumber(item);
            return draft;
        });
        const stateListSet = {};
        if (params.data.draftItem) stateListSet.createUnfixedItems = listProcess;
        else stateListSet.editUnfixedItems = listProcess;
        setChangedSubmitInfo((prevStates) => ({
            ...prevStates,
            ...stateListSet
        }));
        const rowNodes = getAllRowNodes();
        gridAPI?.items?.refreshCells({ rowNodes });
        gridAPI?.summary?.setRowData(rowDataWorkSpaceRootLevel);
    };

    const cellValueHistoryChanged = (params) => {
        calculateBalance();
        const tmpHistoryList = unfixedHistoryList.map((item) => {
            let unfixedItem = item;
            if (item.uuid === params.data.uuid) {
                unfixedItem = { ...params.data };
            }
            return unfixedItem;
        });
        setUnfixedHistoryList(tmpHistoryList);
        setChangedSubmitInfo((prevStates) => ({
            ...prevStates,
            unfixedClaimsHistory: tmpHistoryList
        }));
    };

    const downLoadFile = async (data) => {
        try {
            const response = await EntityServices.downloadDocuments("purchase-service/documents", data.guid);
            const responseData = response.data.data;
            if (response.data.status === "OK") {
                window.open(responseData);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const AddAttachment = (params) => {
        const fileInput = useRef(null);
        const {
            data
        } = params;
        const rowNode = getAllRowNodeDatas();
        return (
            <>
                {(!data.attachment && [DPC_STATUS.CREATED].includes(data?.dpcStatus)) ? (
                    <>
                        <input
                            ref={fileInput}
                            onChange={(e) => onAddAttachment(e, data.uuid, rowNode)}
                            type="file"
                            style={{ display: "none" }}
                        />
                        <Button
                            onClick={() => fileInput.current.click()}
                            style={{
                                border: "1px solid #7b7b7b7b",
                                padding: "2px 8px",
                                background: "#fff"
                            }}
                            className="text-secondary"
                        >
                            {t("ChooseFile")}
                        </Button>
                    </>
                ) : (
                    <Row className="w-100 mx-0 align-items-center justify-content-between">
                        <div
                            style={{
                                border: "unset",
                                background: "transparent",
                                textDecoration: "underline",
                                color: "#4472C4",
                                cursor: "pointer"
                            }}
                            onClick={() => downLoadFile(data)}
                        >
                            {data.isNew ? data.attachment : data.fileLabel}
                        </div>
                        {data.draftItem && (
                            <>
                                <IconButton
                                    size="small"
                                    onClick={() => onDeleteAttachment(data.uuid, rowNode, params)}
                                    style={{ color: "red" }}
                                >
                                    <i className="fa fa-trash" />
                                </IconButton>
                            </>
                        )}
                    </Row>
                )}
            </>
        );
    };

    const formatUom = (uom) => {
        if (uom && typeof uom === "object") {
            uom = { ...uom };
            uom = uom.uomCode;
        }
        return uom;
    };

    const buildSubmitInfo = (addChangeI) => {
        const addChange = _.cloneDeep(addChangeI);
        const editNodeList = _.cloneDeep(submitInfoRef?.current?.editUnfixedItems);
        const listProcess = editNodeList;
        const addChangeIndex = addChange.map((e) => getGroupNumber(e));
        addChange.map((item) => {
            const findItem = listProcess.find((itemEdit) => getGroupNumber(itemEdit) === getGroupNumber(item));
            if (!findItem) {
                listProcess.push(item);
            } else {
                listProcess[addChangeIndex.indexOf(getGroupNumber(findItem))] = item;
            }
        });

        listProcess.map((item) => {
            item.uom = formatUom(item.uom);
            item.groupNumber = getGroupNumber(item);
            return item;
        });
        setChangedSubmitInfo((prevStates) => ({
            ...prevStates,
            editUnfixedItems: listProcess
        }));
    };

    const onChangeCertify = (params, type, checked) => {
        const addChange = [];
        if (type === "all") {
            getAllRowNodes().forEach((item) => {
                item.data.certify = checked;
                if (checked) {
                    item.data.cetifiedQty = item.data.mainConClaimQty;
                    item.data.cetifiedUnitPrice = item.data.mainConClaimUnitPrice;
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
                    item.data.cetifiedQty = item.data.mainConClaimQty;
                    item.data.cetifiedUnitPrice = item.data.mainConClaimUnitPrice;
                }
                addChangeI.push(item.data);
                setAllChild(item, certify, addChangeI);
            });
        };
        const { data, node } = params;
        const certify = !data.certify;
        data.certify = certify;
        if (certify) {
            data.cetifiedQty = data.mainConClaimQty;
            data.cetifiedUnitPrice = data.mainConClaimUnitPrice;
        }
        addChange.push(data);
        if (node.childrenAfterSort) {
            setAllChild(node, certify, addChange);
        }
        params.api.applyTransaction({ update: addChange });
        buildSubmitInfo(addChange);
    };

    const HaveCertifyRenderer = (params) => {
        const { data } = params;

        return (
            <Checkbox
                name="certify"
                checked={data.certify}
                onChange={() => onChangeCertify(params)}
            />
        );
    };

    const HaveCertifyHeaderRenderer = (params) => {
        const { displayName } = params;
        const [checked, setChecked] = useState(false);
        return (
            <>
                <Checkbox
                    className="mr-3"
                    name="certifyAll"
                    checked={checked}
                    onChange={() => { setChecked(!checked); onChangeCertify(params, "all", !checked); }}
                />
                {displayName}
            </>
        );
    };

    useImperativeHandle(refCb, () => ({
        getSubmitUnfixedData() {
            return changedSubmitInfo;
        },
        getUnfixedHistoryData() {
            return unfixedHistoryList;
        }
    }));

    useEffect(() => {
        submitInfoRef.current = changedSubmitInfo;
    }, [changedSubmitInfo]);

    return (
        <>
            <Accordion style={{ borderTop: "8px solid" }} defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{t("WorkSpace")}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>
                        {t("Summary")}
                    </Typography>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <AgGridTable
                                sizeColumnsToFit
                                columnDefs={unfixedSummary}
                                rowData={rowDataWorkSpaceRootLevel}
                                pagination={false}
                                singleClickEdit
                                stopEditingWhenCellsLoseFocus
                                gridHeight={250}
                                onGridReady={(params) => onGridReady("summary", params, true)}
                                enableCellChangeFlash
                                suppressCellFlash
                                suppressExcelExport
                                onRowDataChanged={onRowDataSummaryChanged}
                                onRowDataUpdated={onRowDataSummaryChanged}
                                onFirstDataRendered={() => onRowDataSummaryChanged()}
                                onCellValueChanged={cellValueChanged}
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                                frameworkComponents={{
                                    evaluatorCellRenderer: EvaluatorCellRenderer,
                                    SelectedEvaluatorRenderer
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <ButtonToolbar className="justify-content-end">
                                <Button color="primary" className="mr-1">
                                    <i className="fa fa-download mr-2" />
                                    <span>{t("Download CSV")}</span>
                                </Button>
                                {!onlyShowDownload
                                    && (values.dpcStatus === DPC_STATUS.CREATED) && (
                                    <>
                                        <Button color="primary" className="mr-1">
                                            <i className="fa fa-download mr-2" />
                                            <span>{t("Upload CSV")}</span>
                                        </Button>
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                onAddItemManual(gridAPI, getAllRowNodeDatas());
                                            }}
                                            className="mr-1"
                                        >
                                            <i className="fa fa-plus mr-2" />
                                            <span>{t("Add New")}</span>
                                        </Button>
                                    </>
                                )}
                            </ButtonToolbar>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <AgGridTable
                                defaultColDef={{
                                    flex: 1,
                                    enableValue: true,
                                    enableRowGroup: true,
                                    filter: true,
                                    sortable: true,
                                    resizable: true
                                }}
                                sizeColumnsToFit
                                columnDefs={unfixedGroup}
                                rowData={rowData}
                                pagination={false}
                                singleClickEdit={false}
                                stopEditingWhenCellsLoseFocus
                                gridHeight={400}
                                onGridReady={(params) => onGridReady("items", params)}
                                animateRows
                                groupDefaultExpanded={-1}
                                getDataPath={(data) => data.groupNumber}
                                enableCellChangeFlash
                                onRowDataChanged={onRowDataChanged}
                                onRowDataUpdated={onRowDataChanged}
                                onFirstDataRendered={() => onRowDataChanged()}
                                onCellValueChanged={cellValueChanged}
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                                treeData
                                frameworkComponents={{
                                    groupCellRenderer: GroupCellRenderer,
                                    haveRetentionRenderer: HaveRetentionRenderer,
                                    addAttachment: AddAttachment,
                                    haveCertifyRenderer: HaveCertifyRenderer,
                                    haveCertifyHeaderRenderer: HaveCertifyHeaderRenderer
                                }}
                                autoGroupColumnDef={{
                                    headerName: t("Group"),
                                    minWidth: 300,
                                    cellRendererParams: {
                                        suppressCount: true,
                                        innerRenderer: "groupCellRenderer"
                                    }
                                }}
                                components={{ datePicker: getDatePicker() }}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <AgGridTable
                                defaultColDef={{
                                    flex: 1,
                                    enableValue: true,
                                    enableRowGroup: true,
                                    filter: true,
                                    sortable: true,
                                    resizable: true
                                }}
                                sizeColumnsToFit
                                columnDefs={unfixedGroupHistory}
                                rowData={unfixedHistoryList}
                                pagination={false}
                                singleClickEdit={false}
                                stopEditingWhenCellsLoseFocus
                                gridHeight={300}
                                onGridReady={(params) => onGridReady("histories", params)}
                                animateRows
                                groupDefaultExpanded={-1}
                                enableCellChangeFlash
                                onRowDataChanged={onRowDataHistoryChanged}
                                onRowDataUpdated={onRowDataHistoryChanged}
                                onFirstDataRendered={() => onRowDataHistoryChanged()}
                                onCellValueChanged={cellValueHistoryChanged}
                                onComponentStateChanged={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                                frameworkComponents={{
                                    groupCellRenderer: GroupCellRenderer,
                                    addAttachment: AddAttachment
                                }}
                                components={{ datePicker: getDatePicker() }}
                            />
                        </Col>
                    </Row>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

export default UnfixedGoodsAndMaterials;
