### 主讲人：缪靖森

### 供应商考核系统合并单元格表格组件

### 2023-03-23


### 需求
供应商考核系统中存在考核模板显示合并单元格样式的表格需求，且可进行编辑、新增大条目、新增小条目，删除大条目和删除小条目等操作，都需要进行实时的合并单元格效果，且后期需要兼容WMS三系统，因此将该合并表格做成组件化的方式

### 功能理解
在供应商考核系统中，需要对供应商进行考核，考核所用的模板为合并单元格的表格样式，表头分为考核内容（大条目）、项目、考核要点、考核评分、操作等，分为可操作和仅查看两种表格样式，其中考核内容在可操作模式下有删除大条目的功能，操作在可操作模式下有新增小条目、删除小条目的功能，在仅查看模式下隐藏删除大条目按钮和操作列，且可自定义单元格内容


### 学习心得
1、适当的组件化可以极大提高复用开发的效率，做到一次开发，终生复用
1、代码目前还有性能上的优化方案，下个版本预计会测试发布，优化无止境

### Code

```html
<div class="merge-table-container">
    <el-table
            ref="mergeTable"
            :key="reloadCount"
            :data="tableData"
            :span-method="mergeCols"
            border
            :fit="isFit"
            :max-height="tableHeight"
            @row-click="onRowClick"
            @selection-change="onSelectionChange"
            :row-class-name="onMouseHoverRowClassName"
            @cell-mouse-enter="onMouseHoverRow"
            @cell-mouse-leave="onMouseLeaveRow">
        <el-table-column v-if="isShowSelection" type="selection" width="50"/>
        <el-table-column v-if="isShowIndex" type="index" label="序号" width="50"/>
        <template v-for="mergeColumn in mergeColumnList">
            <!--无需合并的列信息-->
            <el-table-column
                    v-if="mergeColumn.type === 'label' && !mergeColumn.children"
                    :key="mergeColumn.prop"
                    :prop="mergeColumn.prop"
                    :align="mergeColumn.align"
                    :label="mergeColumn.label"
                    :min-width="mergeColumn.width"
                    :formatter="mergeColumn.formatter"
                    :show-overflow-tooltip="mergeColumn.showOverflowTooltip"
            />
            <!--需合并的列信息-->
            <el-table-column
                    v-else-if="!mergeColumn.type && mergeColumn.children"
                    :key="mergeColumn.label"
                    :align="mergeColumn.align"
                    :label="mergeColumn.label"
                    :width="mergeColumn.width"
            >
                <template v-for="child in mergeColumn.children">
                    <el-table-column
                            :key="child.prop"
                            :prop="child.prop"
                            :align="child.align"
                            :label="child.label"
                            :width="child.width"
                            :show-overflow-tooltip="child.showOverflowTooltip"
                    />
                </template>
            </el-table-column>
            <!--自定义的列信息-->
            <el-table-column
                    v-else-if="mergeColumn.type !== 'label'"
                    :key="mergeColumn.prop"
                    :prop="mergeColumn.prop"
                    :align="mergeColumn.align"
                    :label="mergeColumn.label"
                    :width="mergeColumn.width"
            >
                <template slot-scope="scope">
                    <el-input
                            :class="mergeColumn.align === 'center' ? 'text-center' : ''"
                            v-if="mergeColumn.type === 'text' && (!mergeColumn.max || mergeColumn.max < 80)"
                            v-model.trim="scope.row[mergeColumn.prop]"
                            :disabled="mergeColumn.disabled"
                            placeholder="请输入"
                            :minlength="mergeColumn.min"
                            :maxlength="mergeColumn.max"
                            @blur="setMergeColumnValue(mergeColumn, scope.row)"/>
                    <el-input
                            type="textarea"
                            ref="mergeTableTextarea"
                            v-if="mergeColumn.type === 'text' && mergeColumn.max && mergeColumn.max > 80"
                            v-model.trim="scope.row[mergeColumn.prop]"
                            :autosize="{ minRows: 1 }"
                            :disabled="mergeColumn.disabled"
                            placeholder="请输入"
                            :minlength="mergeColumn.min"
                            :maxlength="mergeColumn.max"
                            resize="none"
                    />
                    <el-input
                            :class="mergeColumn.align === 'center' ? 'text-center' : ''"
                            type="number"
                            v-if="mergeColumn.type === 'number'"
                            v-model.trim="scope.row[mergeColumn.prop]"
                            :disabled="mergeColumn.disabled"
                            placeholder="请输入"
                            :min="mergeColumn.min"
                            :max="mergeColumn.max"
                            @blur="validateMergeTableCellNumber({
                                value: scope.row[mergeColumn.prop],
                                row: scope.row,
                                min: mergeColumn.min,
                                max: mergeColumn.max,
                                rules: mergeColumn.rules,
                                change: mergeColumn.change
                              })"
                            @mousewheel.native.prevent
                    />
                    <div class="merge-table-row-buttons" v-if="mergeColumns.some(item => item.name === mergeColumn.prop)">
                          <span class="merge-table-row-button merge-table-row-button__delete el-icon-delete"
                                :title="`删除${mergeColumn.label}`"
                                @click.stop="deleteLine(scope)"
                          ></span>
                    </div>
                    <div class="merge-table-buttons" v-if="mergeColumn.buttons && isEditable">
                            <img v-if="mergeColumn.buttons.includes('add')"
                                    class="merge-table-button"
                                    src="@/assets/package/add-icon.png"
                                    title="添加"
                                    @click.stop="addRow(scope)"
                            />
                        <span v-if="mergeColumn.buttons.includes('delete')"
                                class="merge-table-button merge-table-button__delete el-icon-delete"
                                title="删除"
                                @click.stop="deleteRow(scope)"
                        ></span>
                    </div>
                </template>
            </el-table-column>
        </template>
    </el-table>
    <div class="add-line" v-if="isEditable">
        <el-button type="text" icon="el-icon-plus" @click="addLine">{{ addLineText }}</el-button>
    </div>
</div>
```

