export function calculateSlaDueAt(from: Date = new Date()): Date {
  const due = new Date(from);
  due.setHours(due.getHours() + 2);
  return due;
}
