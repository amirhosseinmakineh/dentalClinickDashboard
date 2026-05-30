export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface CalendarDay {
  day: number;
  jalali: JalaliDate;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
}

export const persianMonths = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

export const persianWeekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function buildJalaliCalendarDays(viewJalaliYear: number, viewJalaliMonth: number, selectedIso: string, maxIso = formatGregorianDate(new Date())): CalendarDay[] {
  const todayJalali = toJalali(new Date());
  const firstDayOfMonth = toGregorianDate(viewJalaliYear, viewJalaliMonth, 1);
  const startOffset = (firstDayOfMonth.getDay() + 1) % 7;
  const calendarStart = addDays(firstDayOfMonth, -startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const gregorianDate = addDays(calendarStart, index);
    const jalali = toJalali(gregorianDate);
    const iso = formatGregorianDate(gregorianDate);

    return {
      day: jalali.jd,
      jalali,
      iso,
      isCurrentMonth: jalali.jm === viewJalaliMonth,
      isToday: isSameJalaliDate(jalali, todayJalali),
      isSelected: iso === selectedIso,
      disabled: iso > maxIso
    };
  });
}

export function toPersianDigits(value: string | number): string {
  return value.toString().replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
}

export function formatJalaliDisplay(date: JalaliDate): string {
  return `${toPersianDigits(date.jy)}/${toPersianDigits(date.jm.toString().padStart(2, '0'))}/${toPersianDigits(date.jd.toString().padStart(2, '0'))}`;
}

export function formatGregorianDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

export function isSameJalaliDate(first: JalaliDate, second: JalaliDate): boolean {
  return first.jy === second.jy && first.jm === second.jm && first.jd === second.jd;
}

export function toGregorianDate(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);

  return new Date(gy, gm - 1, gd);
}

export function toJalali(date: Date): JalaliDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let gy2 = gy - 1600;
  let gm2 = gm - 1;
  let gd2 = gd - 1;
  let gDayNo = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400);

  for (let index = 0; index < gm2; index += 1) {
    gDayNo += gDaysInMonth[index];
  }

  if (gm2 > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) {
    gDayNo += 1;
  }

  gDayNo += gd2;

  let jDayNo = gDayNo - 79;
  const jNp = Math.floor(jDayNo / 12053);
  jDayNo %= 12053;

  let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
  jDayNo %= 1461;

  if (jDayNo >= 366) {
    jy += Math.floor((jDayNo - 1) / 365);
    jDayNo = (jDayNo - 1) % 365;
  }

  let jm = 0;

  for (jm = 0; jm < 11 && jDayNo >= jDaysInMonth[jm]; jm += 1) {
    jDayNo -= jDaysInMonth[jm];
  }

  return { jy, jm: jm + 1, jd: jDayNo + 1 };
}

export function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let jy2 = jy - 979;
  let jm2 = jm - 1;
  let jd2 = jd - 1;
  let jDayNo = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4);

  for (let index = 0; index < jm2; index += 1) {
    jDayNo += jDaysInMonth[index];
  }

  jDayNo += jd2;

  let gDayNo = jDayNo + 79;
  let gy = 1600 + 400 * Math.floor(gDayNo / 146097);
  gDayNo %= 146097;

  let leap = true;

  if (gDayNo >= 36525) {
    gDayNo -= 1;
    gy += 100 * Math.floor(gDayNo / 36524);
    gDayNo %= 36524;

    if (gDayNo >= 365) {
      gDayNo += 1;
    } else {
      leap = false;
    }
  }

  gy += 4 * Math.floor(gDayNo / 1461);
  gDayNo %= 1461;

  if (gDayNo >= 366) {
    leap = false;
    gDayNo -= 1;
    gy += Math.floor(gDayNo / 365);
    gDayNo %= 365;
  }

  let gm = 0;

  for (gm = 0; gm < 11 && gDayNo >= gDaysInMonth[gm] + (gm === 1 && leap ? 1 : 0); gm += 1) {
    gDayNo -= gDaysInMonth[gm] + (gm === 1 && leap ? 1 : 0);
  }

  return { gy, gm: gm + 1, gd: gDayNo + 1 };
}
