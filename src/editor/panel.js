/**
 * @authors       Peter 王斐
 * @email         wangfeia@zbj.com
 * @date          2016-08-30 19:20
 * @description
 */

define([], function (require, exports, module) {
    /**
     * base 面板构造函数
     * @param ops  Object 参数
     * @constructor
     */
    function Panel(ops) {

        if (!ops || !ops.selector) {
            throw new Error("请输入对应的option")
        }

        var __default = {};

        this.ops = $.extend(__default, ops);

        this.initPanel();
    }

    Panel.prototype.initPanel = function () {
        var $panelWrapper = $(this.ops.selector);
        var $splitter = $panelWrapper.is("#html-editor") ? $() : $panelWrapper.splitter().data('splitter');

        // panel 存储自己以及自己对应的 $splitter
        $panelWrapper.data("panel", {
            $el: $panelWrapper,
            splitter: $splitter
        });
        // this.resizePanel();
    };

    Panel.resizePanel = function () {
        var $editorContainer = $('#editor-container');
        var visible = $editorContainer.find('.panelwrapper:visible');
        var width = 100 / visible.length;
        var height = 0;
        var innerW = $(window).width() - (visible.length - 1);// to compensate for border-left
        var innerH = $editorContainer.outerHeight();
        var left = 0;
        var right = 0;
        var top = 0;
        var panel;
        var nestedPanels = [];
        $('body').addClass('panelsVisible');

        // visible = visible.sort(function (a, b) {
        //   return a.order < b.order ? -1 : 1;
        // });

        for (var i = 0; i < visible.length; i++) {
            panel = $.data(visible[i], 'panel');
            right = 100 - (width * (i + 1));
            panel.$el.css({top: 0, bottom: 0, left: left + '%', right: right + '%'});
            panel.splitter.trigger('init', innerW * left / 100);
            panel.splitter[i == 0 ? 'hide' : 'show']();
            left += width;

            nestedPanels = $(visible[i]).find('.panel');
            if (nestedPanels.length > 1) {
                top = 0;
                nestedPanels = nestedPanels.filter(':visible');
                height = 100 / nestedPanels.length;
                nestedPanels.each(function (i) {
                    bottom = 100 - (height * (i + 1));
                    var panel = jsbin.panels.panels[$.data(this, 'name')];
                    // $(this).css({ top: top + '%', bottom: bottom + '%' });
                    $(this).css('top', top + '%');
                    $(this).css('bottom', bottom + '%');
                    if (panel.splitter.hasClass('vertical')) {
                        panel.splitter.trigger('init', innerH * top / 100);
                        panel.splitter[i == 0 ? 'hide' : 'show']();
                    }
                    top += height;
                });
            }
        }
    };

    /**
     * 用于控制当前 Panel 显示隐藏
     * @param panelSelector     panel 选择器
     */
    Panel.togglePanel = function (panelSelector) {

        var $hidePanel = $(panelSelector);

        $hidePanel.toggle();

        // 显示/隐藏需要隐藏 $splitter , 需要读取存储在对象中的 $splitter
        var splitter = $.data($hidePanel[0], 'panel').splitter;

        splitter.toggle();

        // 重新布局
        Panel.resizePanel();
    };

    module.exports=Panel;
});