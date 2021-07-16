import { ChartData } from "chart.js";

export class Workout {
  name: string;
  date: string;
  exercises: Array<Exercise>;
  length?: number;

  constructor(
    name: string,
    date: string,
    exercises: Array<Exercise>,
    length?: number
  ) {
    this.name = name;
    this.date = date;
    this.exercises = exercises;

    if (length) this.length = length;
    else this.length = 0;
  }
}

// This will be used to populate data for a single chart
export interface ExerciseChartData {
  exerciseName: string;
  chartData: ChartData;
  setsWithDates: Array<ChartWorkingSet>;
  videoReady: boolean;
  videoUrl: string;
  videoLoading: boolean;
}

// Will have date
export interface ChartWorkingSet {
  date: string;
  sets: Array<WorkingSet>;
}

export interface Workout {
  name: string;
  date: string;
  exercises: Array<Exercise>;
  workoutNote?: string;
  length?: number | undefined;
}

export interface Exercise {
  exerciseName: string;
  sets: Array<WorkingSet>;
  videoData?: Array<VideoData>;
  exerciseNote?: string;
}

export interface VideoData {
  setVideoIdx: number;
  video: any;
}

export interface WorkingSet {
  weight: number;
  reps: number;
  videoUrl?: string;
}

// Converts An array of workout data into ExerciseChartData
export function covertWorkoutDataToChartData(
  workoutData: Array<Workout>
): Array<ExerciseChartData> {
  // helps keep track what exercises i already have an object for
  const alreadyStartedExercises: Array<string> = [];
  const allExercises: Array<ExerciseChartData> = [];

  workoutData.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (alreadyStartedExercises.includes(exercise.exerciseName)) {
        allExercises.forEach((exerciseChartData) => {
          if (exerciseChartData.exerciseName === exercise.exerciseName) {
            // Configure Chart Data ==
            // x axis of dates
            if (exerciseChartData.chartData.labels)
              exerciseChartData.chartData.labels.push(workout.date);

            // y axis of one rep max
            if (exerciseChartData.chartData.datasets) {
              if (exerciseChartData.chartData.datasets[0].data)
                exerciseChartData.chartData.datasets[0].data.push(
                  findBestOneRepMax(exercise.sets)
                );
            }

            // Cofigures set data ==

            const formattedSets: ChartWorkingSet = {
              date: workout.date,
              sets: exercise.sets,
            };
            exerciseChartData.setsWithDates.push(formattedSets);
          }
        });
      } else {
        alreadyStartedExercises.push(exercise.exerciseName);

        const convertedDataToChart: ChartData = {
          labels: [workout.date], // x axis
          datasets: [
            {
              label: `${exercise.exerciseName} One Rep Max`,
              data: [findBestOneRepMax(exercise.sets)], // y axis
              fill: false,
              borderColor: "#0000a5",
            },
          ],
        };

        const formattedSets: ChartWorkingSet = {
          date: workout.date,
          sets: exercise.sets,
        };

        allExercises.push({
          exerciseName: exercise.exerciseName,
          chartData: convertedDataToChart,
          setsWithDates: [formattedSets],
          videoReady: false,
          videoUrl: "",
          videoLoading: false,
        });
      }
    });
  });

  return allExercises;
}

// Brzycki formula weight / ( 1.0278 – 0.0278 × reps )
export function calculateOneRepMax(weight: number, reps: number): number {
  return Math.round(weight / (1.0278 - 0.0278 * reps));
}

// Finds best one rep max in a array of working sets
export function findBestOneRepMax(sets: Array<WorkingSet>): number {
  let bestOneRepMax = 0;
  sets.forEach((set) => {
    const setOneRepMax = Math.round(set.weight * (1 + set.reps / 30));
    if (setOneRepMax > bestOneRepMax) {
      bestOneRepMax = setOneRepMax;
    }
  });
  return bestOneRepMax;
}

// Given An array of working sets, find the best set, calculated by one rep max, 
// And return best set as "weight x reps"
export function getBestSetAsString(sets: Array<WorkingSet>): string {
  let bestSet = `${sets[0].weight} x ${sets[0].reps}`;
  let bestSetCalculated: number = calculateOneRepMax(
    sets[0].weight,
    sets[0].reps
  );

  sets.forEach((set) => {
    if (calculateOneRepMax(set.weight, set.reps) > bestSetCalculated) {
      bestSet = `${set.weight} x ${set.reps}`;
      bestSetCalculated = calculateOneRepMax(set.weight, set.reps);
    }
  });
  return bestSet;
}
