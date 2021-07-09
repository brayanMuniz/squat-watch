import moment from "moment";
// Generates a list of dates given a startDate and an endDate
export function generateArrayOfDates(
  startDate: string,
  endDate: string
): Array<string> {
  const dates: Array<string> = [];
  const startDateMoment = moment(startDate);
  const endDateMoment = moment(endDate);

  // With +1 it will include the day of
  const diffInDays: number = endDateMoment.diff(startDateMoment, "days") + 1;

  // Populates array with dates
  for (let i = 0; i < diffInDays; i++) {
    const calculatedDay = moment(startDate).add(i, "days");
    dates.push(moment(calculatedDay).format("MM-DD-YYYY"));
  }
  return dates;
}
