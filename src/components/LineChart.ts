import { Component, Mixins, Prop } from "vue-property-decorator";
import { Line, mixins } from "vue-chartjs";
import { ChartOptions, ChartPoint } from "chart.js";
import { ChartWorkingSet } from "@/interfaces/workout.interface";
import { Moment } from "moment";

@Component({
  extends: Line, // this is important to add the functionality
})
export default class LineChart extends Mixins(mixins.reactiveProp, Line) {
  @Prop() readonly options?: ChartOptions | undefined;
  @Prop() readonly workingSets?: Array<ChartWorkingSet> | undefined;
  @Prop() readonly exerciseName?: string | undefined;

  mounted() {
    if (this.options) {
      // Adds the onClick function to transmit data to the parent component
      const totalOptions = this.options;

      // When a user clicks on a point, it will return the videoUrl for that day
      totalOptions["onClick"] = (
        event?: MouseEvent | undefined,
        activeElements?
      ) => {
        let data: any = {};
        const videoData: any = {
          videoUrl: "",
          exerciseName: this.exerciseName,
        };

        // if there are no activeElements a random part of the chart was clicked
        if (activeElements) {
          if (activeElements.length > 0) {
            if (activeElements[0]) data = activeElements[0];
            const idx: number | undefined = data._index;
            let label:
              | string
              | number
              | string[]
              | Date
              | number[]
              | Date[]
              | Moment
              | Moment[];
            let dataPoint:
              | number
              | number[]
              | ChartPoint
              | null
              | undefined = 0;

            // cant just user if(idx), because if idx = 0, then it will return false
            if (idx !== undefined) {
              if (this.chartData.labels) {
                label = this.chartData.labels[idx];
                this.workingSets?.forEach((dayOf) => {
                  if (dayOf.date === label) {
                    dayOf.sets.forEach((set) => {
                      if (set.videoUrl) videoData.videoUrl = set.videoUrl;
                    });
                  }
                });
              }

              if (this.chartData.datasets)
                if (this.chartData.datasets[0].data)
                  dataPoint = this.chartData.datasets[0].data[idx];
            }
          }
        }
        this.$emit("clickedPoint", videoData);
      };

      // When user hovers over a point it will show weight x reps
      const workingSets: Array<ChartWorkingSet> | undefined = this.workingSets;
      if (this.workingSets) {
        if (totalOptions["tooltips"]?.callbacks) {
          totalOptions["tooltips"].callbacks.label = function(
            tooltipItem: any,
            data: any
          ) {
            if (workingSets) {
              let actualSet = "";
              workingSets.forEach((set) => {
                if (set.date === tooltipItem.label) {
                  actualSet = `${set.sets[0].weight} x ${set.sets[0].reps}`; // todo: figure out which is one rep max
                }
              });
              return actualSet;
            } else {
              return "";
            }
          };
        }
      }

      this.renderChart(this.chartData, totalOptions);
    } else {
      this.renderChart(this.chartData);
    }
  }
}
