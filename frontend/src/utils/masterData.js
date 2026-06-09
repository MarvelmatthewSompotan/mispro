// ===== MASTER DATA =====
const MASTER_DATA = {
  classes: [
    { class_id: 1, grade: "N" },
    { class_id: 2, grade: "K1" },
    { class_id: 3, grade: "K2" },
    { class_id: 4, grade: "1" },
    { class_id: 5, grade: "2" },
    { class_id: 6, grade: "3" },
    { class_id: 7, grade: "4" },
    { class_id: 8, grade: "5" },
    { class_id: 9, grade: "6" },
    { class_id: 10, grade: "7" },
    { class_id: 11, grade: "8" },
    { class_id: 12, grade: "9" },
    { class_id: 13, grade: "10" },
    { class_id: 14, grade: "11" },
    { class_id: 15, grade: "12" },
  ],

  // nanti tinggal tambah di sini
  student_status: ["New", "Old", "Transferee"],
  roles: ["admin", "registrar", "teacher"],
};

// ===== UNIVERSAL FUNCTION =====
export const getOptions = (only) => {
  // 🔹 tanpa param → return semua
  if (!only) {
    return MASTER_DATA;
  }

  // 🔹 convert ke array (support string / array)
  const keys =
    typeof only === "string" ? only.split(",") : only;

  const result = {};

  keys.forEach((key) => {
    if (MASTER_DATA[key]) {
      result[key] = MASTER_DATA[key];
    }
  });

  return result;
};