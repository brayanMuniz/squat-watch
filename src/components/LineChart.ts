import { Component, Mixins } from "vue-property-decorator";
import { Line, mixins } from "vue-chartjs";

@Component({
  extends: Line, // this is important to add the functionality 
})
export default class CommitChart extends Mixins(mixins.reactiveProp, Line) {
  mounted() {
    // ? How do i add options 
    this.renderChart(this.chartData);
  }
}
