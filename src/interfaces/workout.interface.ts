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
}

// Will have date
export interface ChartWorkingSet {
  date: string;
  sets: Array<WorkingSet>;
}

export interface Workout {
  name: string;
  date: string;
  length?: number | undefined;
  exercises: Array<Exercise>;
}

export interface Exercise {
  exerciseName: string;
  sets: Array<WorkingSet>;
  videoData?: Array<VideoData>;
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
