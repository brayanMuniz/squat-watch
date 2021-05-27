import { Component, Mixins, Prop } from "vue-property-decorator";
import { Line, mixins } from "vue-chartjs";
import { ChartOptions } from "chart.js";

@Component({
  extends: Line, // this is important to add the functionality
})
export default class LineChart extends Mixins(mixins.reactiveProp, Line) {
  @Prop() readonly options?: ChartOptions | undefined;

  mounted() {
    if (this.options) {
      // Adds the onClick function to transmit data to the parent component
      const totalOptions = this.options;
      totalOptions["onClick"] = (
        event?: MouseEvent | undefined,
        activeElements?
      ) => {
        let data = {};

        // if there are no activeElements a random part of the chart was clicked
        if (activeElements) {
          if (activeElements.length > 0) {
            if (activeElements[0]) data = activeElements[0];
            this.$emit("clickedPoint", data);
          }
        }
      };

      this.renderChart(this.chartData, totalOptions);
    } else {
      this.renderChart(this.chartData);
    }
  }
}
