import { Converter } from "showdown";
import showdown = require("showdown");

(function () {
    "use strict";

    var alert_quote = function () {
        return [
            {
                type: "output",
                filter: function (text: string, converter: Converter, options: any) {
                    const regex = /(<.*?blockquote)(.*?>(.|\n|\r\n)*?<p>.*?)\[(.*?)\]/gm;
                    const subst = `$1 class="_ $4"$2`;
                    // The substituted value will be contained in the result variable
                    const result = text.replace(regex, subst);
                    return result;
                }
            }
        ];
    };
    if (
        typeof window !== "undefined" &&
        (window as any).Showdown &&
        (window as any).Showdown.alert_quote
    ) {
        (window as any).Showdown.extensions.alert_quote = alert_quote;
    }
    if (typeof module !== "undefined") {
        module.exports = alert_quote;
    }
})();
