export const TEACHER_EMAIL_DOMAIN = "@tcetmumbai.in";

export function isTcetTeacherEmail(email: string) {
  return email.toLowerCase().endsWith(TEACHER_EMAIL_DOMAIN);
}
