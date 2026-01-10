import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';

export class PanchangController {
  // Get Today's Panchang
  getToday = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let panchang = await prisma.panchangDay.findUnique({
        where: { date: today },
        include: {
          choghadia: {
            orderBy: { startTime: 'asc' },
          },
        },
      });

      // If no data exists, generate placeholder
      if (!panchang) {
        panchang = await this.generatePanchangForDate(today);
      }

      res.json({
        success: true,
        panchang: {
          ...panchang,
          dayChoghadia: panchang.choghadia.filter((c) => c.isDay),
          nightChoghadia: panchang.choghadia.filter((c) => !c.isDay),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Panchang by Date
  getByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      let panchang = await prisma.panchangDay.findUnique({
        where: { date: targetDate },
        include: {
          choghadia: {
            orderBy: { startTime: 'asc' },
          },
        },
      });

      if (!panchang) {
        panchang = await this.generatePanchangForDate(targetDate);
      }

      res.json({
        success: true,
        panchang: {
          ...panchang,
          dayChoghadia: panchang.choghadia.filter((c) => c.isDay),
          nightChoghadia: panchang.choghadia.filter((c) => !c.isDay),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Panchang for a Month
  getMonth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, month } = req.params;
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      const panchangDays = await prisma.panchangDay.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          choghadia: {
            orderBy: { startTime: 'asc' },
          },
        },
        orderBy: { date: 'asc' },
      });

      // Generate missing days
      const existingDates = new Set(
        panchangDays.map((p) => p.date.toISOString().split('T')[0])
      );

      const allDays = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const existing = panchangDays.find(
          (p) => p.date.toISOString().split('T')[0] === dateStr
        );

        if (existing) {
          allDays.push({
            ...existing,
            dayChoghadia: existing.choghadia.filter((c) => c.isDay),
            nightChoghadia: existing.choghadia.filter((c) => !c.isDay),
          });
        } else {
          const generated = await this.generatePanchangForDate(new Date(currentDate));
          allDays.push({
            ...generated,
            dayChoghadia: generated.choghadia.filter((c) => c.isDay),
            nightChoghadia: generated.choghadia.filter((c) => !c.isDay),
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.json({
        success: true,
        year: parseInt(year),
        month: parseInt(month),
        days: allDays,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Upcoming Parv
  getUpcomingParv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = '10' } = req.query;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const parvDays = await prisma.panchangDay.findMany({
        where: {
          date: { gte: today },
          isParv: true,
        },
        orderBy: { date: 'asc' },
        take: parseInt(limit as string),
      });

      res.json({
        success: true,
        parv: parvDays,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Parv by Month
  getParvByMonth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, month } = req.params;
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      const parvDays = await prisma.panchangDay.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          isParv: true,
        },
        orderBy: { date: 'asc' },
      });

      res.json({
        success: true,
        year: parseInt(year),
        month: parseInt(month),
        parv: parvDays,
      });
    } catch (error) {
      next(error);
    }
  };

  // Helper: Generate Panchang for a date
  private generatePanchangForDate = async (date: Date) => {
    // This is a simplified panchang generation
    // In production, this would use proper astronomical calculations
    const tithis = [
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
      'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'
    ];

    const months = [
      'Chaitra', 'Vaishakh', 'Jyeshtha', 'Ashadh', 'Shravan',
      'Bhadrapad', 'Ashwin', 'Kartik', 'Margashirsha', 'Paush', 'Magh', 'Phalgun'
    ];

    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );

    const tithiIndex = dayOfYear % 30;
    const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
    const tithiName = tithis[tithiIndex % 16];
    const monthIndex = (date.getMonth() + Math.floor(dayOfYear / 30)) % 12;

    // Simplified sunrise/sunset calculation (approximate for India)
    const sunrise = '06:15 AM';
    const sunset = '07:10 PM';
    const navkarshi = '07:03 AM';

    // Check for parv
    const isParv = tithiName === 'Ashtami' || tithiName === 'Purnima' ||
                   tithiName === 'Amavasya' || tithiName === 'Chaturdashi';

    let parvName = null;
    let parvDescription = null;

    if (tithiName === 'Ashtami') {
      parvName = 'Ashtami';
      parvDescription = 'Auspicious day for fasting and prayers';
    } else if (tithiName === 'Purnima') {
      parvName = 'Purnima';
      parvDescription = 'Full moon day - auspicious for all activities';
    } else if (tithiName === 'Chaturdashi') {
      parvName = 'Chaturdashi';
      parvDescription = 'Day of meditation and prayers';
    }

    const panchang = await prisma.panchangDay.create({
      data: {
        date,
        tithi: `${paksha} ${tithiName}`,
        paksha,
        maah: months[monthIndex],
        sunrise,
        sunset,
        navkarshi,
        isParv,
        parvName,
        parvDescription,
        choghadia: {
          create: this.generateChoghadia(date),
        },
      },
      include: {
        choghadia: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    return panchang;
  };

  // Helper: Generate Choghadia times
  private generateChoghadia = (date: Date) => {
    const dayOfWeek = date.getDay();
    const choGhadiaSequences = {
      0: ['UDVEG', 'CHAL', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG'], // Sunday
      1: ['AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAL', 'LABH', 'AMRIT'], // Monday
      2: ['ROG', 'UDVEG', 'CHAL', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG'], // Tuesday
      3: ['LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAL', 'LABH'], // Wednesday
      4: ['SHUBH', 'ROG', 'UDVEG', 'CHAL', 'LABH', 'AMRIT', 'KAAL', 'SHUBH'], // Thursday
      5: ['CHAL', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAL'], // Friday
      6: ['KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAL', 'LABH', 'AMRIT', 'KAAL'], // Saturday
    };

    const sequence = choGhadiaSequences[dayOfWeek as keyof typeof choGhadiaSequences];
    const choghadia = [];

    // Day choghadia (8 periods from sunrise to sunset)
    const dayStartHour = 6;
    const dayPeriodMinutes = 90; // Approximately 90 minutes each

    for (let i = 0; i < 8; i++) {
      const startMinutes = dayStartHour * 60 + i * dayPeriodMinutes;
      const endMinutes = startMinutes + dayPeriodMinutes;

      const startHour = Math.floor(startMinutes / 60);
      const startMin = startMinutes % 60;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;

      const formatTime = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
      };

      choghadia.push({
        startTime: formatTime(startHour, startMin),
        endTime: formatTime(endHour, endMin),
        type: sequence[i] as any,
        isDay: true,
      });
    }

    // Night choghadia (8 periods from sunset to next sunrise)
    const nightStartHour = 19;
    for (let i = 0; i < 8; i++) {
      const startMinutes = nightStartHour * 60 + i * dayPeriodMinutes;
      const adjustedStartMinutes = startMinutes >= 24 * 60 ? startMinutes - 24 * 60 : startMinutes;
      const endMinutes = startMinutes + dayPeriodMinutes;
      const adjustedEndMinutes = endMinutes >= 24 * 60 ? endMinutes - 24 * 60 : endMinutes;

      const startHour = Math.floor(adjustedStartMinutes / 60);
      const startMin = adjustedStartMinutes % 60;
      const endHour = Math.floor(adjustedEndMinutes / 60);
      const endMin = adjustedEndMinutes % 60;

      const formatTime = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
      };

      // Rotate sequence for night
      const nightSequence = [...sequence.slice(4), ...sequence.slice(0, 4)];

      choghadia.push({
        startTime: formatTime(startHour, startMin),
        endTime: formatTime(endHour, endMin),
        type: nightSequence[i] as any,
        isDay: false,
      });
    }

    return choghadia;
  };
}
