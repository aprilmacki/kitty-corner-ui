
export function fromEpochSeconds(seconds: number) {
  const date: Date = new Date(0);
  date.setUTCSeconds(seconds);
  return date;
}
