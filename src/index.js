/**
 * @authors       Peter 王斐
 * @email         wangfeia@zbj.com
 * @date          2016-08-30 13:40
 * @description
 */

define(["./editor/index", "./editor/panel", "./ProxyConsole/ProxyConsole"], function (require, exports, module) {

    var EditorPanelDs = require("./editor/index");

    // 抛到全局 便于执行 Panel.togglePanel
    window.Panel = require("./editor/panel");

    // 存储内部代理 console
    var ProxyConsole = require("./ProxyConsole/ProxyConsole")
    window._console = new ProxyConsole({
        clearBtnSelector: "#clear-console"
    });

    // 初始化编辑器
    var editorPanelDs = new EditorPanelDs({
        panelList: {
            html: {
                selector: "#html-editor",
                autoDisplay: true
            },
            css: {
                selector: "#css-editor",
                autoDisplay: false
            },
            js: {
                selector: "#js-editor",
                autoDisplay: false
            },
            console: {
                selector: "#console-panel",
                autoDisplay: false
            },
            output: {
                selector: "#output-panel",
                autoDisplay: true
            },
        },
        showID: "show",
        delay: 2000,
        defaultContent: {
            body: "<div>tttttttttttt</div>",
            script: "var a='a';\n" +
            "var b='b';\n" +
            "console.log(a,b);"
        }
    });


    // Create the sandbox:
    window.sandbox = new Sandbox.View({
        el: $('#console-panel'),
        model: new Sandbox.Model({
            iframe: $("#show")[0]
        })
    });


    // 绑定切换按钮
    $("body").on("click", "#control-panels .button", function () {
        var $selectObj = $(arguments[0].target);
        var panelId = $selectObj.attr("href");

        $selectObj.toggleClass("active");

        Panel.togglePanel(panelId);
    });
});