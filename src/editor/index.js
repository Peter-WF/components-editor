/**
 * @authors       Peter 王斐
 * @email         wangfeia@zbj.com
 * @date          2016-08-23 15:16
 * @description   EditorPanel 集合
 */
define(['./editor-panel', './panel'], function (require, exports, module) {

    var EditorPanel = require("./editor-panel");

    var Panel = require("./panel");

    //静态常量
    var PATH = "./lib/";
    //各个框架所需要的js css
    var STATICS = {
        'default': {
            statics_css: [],
            statics_js: [],
            global_js: [
                // 由于 IE 下会在 doc.write 时默认执行 script 内部 js , 因此这里需要提前给 window.console 赋值, 而不是在 innerIframe.js 中操作
                "<script>window.console=parent._console;</script>",
                // 同理给 console 赋值。用于关闭innerWindow默认的报错
                "<script>window.onerror = function () {console.error(arguments[4]?arguments[4].stack:arguments[0]+'\\n'+arguments[1]+'：'+arguments[2]);return true;};</script>",
                "<script src='./src/ie-hack/ie-hack.js'></script>",
                "<script src='./src/innerIframe.js'></script>"
            ]
        },
        // TODO 一期不打算开放 react es6
        // 'react': {
        //     statics_css: [],
        //     statics_js: [
        //         "<script src='" + PATH + "react/react.js'></script>",
        //         "<script src='" + PATH + "react/react-dom.js'></script>",
        //         "<script src='" + PATH + "react/browser.min.js'></script>"
        //     ],
        //     global_js: []
        // },
        // 'es6': {
        //     statics_css: [],
        //     statics_js: [
        //         "<script src='" + PATH + "react/browser.min.js'></script>"
        //     ],
        //     global_js: []
        // }
    };
    var BASE_TPL = "<!DOCTYPE html> \n" +
        "<html lang='zh-Hans'>\n" +
        "<head>\n" +
        "<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />\n" +
        "<title>示例展示</title>\n" +
        "{{header}}\n" +
        "{{style}}\n" +
        "</head>\n<body>\n" +
        "{{body}}\n" +
        "{{footer}}\n" +
        "{{script}}\n" +
        "</body>\n</html>\n";

    /**
     * 编辑器构造函数
     * @return {[type]} [description]
     */
    function EditorPanelDs(ops) {
        if (!ops || !ops.editorSelector || !ops.showID) {
            throw new Error("请在构造参数中传入editorSelector和showID的值");
        }
        if (!ops.btn) {
            ops.autorun = true;
        }

        //默认的初始化属性值
        var _default = {
            autorun: false,
            delay: 5000,
            defaultContent: {
                framework: "default",
                style: "",
                script: "",
                body: "\n"
            }
        };
        ops = $.extend(true, _default, ops);
        this.$show = $("#" + ops.showID);
        this.__init(ops);
    }

    /**
     * 初始化函数
     * @param ops 相关设置
     * @private
     */
    EditorPanelDs.prototype.__init = function (ops) {
        var _this = this;
        //1.初始化html,css,js编辑器
        this.htmlEditor = new EditorPanel($.extend({}, ops, {
            editorSelector: ops.editorSelector.html,
            mode: "text/html",
            syntax: "html", // define Zen Coding syntax
            profile: "html", // define Zen Coding output profile
        }));
        this.cssEditor = new EditorPanel($.extend({}, ops, {
            editorSelector: ops.editorSelector.css,
            mode: "text/css"
        }));
        this.jsEditor = new EditorPanel($.extend({}, ops, {
            editorSelector: ops.editorSelector.js,
            mode: "javascript"
        }));

        // 初始化 jsconsole
        this.consolePanel = new Panel({
            "selector": "#console-panel"
        });

        // 初始化 outputPanel
        this.outputPanel = new Panel({
            "selector": "#output-panel"
        });

        Panel.resizePanel();

        this.editors = [this.htmlEditor, this.cssEditor, this.jsEditor];

        //2.将默认格式写入
        this.__defaultContent = ops.defaultContent;
        this.__writeDefault();

        //3.绑定编辑器中的代码触发方式
        if (ops.autorun) {	//默认绑定onchange
            this.__autoRun();
        } else {				//如果在ops中传入了btn属性，那么就把代码的运行绑定在btn的click事件上
            this.__runBy(ops.btn);
        }

        // 设置延迟
        this.delay = ops.delay;

        // //5.运行代码
        // //为了解决css二次write不加载问题
        // this.$show.on("load", function () {
        //     _this.writeContentToIframe();
        // })

        this.run();
    };

    /**
     * 向编辑器中写入内容
     * @param  {String} str [要写入的代码字符串]
     * @param type String 编辑器类型
     */
    EditorPanelDs.prototype.write = function (str, type) {
        switch (type) {
            case 'html' :
                this.htmlEditor.write(str);
                break;
            case 'css' :
                this.cssEditor.write(str);
                break;
            case 'js' :
                this.jsEditor.write(str);
                break;
        }
    };

    /**
     * 将每个数组中的内容写入对应的panel
     * @private
     */
    EditorPanelDs.prototype.__write = function () {
        this.htmlEditor.write(this.__bodyArray.join(""));
        this.cssEditor.write(this.__styleArray.join(""));
        this.jsEditor.write(this.__scriptArray.join(""));
    };

    EditorPanelDs.prototype.clear = function () {
        this.editors.forEach(function (e) {
            e.clear();
        });
    };

    /**
     * 向编辑器中写入默认的结构内容
     * @private
     */
    EditorPanelDs.prototype.__writeDefault = function () {
        this.__base = BASE_TPL;

        this.__headerArray = [];
        this.__bodyArray = [];
        this.__footerArray = [];
        this.__styleArray = [];
        this.__scriptArray = [];

        this.addTo(this.__headerArray, true, this.getStatics(this.__defaultContent.framework, "statics_css"));	//添加静态资源css部分
        this.addTo(this.__headerArray, true, this.getStatics(this.__defaultContent.framework, "global_js"));	//添加静态资源全局 js 部分
        this.addTo(this.__bodyArray, true, this.__defaultContent.body);				//添加<body>内容
        this.addTo(this.__footerArray, true, this.getStatics(this.__defaultContent.framework, "statics_js"));	//添加静态资源js
        this.addTo(this.__styleArray, true, this.__defaultContent.style);
        this.addTo(this.__scriptArray, true, this.__defaultContent.script);
        // this.__replaceAll();

        this.__write();
    };

    /**
     * 向header数组中push
     * @param array 要进行添加操作的数组
     * @param clear 是否将将
     * @private
     */
    EditorPanelDs.prototype.addTo = function (array, clear) {
        var args = Array.prototype.slice.call(arguments, 2);
        if (clear) {
            array.splice(0, array.length);
        }
        for (var i = 0; i < args.length; i++) {
            array.push(args[i]);
        }
    };


    /**
     * 填充基础模板的所有预留内容
     * @private
     * return String
     */
    EditorPanelDs.prototype.__replaceAll = function () {
        var result;
        result = this.__replaceHeader(this.__base);
        result = this.__replaceBody(result);
        result = this.__replaceStyle(result);
        result = this.__replaceScript(result);
        return this.__replaceFooter(result);
    };

    EditorPanelDs.prototype.__replaceHeader = function (str) {
        return str.replace(/\{\{header\}\}/, this.__headerArray.join(""));
    };

    EditorPanelDs.prototype.__replaceBody = function (str) {
        return str.replace(/\{\{body\}\}/, this.__bodyArray.join(""));
    };

    EditorPanelDs.prototype.__replaceFooter = function (str) {
        return str.replace(/\{\{footer\}\}/, this.__footerArray.join(""));
    };

    EditorPanelDs.prototype.__replaceStyle = function (str) {
        var part1 = "<style>\n",
            part2 = "\n</style>\n";
        var content = part1 + this.__styleArray.join("") + part2;
        return str.replace(/\{\{style\}\}/, content);
    };

    EditorPanelDs.prototype.__replaceScript = function (str) {
        var part1 = "",
            part2 = "\n</script>\n";
        if (this.__defaultContent.framework == "react") {
            part1 = "<script type='text/babel'>\n";
        } else {
            part1 = "<script type='text/javascript'>\n";
        }
        var content = part1 + this.__scriptArray.join("") + part2;
        return str.replace(/\{\{script\}\}/, content);
    };

    /**
     * 获取指定框架的静态资源
     * @param framework
     * @param type    statics_css|statics_js
     * @returns {*}
     */
    EditorPanelDs.prototype.getStatics = function (framework, type) {
        return STATICS[framework][type].join("\n");
    };

    /**
     * 将编辑器中的内容输入到iframe中，即运行编辑器中的内容
     */
    EditorPanelDs.prototype.run = function () {
        var _this = this;
        if (this.timer)    window.clearTimeout(this.timer);
        this.timer = window.setTimeout(function () {
            // console.log("run");
            _this.$show.attr("src", "_blank.html?t=" + (+new Date));	//
            _this.writeContentToIframe();
        }, 500);
    };

    /**
     * 将editor中的内容输出到iframe
     */
    EditorPanelDs.prototype.writeContentToIframe = function () {
        var dc = this.$show[0].contentDocument || this.$show[0].contentWindow.document;

        this.addTo(this.__bodyArray, true, this.htmlEditor.getContent());
        this.addTo(this.__styleArray, true, this.cssEditor.getContent());
        this.addTo(this.__scriptArray, true, this.jsEditor.getContent());
        //实际是将字符串中的内容输出到iframe
        var output = this.__replaceAll();
        dc.write(output);
        dc.close();
    };

    /**
     * 根据编辑器中的代码改变，自动运行代码
     */
    EditorPanelDs.prototype.__autoRun = function () {
        var _this = this;
        this.editors.forEach(function (EditorPanel) {
            EditorPanel.onchange(_.debounce(function (Editor, changes) {
                _this.run();
            }, this.delay));
        });
    };

    /**
     * 将编辑器中代码的执行绑定到传入的dom选择器的click事件上
     * @param selector String 要绑定click事件的dom的选择器
     */
    EditorPanelDs.prototype.__runBy = function (selector) {
        var _this = this;
        $(selector).on("click", function () {
            _this.run();
        });
    };
    return EditorPanelDs;

});


