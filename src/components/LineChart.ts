import { Component, Mixins, Prop } from "vue-property-decorator";
import { Line, mixins } from "vue-chartjs";
import { ChartOptions } from "chart.js";

@Component({
  extends: Line, // this is important to add the functionality
})
export default class LineChart extends Mixins(mixins.reactiveProp, Line) {
  @Prop() readonly options?: ChartOptions | undefined;

  mounted() {
    console.log(this.options);
    if (this.options) {
      // Adds the onClick function to transmit data to the parent component
      const totalOptions = this.options;
      totalOptions["onClick"] = (
        event?: MouseEvent | undefined,
        activeElements?
      ) => {
        console.log("NEW POINT CLICKED");

        const data = { labelPoint: {}, dataSetPoint: {} };

        if (activeElements) {
          if (activeElements[0]) data.labelPoint = activeElements[0];
          if (activeElements[1]) data.dataSetPoint = activeElements[1];
        }

        this.$emit("clickedPoint", data);
      };

      this.renderChart(this.chartData, totalOptions);
    } else {
      this.renderChart(this.chartData);
    }
  }
}
