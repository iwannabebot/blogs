import { Converter } from "showdown";
import showdown = require("showdown");

(function() {
  "use strict";
  
  var attributions = function() {
    return [
      {
        type: "output",
        filter: function(text: string, converter: Converter, options: any) {
          const regex = /\@\[attribution=\"?(.*?)\"?\]/g;
          let replaceString = "";
          const result = text.match(regex);
          if(result != null){
            replaceString += "<h4>Attributions</h4><br><ul>"
            const d = result[0];
            const g = d.replace(regex, '$1');
            for(let url in g.split(',')) {
              replaceString += "<li>"+g.split(',')[url]+"</li>";
            }
            replaceString += "</ul>";
          }
          return text.replace(regex, replaceString);
        }
      }
    ];
  };
  if (
    typeof window !== "undefined" &&
    (window as any).Showdown &&
    (window as any).Showdown.attributions
  ) {
    (window as any).Showdown.extensions.attributions = attributions;
  }
  if (typeof module !== "undefined") {
    module.exports = attributions;
  }
})();
