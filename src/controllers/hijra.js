const hijriMonthNames = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

function gregorianToHijri(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) {
        throw new Error('Invaild date');
    }

    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });

    const parts = formatter.formatToParts(d);
    const map = {};
    parts.forEach(p => (map[p.type] = p.value));

    const year = parseInt(map.year, 10);
    const month = parseInt(map.month, 10);
    const day = parseInt(map.day, 10);

    return {
        year,
        month,
        day,
        monthName: hijriMonthNames[month - 1],
        formatted: `${day}/${month}/${year} هـ`,
        formattedArabic: `${day} ${hijriMonthNames[month - 1]} ${year} هـ`,
    };
}

function hijriToGregorian(hijriYear, hijriMonth, hijriDay) {
    const jd =
        Math.floor((11 * hijriYear + 3) / 30) +
        354 * hijriYear +
        30 * hijriMonth -
        Math.floor((hijriMonth - 1) / 2) +
        hijriDay +
        1948440 -
        385;

    let l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l) / 2447);
    const day = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    const month = j + 2 - 12 * l;
    const year = 100 * (n - 49) + i + l;

    const gregorianDate = new Date(Date.UTC(year, month - 1, day));

    const check = gregorianToHijri(gregorianDate);
    let diffDays = 0;
    if (check.day !== hijriDay || check.month !== hijriMonth || check.year !== hijriYear) {
        for (let offset = -3; offset <= 3; offset++) {
            const testDate = new Date(gregorianDate);
            testDate.setUTCDate(testDate.getUTCDate() + offset);
            const testHijri = gregorianToHijri(testDate);
            if (
                testHijri.day === hijriDay &&
                testHijri.month === hijriMonth &&
                testHijri.year === hijriYear
            ) {
                diffDays = offset;
                break;
            }
        }
    }
    gregorianDate.setUTCDate(gregorianDate.getUTCDate() + diffDays);

    return {
        year: gregorianDate.getUTCFullYear(),
        month: gregorianDate.getUTCMonth() + 1,
        day: gregorianDate.getUTCDate(),
        formatted: `${String(gregorianDate.getUTCDate()).padStart(2, '0')}/${String(
            gregorianDate.getUTCMonth() + 1
        ).padStart(2, '0')}/${gregorianDate.getUTCFullYear()} م`,
    };
}

export const getHijriFromGregorian = async (request, reply) => {
    try {
        const { date } = request.query;
        const targetDate = date ? date : new Date();

        const result = gregorianToHijri(targetDate);

        return reply.code(200).send({
            success: true,
            input: date || new Date().toISOString().split('T')[0],
            hijri: result,
        });
    } catch (error) {
        return reply.code(400).send({
            success: false,
            message: error.message || 'Error: while convert the calender',
        });
    }
};

export const getGregorianFromHijri = async (request, reply) => {
    try {
        const { year, month, day } = request.query;

        if (!year || !month || !day) {
            return reply.code(400).send({
                success: false,
                message: 'You should send this query (month, year, day)',
            });
        }
        const hy = parseInt(year, 10);
        const hm = parseInt(month, 10);
        const hd = parseInt(day, 10);
        if (
            isNaN(hy) || isNaN(hm) || isNaN(hd) ||
            hm < 1 || hm > 12 || hd < 1 || hd > 30
        ) {
            return reply.code(400).send({
                success: false,
                message: 'Invalid Hijri date values',
            });
        }
        const result = hijriToGregorian(hy, hm, hd);
        return reply.code(200).send({
            success: true,
            input: { year: hy, month: hm, day: hd },
            gregorian: result,
        });
    } catch (error) {
        return reply.code(400).send({
            success: false,
            message: error.message || 'Error: while get date',
        });
    }
};

export const getTodayHijri = async (request, reply) => {
    try {
        const result = gregorianToHijri(new Date());
        return reply.code(200).send({
            success: true,
            gregorian: new Date().toISOString().split('T')[0],
            hijri: result,
        });
    } catch (error) {
        return reply.code(400).send({
            success: false,
            message: error.message || 'Error: while get date',
        });
    }
};