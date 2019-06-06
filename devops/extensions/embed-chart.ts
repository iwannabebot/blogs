import { Converter } from "showdown";
import showdown = require("showdown");

(function() {
  "use strict";
  
  var embedchart = function() {
    return [
      {
        type: "output",
        filter: function(text: string, converter: Converter, options: any) {
           //  $[EMBED-CHART]
           return text.replace(/\$\[EMBED\-CHART\]/g, 
            `<canvas id='myChart' class='embed-chart' width='700' height='400'></canvas>
<script>
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
</script>`);
        }
      }
    ];
  };
  if (
    typeof window !== "undefined" &&
    (window as any).Showdown &&
    (window as any).Showdown.embedchart
  ) {
    (window as any).Showdown.extensions.embedchart = embedchart;
  }
  if (typeof module !== "undefined") {
    module.exports = embedchart;
  }
})();
