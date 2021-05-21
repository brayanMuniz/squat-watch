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

export interface Workout {
  name: string;
  date: string;
  length?: number | undefined;
  exercises: Array<Exercise>;
}

export interface Exercise {
  exerciseName: string;
  sets: Array<WorkingSet>;
}

export interface WorkingSet {
  weight: number;
  reps: number;
  videoUrl?: string;
}
