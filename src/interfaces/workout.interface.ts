export interface Workout {
  Name: String;
  Date: Date;
  Length?: Number;
  Exercises: Array<Exercise>;
}

export interface Exercise {
  ExerciseName: String;
  Sets: Array<WorkingSet>;
}

export interface WorkingSet {
  Weight: Number;
  Reps: Number;
}
