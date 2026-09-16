export const getCurrentSchoolYearStr = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JS month 0-11
  const currentYear = now.getFullYear();

  return currentMonth >= 7
    ? `${currentYear}/${currentYear + 1}`
    : `${currentYear - 1}/${currentYear}`;
};