```js
export default {
    name: 'mergeTable',
    data() {
        return {
            mergeColumnList: [],
            tableMergeData: {},
            multipleSelection: [],
            mergeCount: 1,
            reloadCount: 0,
            hoverRowIndex: -1
        }
    },
    props: {
        tableHeight: {
            type: String,
            default: 'auto'
        },
        // 表头数据
        columnList: {
            required: true,
            type: Array
        },
        // 表格数据
        tableData: {
            type: Array,
            default: []
        },
        // 是否显示勾选框
        isShowSelection: {
            type: Boolean,
            default: false
        },
        // 是否显示序号
        isShowIndex: {
            type: Boolean,
            default: false
        },
        // 是否开启表格编辑功能
        isEditable: {
            type: Boolean,
            default: true
        },
        // 添加一行显示文本
        addLineText: {
            type: String,
            default: '添加一行'
        },
        // 合并表头数据
        mergeColumns: {
            type: Array,
            default: []
        },
        // 列的宽度是否自适应
        isFit: {
            type: Boolean,
            default: true
        },
        // 表格数据为空时，是否默认增加一行空数据
        isEmptyOne: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        tableData: {
            handler (newValue) {
                if(!newValue.length) {
                    // 操作表格内容为空时，重置状态
                    this.mergeCount = 1;
                }
                this.$nextTick(() => {
                    this.calcReloadCount();
                });
            }
        }
    },
    created() {
        // 若表格出现了选择框，则合并单元格的index += 1
        if (this.isShowSelection) {
            this.mergeColumns.forEach(item => item.index += 1);
        }
        // 若表格出现了序号，则合并单元格的index += 1
        if (this.isShowIndex) {
            this.mergeColumns.forEach(item => item.index += 1);
        }
        this.calcReloadCount();
    },
    activated() {
        this.calcReloadCount();
    },
    mounted() {
        this.mergeColumnList = [ ...this.columnList ];
        // 处理初始数据
        if (this.tableData.length) {
            // 编辑：加上需要合并单元格的标识
            for(let i = 0; i < this.tableData.length; i++) {
                for(let j = 0; j < this.mergeColumns.length; j++) {
                    if(i === 0) {
                        this.tableData[i]['mergeCount'] = this.mergeCount;
                        break;
                    }
                    if(this.tableData[i][this.mergeColumns[j].name] === this.tableData[i - 1][this.mergeColumns[j].name]) {
                        this.tableData[i]['mergeCount'] = this.mergeCount;
                    } else {
                        this.tableData[i]['mergeCount'] = ++this.mergeCount;
                    }
                }
            }
        } else {
            // 新增：初始化数据，若isEmptyOne为true，数据最少有一条
            if(this.isEmptyOne) {
                let rowData = {
                    mergeCount: this.mergeCount
                };
                this.mergeColumnList.forEach(item => {
                    if (item.prop) rowData[item.prop] = '';
                })
                this.tableData.push({ ...rowData });
            }
        }
        this.generateMergeTable();
    },
    methods: {
        onRowClick(row) {
            if(this.$listeners['onRowClick']) this.$emit('onRowClick', row);
        },
        onSelectionChange(val) {
            this.multipleSelection = val;
        },
        mergeCols({ rowIndex, columnIndex }) {
            const key = `${rowIndex}-${columnIndex}`;
            if(this.tableMergeData[key]) {
                return this.tableMergeData[key];
            }
        },
        generateMergeTable() {
            // 遍历表格中所有需要合并的行列单元格
            for(let i = 0; i < this.tableData.length; i++) {
                for(let j = 0; j < this.mergeColumns.length; j++) {
                    // 初始化行、列坐标
                    let rowIndex = 1;
                    let columnIndex = 1;
                    // 比较纵坐标下方元素
                    if(rowIndex > 0) {
                        rowIndex = this.getMergeTableRowIndex({ index: i, count: 1 });
                    }
                    // 比较纵坐标上方的第一个元素
                    if(i > 0 && this.tableData[i].mergeCount === this.tableData[i - 1].mergeCount) {
                        rowIndex = 0;
                    }
                    const key = `${i}-${this.mergeColumns[j].index}`;
                    this.tableMergeData[key] = [rowIndex, columnIndex];
                    this.$set(this.tableMergeData, key, [rowIndex, columnIndex]);
                }
            }
        },
        getMergeTableRowIndex({index, count}) {
            if (index + 1 < this.tableData.length && this.tableData[index].mergeCount === this.tableData[index + 1].mergeCount) {
                return this.getMergeTableRowIndex({ index: ++index, count: ++count });
            }
            return count;
        },
        getMergeTableColumnIndex({index, count}) {
            if (index + 1 < this.mergeColumns.length && this.tableData[this.mergeColumns[index].name] === this.tableData[this.mergeColumns[index + 1].name]) {
                return this.getMergeTableColumnIndex({ index: ++index, count: ++count });
            }
            return count;
        },
        deleteLine(scope) {
            const _mergeCount = scope.row.mergeCount;
            for (let i = 0; i < this.tableData.length; i++) {
                if (this.tableData[i].mergeCount === _mergeCount) {
                    this.tableData.splice(i, 1);
                    --i;
                }
            }
            this.generateMergeTable();
        },
        addRow(scope) {
            const index = scope.$index + 1;
            const row = scope.row;
            let _row = {};
            Object.keys(row).forEach(key => {
                if(this.mergeColumns.findIndex(item => item.name === key) > -1 || key === 'mergeCount') {
                    _row[key] = row[key];
                } else {
                    _row[key] = '';
                }
            });
            this.tableData.splice(index, 0, { ..._row });
            this.$set(this.tableData, index, { ..._row });
            this.generateMergeTable();
        },
        deleteRow(scope) {
            this.tableData.splice(scope.$index, 1);
            this.generateMergeTable();
        },
        addLine() {
            let _row = {};
            this.mergeColumnList.forEach(item => {
                if(item.prop) {
                    _row[item.prop] = '';
                }
            });
            _row['mergeCount'] = ++this.mergeCount;
            this.tableData.push(_row);
            this.$set(this.tableData, this.tableData.length - 1, { ..._row });
            this.generateMergeTable();
        },
        validateMergeTableCellNumber({ value, row, min, max, rules, change}) {
            let isRulePassed = true;
            if (rules && rules.length) {
                rules.forEach(item => {
                    if (!item.pattern.test(value)) {
                        isRulePassed = false;
                        return this.$message.error(item.message);
                    }
                })
            }
            if (isRulePassed) {
                if (value < min) {
                    this.$message.error(`请输入不小于${min}的数字`);
                }
                if (value > max) {
                    this.$message.error(`请输入不大于${max}的数字`);
                }
                if (change) {
                    change.call(this, value, row);
                }
            }
        },
        setMergeColumnValue(column, row) {
            // 为所有相同mergeCount的行的同一单元格赋相同的值
            const includeItem = this.mergeColumns.find(item => item.name === column.prop);
            if(includeItem) {
                this.tableData.forEach((item, index) => {
                    if(item.mergeCount === row.mergeCount) {
                        this.tableData[index][includeItem.name] = row[includeItem.name];
                    }
                });
            }
        },
        onMouseHoverRow (row, column, cell, event) {
            this.tableData.forEach(item => {
                if (row.mergeCount === item.mergeCount) {
                    this.hoverRowIndex = row.mergeCount
                }
            })
        },
        onMouseHoverRowClassName ({row, rowIndex}) {
            let r = -1
            if (this.hoverRowIndex === row.mergeCount) {
                r = rowIndex
            }
            if (rowIndex === r) {
                return 'hover-row'
            }
        },
        onMouseLeaveRow () {
            this.hoverRowIndex = -1
        },
        calcReloadCount() {
            let beforeScrollTop;
            if(this.$refs.mergeTable) {
                // 记录滚动条刷新前的位置
                beforeScrollTop = this.$refs.mergeTable.$el.querySelector('div.el-table__body-wrapper').scrollTop;
            }
            this.reloadCount = Math.random();
            if(beforeScrollTop) {
                // 将滚动条还原位置
                this.$nextTick(() => {
                    this.$refs.mergeTable.$el.querySelector('div.el-table__body-wrapper').scrollTop = beforeScrollTop + 70;
                });
            }
        }
    }
}
```
