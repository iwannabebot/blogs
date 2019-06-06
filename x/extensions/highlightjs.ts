import { Converter } from "showdown";
import showdown = require("showdown");
import hljs = require("highlight.js");

(function() {
  "use strict";
  
  var highlight = function() {
    return [
      {
        type: "output",
        filter: function(text: string, converter: Converter, options: any) {
          var left = "<pre><code\\b[^>]*>",
            right = "</code></pre>",
            flags = "g";
          var replacement = function(wholeMatch: any, match: any, left: any, right: any) {
            let _text = match.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
            left = left.slice(0, 18) + "hljs " + left.slice(18);
            if (lang && hljs.getLanguage(lang)) {
              return left + hljs.highlight(lang, _text).value + right;
            } else {
              return left + hljs.highlightAuto(_text).value + right;
            }
          };
          return showdown.helper.replaceRecursiveRegExp(
            text,
            replacement,
            left,
            right,
            flags
          );
        }
      }
    ];
  };
  if (
    typeof window !== "undefined" &&
    (window as any).Showdown &&
    (window as any).Showdown.extensions
  ) {
    (window as any).Showdown.extensions.highlight = highlight;
  }
  if (typeof module !== "undefined") {
    module.exports = highlight;
  }
})();
