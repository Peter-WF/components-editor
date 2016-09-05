/**
 * @authors       Peter 王斐
 * @email         wangfeia@zbj.com
 * @date          2016-08-30 19:20
 * @description
 */

define(['./panel'], function (require, exports, module) {

    var Panel = require("./panel");

    /**
     * 编辑器面板构造函数
     * @param ops  Object
     * @constructor
     */
    function EditPanel(ops) {
        if (!ops || !ops.mode) {
            throw new Error("请输入对应的option")
        }

        var __default = {
            theme: "monokai",
            lineNumbers: true,//是否显示行号
            lineWrapping: false, //是否强制换行
            highlightLine: true,
            extraKeys: {"Ctrl": "autocomplete"}// Ctrl 显示 auto complete
        };

        this.ops = $.extend(__default, ops);

        this.initPanel();

        this.initCodeMirror();
    }

    /**
     * 初始化 Panel
     */
    EditPanel.prototype.initPanel = function () {
        new Panel({
            "selector": this.ops.editorSelector
        });
    };

    /**
     * 初始化 CodeMirror
     */
    EditPanel.prototype.initCodeMirror = function () {
        var textArea = $(this.ops.editorSelector).find("textarea")[0];

        this.editor = CodeMirror.fromTextArea(textArea, this.ops);
    };

    /**
     * 清空编辑器，并往上填写输入的内容
     * @param str   输入的内容
     */
    EditPanel.prototype.write = function (str) {
        // this.clear();
        this.editor.setValue(str);

        // 格式化
        var totalLines = this.editor.lineCount();
        this.editor.autoFormatRange({line: 0, ch: 0}, {line: totalLines})
    };

    /**
     * 清空编辑器
     */
    EditPanel.prototype.clear = function () {
        this.editor.doc.remove();
        // this.editor.removeLines();
    };

    /**
     * 获取编辑器中的内容
     * @returns String 编辑器中的内容
     */
    EditPanel.prototype.getContent = function () {
        return this.editor.getValue();
    };

    EditPanel.prototype.onchange = function (func) {
        this.editor.on("change", func);
    };

    module.exports = EditPanel;
});