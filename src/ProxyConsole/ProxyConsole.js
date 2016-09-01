/**
 * @authors       Peter 王斐
 * @email         wangfeia@zbj.com
 * @date          2016-08-31 09:08
 * @description      代理 console
 */
define([], function (require, exports, module) {


    function ProxyConsole(opt) {
        this.opt = opt;
        $("body").on("click", this.opt.clearBtnSelector, function () {
            parent.sandbox.model.evaluate("\:clear");
        });
    }

    var methods = ProxyConsole.prototype.methods = [
        'debug', 'clear', 'error', 'info', 'log', 'warn', 'dir', 'props', '_raw',
        'group', 'groupEnd', 'dirxml', 'table', 'trace', 'assert', 'count',
        'markTimeline', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeStamp',
        'groupCollapsed'
    ];


    methods.forEach(function (method) {
        // Create console method
        ProxyConsole.prototype[method] = function () {
            // Replace args that can't be sent through postMessage
            var originalArgs = [].slice.call(arguments);
            // var args = stringifyArgs(originalArgs);

            for (var i = 0; i < originalArgs.length; i++) {
                // Post up with method and the arguments
                // window.postMessage(args[i], '*');
                // TODO 是否可以优化为 postMessage
                if (method === "error") {
                    // parent.post(String(originalArgs[i]), "innerWindow", ["error", args[i].stack]);
                    parent.sandbox.model.evaluate(String(originalArgs[i]), "error");
                } else {
                    parent.sandbox.model.evaluate(String(originalArgs[i]));
                }
            }
        };
    });
    module.exports = ProxyConsole;

    // /**
    //  * Stringify all of the console objects from an array for proxying
    //  */
    // var stringifyArgs = function (args) {
    //     var newArgs = [];
    //     // TODO this was forEach but when the array is [undefined] it wouldn't
    //     // iterate over them
    //     var i = 0, length = args.length, arg;
    //     for (; i < length; i++) {
    //         arg = args[i];
    //         if (typeof arg === 'undefined') {
    //             newArgs.push('undefined');
    //         } else {
    //             newArgs.push(arg);
    //         }
    //     }
    //     return newArgs;
    // };


});