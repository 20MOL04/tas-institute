/**
 * Single source of truth for the institute's headline figures.
 *
 * 1200+ students and 18 teachers are given by the school. The two others are
 * structural facts about the offering (8 h/day on the intensive track, 7 skills
 * in the English syllabus), so they stay accurate without needing an update.
 */
export const TAS_KPIS = [
  { value: 1200, suffix: "+", fr: "Étudiants formés", en: "Students Trained" },
  { value: 18, suffix: "", fr: "Enseignants et formateurs", en: "Teachers and Trainers" },
  { value: 8, suffix: " h", fr: "D'anglais par jour en intensif", en: "Hours of English/Day, Intensive" },
  { value: 7, suffix: "", fr: "Compétences travaillées en cours", en: "Skills Covered in Class" },
] as const;
