export const splitDate = (start: Date, end: Date, split: number) => {
  const span = (end.getTime() - start.getTime()) / split;
  const res = [...new Array(split)].map((_, i) => new Date(start.getTime() + span * (i + 1)));
  return res;
};
