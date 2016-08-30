/**
 * @authors       Peter 王斐
 * @email         wangfeia@zbj.com
 * @date          2016-08-30 13:40
 * @description
 */

define(["./editor/index", "./editor/panel",], function (require, exports, module) {

    var EditorPanelDs = require("./editor/index");

    window.Panel=require("./editor/panel");

    var editorPanelDs = new EditorPanelDs({
        editorSelector: {
            html: "#html-editor",
            css: "#css-editor",
            js: "#js-editor"
        },
        showID: "show",
        defaultContent: {
            body: "<div>tttttttttttt</div>",
            script: "var a='a';" +
            "var b='b';" +
            "console.log(a,b);"
        }
    });

});