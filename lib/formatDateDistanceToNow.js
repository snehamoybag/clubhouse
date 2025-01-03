const {
  format,
  formatDistanceToNowStrict,
  differenceInDays,
} = require("date-fns");

module.exports = (date) => {
  const daysDifference = differenceInDays(new Date(), date);

  if (daysDifference === 7) {
    return "a week ago";
  }

  if (daysDifference > 7) {
    return format(date, "dd MMM yyyy");
  }

  return formatDistanceToNowStrict(date, { addSuffix: true });
};
