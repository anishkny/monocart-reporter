
import { components } from 'vine-ui';
import { Grid } from 'turbogrid';
import Util from '../util/util.js';
import formatters from './formatters.js';
import store from '../util/store.js';
const { VuiTooltip } = components;

export default {

    computed: {
        dataChange() {
            return [
                this.caseType,
                this.suiteVisible,
                this.stepVisible
            ];
        }
    },

    watch: {
        keywords: function() {
            this.hideFlyover();
            if (this.grid) {
                this.grid.update();
            }
        },
        dataChange: function() {
            this.hideFlyover();
            store.set('suiteVisible', this.suiteVisible);
            store.set('stepVisible', this.stepVisible);
            if (this.grid) {
                const gridData = this.getGridData();
                this.grid.setData(gridData);
                this.grid.render();
            }
        }
    },

    methods: {

        createGrid() {
            const grid = new Grid('.prg-grid');
            this.grid = grid;
            this.bindGridEvents();

            let rowNumber = 1;

            grid.setOption({
                selectMultiple: false,
                bindWindowResize: true,
                scrollbarFade: true,
                scrollbarRound: true,
                collapseAllVisible: false,
                rowNumberVisible: true,
                rowNumberFilter: (rowItem) => {
                    if (rowItem.type === 'case') {
                        return rowNumber++;
                    }
                },
                rowNotFound: 'No Results',
                frozenColumn: 1,
                columnTypes: {
                    title: 'tree'
                },
                rowFilter: (rowItem) => {
                    if (!this.keywords) {
                        return true;
                    }
                    const arr = this.keywords.toLowerCase().split(/\s+/g);
                    const name = (`${rowItem.title}`).toLowerCase();
                    for (const item of arr) {
                        if (item && name.indexOf(item) !== -1) {
                            return true;
                        }
                    }
                    return false;
                }
            });
            grid.setFormatter(formatters);
            const data = this.getGridData();
            grid.setData(data);
            grid.render();
        },

        isNodeTruncated(node) {
            if (!node) {
                return false;
            }
            node = node.querySelector('.tg-tree-name') || node;
            if (node.clientWidth < node.scrollWidth) {
                return true;
            }
            return false;
        },

        bindGridEvents() {

            const grid = this.grid;

            grid.bind('onCellMouseOver', (e, d) => {
                const cellNode = d.cellNode;
                if (this.isNodeTruncated(cellNode)) {
                    this.showTooltip(cellNode, cellNode.innerText);
                }
            }).bind('onCellMouseOut', (e, d) => {
                this.hideTooltip();
            });

            grid.bind('onClick', (e, d) => {
                if (!d.rowNode) {
                    return;
                }
                const rowItem = d.rowItem;
                grid.setRowSelected(rowItem);

                const columnItem = d.columnItem;

                const target = d.e.target;
                if (target.classList.contains('tg-case-num')) {
                    this.showFlyover(rowItem, columnItem.id);
                    return;
                }

                if (rowItem.type === 'case' && columnItem.id === 'title') {
                    this.showFlyover(rowItem);
                    return;
                }

                this.hideFlyover();

            });

            grid.bind('onDblClick', (e, d) => {
                if (!d.rowNode) {
                    return;
                }
                const rowItem = d.rowItem;
                if (rowItem.type === 'case') {
                    this.showFlyover(rowItem);
                } else {
                    this.hideFlyover();
                }
            });
        },

        getGridData() {
            const key = [this.caseType, this.suiteVisible, this.stepVisible].join('_');
            if (this.gridDataMap[key]) {
                return this.gridDataMap[key];
            }
            //console.log(key);
            const allData = JSON.parse(JSON.stringify(this.gridDataAll));
            const data = this.getGridDataByType(allData, this.caseType, this.suiteVisible, this.stepVisible);
            console.log(key, data);
            this.gridDataMap[key] = data;
            return data;
        },

        getGridDataByType(allData, caseType, suiteVisible, stepVisible) {

            allData.rows = this.getFilteredRows(allData.rows, caseType);

            if (!suiteVisible) {
                const list = [];
                Util.forEachTree(allData.rows, function(item) {
                    if (item.type === 'case') {
                        list.push(item);
                    }
                });
                allData.rows = list;
            }

            if (!stepVisible) {
                Util.forEachTree(allData.rows, function(item) {
                    if (item.type === 'case') {
                        delete item.subs;
                    }
                });
            }

            return allData;

        },

        getFilteredRows(rows, caseType) {

            if (caseType === 'all') {
                return rows;
            }

            rows = rows.filter((it) => {
                if (it.type === 'case' && it.caseType !== caseType) {
                    return false;
                }
                return true;
            });
            rows.forEach((item) => {
                if (item.subs) {
                    const subs = this.getFilteredRows(item.subs, caseType);
                    if (subs.length) {
                        item.subs = subs;
                        return;
                    }
                    delete item.subs;
                }
            });

            rows = rows.filter((it) => {
                if (it.type === 'suite' && !it.subs) {
                    return false;
                }
                return true;
            });

            return rows;

        },

        getCaseErrorMessage(rowItem) {

            const errors = rowItem.errors;
            if (!errors) {
                return;
            }

            const errList = [`<b>${rowItem.title}</b>`];

            errors.forEach((item) => {
                if (item.message) {
                    errList.push(item.message);
                }
                if (item.stack) {
                    errList.push(Util.CH(item.stack));
                }
            });

            const errorMsg = errList.join('</div><div>');

            return `<div>${errorMsg}</div>`;
        },

        getCaseLogMessage(rowItem) {
            const logs = rowItem.logs;
            if (!logs) {
                return;
            }
            const logList = [`<b>${rowItem.title}</b>`];

            logs.forEach((item) => {
                logList.push(Util.CH(item));
            });

            const logMsg = logList.join('</div><div>');

            return `<div>${logMsg}</div>`;

        },

        showFlyover(rowItem, position) {
            this.$refs.detail.update(rowItem, position);
            this.flyoverVisible = true;
        },

        hideFlyover() {
            this.flyoverVisible = false;
        },

        hideTooltip: function() {
            if (this.tooltip) {
                this.tooltip.unmount();
                this.tooltip = null;
            }
        },

        showTooltip: function(elem, message) {

            this.hideTooltip();

            if (!message) {
                return;
            }

            this.tooltip = VuiTooltip.createComponent({
                target: elem,
                maxWidth: 500,
                html: message
            });

        }
    }
};
