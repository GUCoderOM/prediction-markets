import * as LWC from "lightweight-charts";

console.log("MODULE KEYS:", Object.keys(LWC));

console.log("createChart =>", typeof LWC.createChart);
console.log("version =>", LWC.version);

const el = { clientWidth: 300, clientHeight: 300 };
try {
  const chart = LWC.createChart(document.createElement("div"));
  console.log("addCandlestickSeries =>", typeof chart.addCandlestickSeries);
} catch (e) {
  console.error("ERR creating chart:", e);
}