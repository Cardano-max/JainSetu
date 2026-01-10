import { PrismaClient, Sect, UserRole, ChoGhadiaType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Cities
  const cities = await Promise.all([
    prisma.city.upsert({
      where: { name_state: { name: 'Mumbai', state: 'Maharashtra' } },
      update: {},
      create: { name: 'Mumbai', state: 'Maharashtra', country: 'India' },
    }),
    prisma.city.upsert({
      where: { name_state: { name: 'Surat', state: 'Gujarat' } },
      update: {},
      create: { name: 'Surat', state: 'Gujarat', country: 'India' },
    }),
    prisma.city.upsert({
      where: { name_state: { name: 'Ahmedabad', state: 'Gujarat' } },
      update: {},
      create: { name: 'Ahmedabad', state: 'Gujarat', country: 'India' },
    }),
    prisma.city.upsert({
      where: { name_state: { name: 'Delhi', state: 'Delhi' } },
      update: {},
      create: { name: 'Delhi', state: 'Delhi', country: 'India' },
    }),
    prisma.city.upsert({
      where: { name_state: { name: 'Jaipur', state: 'Rajasthan' } },
      update: {},
      create: { name: 'Jaipur', state: 'Rajasthan', country: 'India' },
    }),
    prisma.city.upsert({
      where: { name_state: { name: 'Bangalore', state: 'Karnataka' } },
      update: {},
      create: { name: 'Bangalore', state: 'Karnataka', country: 'India' },
    }),
    prisma.city.upsert({
      where: { name_state: { name: 'Indore', state: 'Madhya Pradesh' } },
      update: {},
      create: { name: 'Indore', state: 'Madhya Pradesh', country: 'India' },
    }),
    prisma.city.upsert({
      where: { name_state: { name: 'Kolkata', state: 'West Bengal' } },
      update: {},
      create: { name: 'Kolkata', state: 'West Bengal', country: 'India' },
    }),
  ]);

  console.log(`Created ${cities.length} cities`);

  // Create Sanghs
  const sanghs = await Promise.all([
    prisma.sangh.create({
      data: {
        name: 'Shri Digambar Jain Sangh',
        cityId: cities[1].id, // Surat
        address: 'Ring Road, Surat',
        sect: Sect.DIGAMBAR,
        isVerified: true,
      },
    }),
    prisma.sangh.create({
      data: {
        name: 'Shri Shwetambar Jain Sangh',
        cityId: cities[0].id, // Mumbai
        address: 'Kalbadevi, Mumbai',
        sect: Sect.SHWETAMBAR,
        isVerified: true,
      },
    }),
    prisma.sangh.create({
      data: {
        name: 'Jain Sthanakvasi Sangh',
        cityId: cities[2].id, // Ahmedabad
        address: 'CG Road, Ahmedabad',
        sect: Sect.STHANAKVASI,
        isVerified: true,
      },
    }),
  ]);

  console.log(`Created ${sanghs.length} sanghs`);

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      phone: '9999999999',
      email: 'admin@jainsetu.com',
      firstName: 'Admin',
      lastName: 'JainSetu',
      role: UserRole.SUPER_ADMIN,
      status: 'ACTIVE',
      isPhoneVerified: true,
      isEmailVerified: true,
      isProfileVerified: true,
      cityId: cities[1].id,
      sect: Sect.DIGAMBAR,
    },
  });

  console.log('Created admin user');

  // Create Demo Users
  const demoUsers = await Promise.all([
    prisma.user.create({
      data: {
        phone: '9876543210',
        email: 'rahul@example.com',
        firstName: 'Rahul',
        lastName: 'Shah',
        gender: 'MALE',
        dateOfBirth: new Date('1995-05-15'),
        role: UserRole.USER,
        status: 'ACTIVE',
        isPhoneVerified: true,
        cityId: cities[1].id,
        sect: Sect.DIGAMBAR,
        sanghId: sanghs[0].id,
      },
    }),
    prisma.user.create({
      data: {
        phone: '9876543211',
        email: 'sneha@example.com',
        firstName: 'Sneha',
        lastName: 'Shah',
        gender: 'FEMALE',
        dateOfBirth: new Date('1996-08-20'),
        role: UserRole.USER,
        status: 'ACTIVE',
        isPhoneVerified: true,
        cityId: cities[0].id,
        sect: Sect.SHWETAMBAR,
        sanghId: sanghs[1].id,
      },
    }),
  ]);

  console.log(`Created ${demoUsers.length} demo users`);

  // Create Business Categories
  const businessCategories = await Promise.all([
    prisma.businessCategory.create({
      data: { name: 'Jewellery', icon: 'gem', sortOrder: 1 },
    }),
    prisma.businessCategory.create({
      data: { name: 'Real Estate', icon: 'building', sortOrder: 2 },
    }),
    prisma.businessCategory.create({
      data: { name: 'Textiles', icon: 'shirt', sortOrder: 3 },
    }),
    prisma.businessCategory.create({
      data: { name: 'Diamond', icon: 'diamond', sortOrder: 4 },
    }),
    prisma.businessCategory.create({
      data: { name: 'Consultancy', icon: 'briefcase', sortOrder: 5 },
    }),
    prisma.businessCategory.create({
      data: { name: 'Electronics', icon: 'laptop', sortOrder: 6 },
    }),
    prisma.businessCategory.create({
      data: { name: 'Food & Restaurant', icon: 'utensils', sortOrder: 7 },
    }),
    prisma.businessCategory.create({
      data: { name: 'Healthcare', icon: 'hospital', sortOrder: 8 },
    }),
  ]);

  console.log(`Created ${businessCategories.length} business categories`);

  // Create Demo Businesses
  await prisma.business.createMany({
    data: [
      {
        ownerId: demoUsers[0].id,
        name: 'Mahavir Jewellers',
        description: 'Premium diamond and gold jewellery shop serving the Jain community for over 30 years.',
        shortDescription: 'Diamond & Gold Shop',
        categoryId: businessCategories[0].id,
        phone: '9876543220',
        address: 'Ring Road, Surat',
        cityId: cities[1].id,
        status: 'ACTIVE',
        isVerified: true,
        isFeatured: true,
      },
      {
        ownerId: demoUsers[1].id,
        name: 'Shah Electronics',
        description: 'Home appliances and electronics at best prices.',
        shortDescription: 'Home Appliances & Electronics',
        categoryId: businessCategories[5].id,
        phone: '9876543221',
        address: 'Kalbadevi, Mumbai',
        cityId: cities[0].id,
        status: 'ACTIVE',
        isVerified: true,
      },
    ],
  });

  console.log('Created demo businesses');

  // Create Store Categories
  const storeCategories = await Promise.all([
    prisma.storeCategory.create({
      data: { name: 'Puja Items', icon: 'pray', sortOrder: 1 },
    }),
    prisma.storeCategory.create({
      data: { name: 'Books', icon: 'book', sortOrder: 2 },
    }),
    prisma.storeCategory.create({
      data: { name: 'Clothing', icon: 'shirt', sortOrder: 3 },
    }),
    prisma.storeCategory.create({
      data: { name: 'Idols', icon: 'statue', sortOrder: 4 },
    }),
  ]);

  console.log(`Created ${storeCategories.length} store categories`);

  // Create Demo Products
  await prisma.storeProduct.createMany({
    data: [
      {
        name: 'Aarti Thali Set',
        description: 'Beautiful brass aarti thali set with all essential items for daily puja.',
        categoryId: storeCategories[0].id,
        price: 899,
        comparePrice: 1200,
        quantity: 50,
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Jain Puja Books',
        description: 'Collection of essential Jain puja prayers and rituals.',
        categoryId: storeCategories[1].id,
        price: 250,
        quantity: 100,
        isActive: true,
      },
      {
        name: 'White Khadi Kurta',
        description: 'Traditional white khadi kurta for religious occasions.',
        categoryId: storeCategories[2].id,
        price: 1200,
        comparePrice: 1500,
        quantity: 30,
        isActive: true,
        isFeatured: true,
      },
    ],
  });

  console.log('Created demo products');

  // Create Donation Causes
  await prisma.donationCause.createMany({
    data: [
      {
        title: 'Temple Renovation Fund',
        description: 'Help us renovate the ancient Jain temple and preserve our heritage.',
        targetAmount: 1000000,
        raisedAmount: 450000,
        organizerName: 'Jain Temple Trust',
        is80GEligible: true,
        isActive: true,
        isVerified: true,
      },
      {
        title: 'Panjrapole Animal Shelter',
        description: 'Support the care and feeding of rescued animals at our Panjrapole.',
        targetAmount: 500000,
        raisedAmount: 180000,
        organizerName: 'Jain Animal Welfare Society',
        is80GEligible: true,
        isActive: true,
        isVerified: true,
      },
      {
        title: 'Student Education Fund',
        description: 'Help deserving Jain students complete their education.',
        targetAmount: 300000,
        raisedAmount: 95000,
        organizerName: 'Jain Education Foundation',
        is80GEligible: true,
        isActive: true,
        isVerified: true,
      },
    ],
  });

  console.log('Created donation causes');

  // Create Demo Events
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  await prisma.event.createMany({
    data: [
      {
        title: 'Grand Mahavir Jayanti Procession',
        description: 'Join us for the grand procession celebrating Lord Mahavir\'s birth anniversary.',
        shortDescription: 'Annual Mahavir Jayanti celebration',
        venue: 'Jain Temple',
        address: 'Ring Road, Surat',
        cityId: cities[1].id,
        sanghId: sanghs[0].id,
        startDate: futureDate,
        endDate: futureDate,
        startTime: '11:00 AM',
        endTime: '2:00 PM',
        organizerName: 'Jain Sangh Surat',
        dressCode: 'Traditional Only (Kurta Pyjama / Saree). No Western wear.',
        prohibitedItems: ['Leather Belts', 'Purses', 'Mobile Phones in Puja Area'],
        parkingInfo: 'St. Xavier\'s Ground (500m away)',
        footwearInfo: 'Keep at Gate 3 (Token System Available)',
        isRegistrationRequired: true,
        registrationFee: 0,
        maxAttendees: 1000,
        attendancePoints: 10,
        status: 'PUBLISHED',
        isPublic: true,
      },
      {
        title: '3-Day Meditation Shibir',
        description: 'A transformative 3-day meditation camp for spiritual growth.',
        venue: 'Jain Dharamshala',
        address: 'Palitana Road',
        cityId: cities[2].id,
        startDate: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(futureDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        organizerName: 'Jain Meditation Center',
        isRegistrationRequired: true,
        registrationFee: 500,
        maxAttendees: 200,
        attendancePoints: 30,
        status: 'PUBLISHED',
        isPublic: true,
      },
    ],
  });

  console.log('Created demo events');

  // Create Tirth & Dharamshala
  const tirth = await prisma.tirth.create({
    data: {
      name: 'Shri Shankheshwar Tirth',
      description: 'One of the most revered Jain pilgrimage sites with beautiful temple architecture.',
      address: 'Shankheshwar, Gujarat',
      cityId: cities[2].id,
      state: 'Gujarat',
      hasDharamshala: true,
      hasParking: true,
      hasBhojanshala: true,
      isVerified: true,
      isActive: true,
      openingTime: '6:00 AM',
      closingTime: '9:00 PM',
    },
  });

  // Add rooms to dharamshala
  await prisma.dharamshalaRoom.createMany({
    data: [
      {
        tirthId: tirth.id,
        name: 'Standard Room',
        roomType: 'Standard',
        capacity: 2,
        pricePerNight: 500,
        hasAC: false,
        hasAttachedBath: true,
        totalRooms: 20,
        isActive: true,
      },
      {
        tirthId: tirth.id,
        name: 'AC Deluxe Room',
        roomType: 'Deluxe',
        capacity: 4,
        pricePerNight: 1200,
        hasAC: true,
        hasAttachedBath: true,
        amenities: ['TV', 'Geyser', 'Room Service'],
        totalRooms: 10,
        isActive: true,
      },
    ],
  });

  console.log('Created tirth and rooms');

  // Create Panchang data for next 7 days
  const tithis = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  ];

  const choGhadiaTypes: ChoGhadiaType[] = ['AMRIT', 'SHUBH', 'LABH', 'CHAL', 'ROG', 'KAAL', 'UDVEG'];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const tithiIndex = (i + 10) % 15;
    const isParv = tithis[tithiIndex] === 'Ashtami' || tithis[tithiIndex] === 'Purnima';

    await prisma.panchangDay.create({
      data: {
        date,
        tithi: `Shukla ${tithis[tithiIndex]}`,
        paksha: 'Shukla',
        maah: 'Magh',
        sunrise: '06:15 AM',
        sunset: '07:10 PM',
        navkarshi: '07:03 AM',
        isParv,
        parvName: isParv ? tithis[tithiIndex] : null,
        choghadia: {
          create: [
            // Day choghadia
            { startTime: '06:15 AM', endTime: '07:50 AM', type: choGhadiaTypes[0], isDay: true },
            { startTime: '07:50 AM', endTime: '09:25 AM', type: choGhadiaTypes[3], isDay: true },
            { startTime: '09:25 AM', endTime: '11:00 AM', type: choGhadiaTypes[4], isDay: true },
            { startTime: '11:00 AM', endTime: '12:35 PM', type: choGhadiaTypes[5], isDay: true },
            { startTime: '12:35 PM', endTime: '02:10 PM', type: choGhadiaTypes[6], isDay: true },
            { startTime: '02:10 PM', endTime: '03:45 PM', type: choGhadiaTypes[1], isDay: true },
            { startTime: '03:45 PM', endTime: '05:20 PM', type: choGhadiaTypes[2], isDay: true },
            { startTime: '05:20 PM', endTime: '06:55 PM', type: choGhadiaTypes[0], isDay: true },
            // Night choghadia
            { startTime: '07:10 PM', endTime: '08:45 PM', type: choGhadiaTypes[3], isDay: false },
            { startTime: '08:45 PM', endTime: '10:20 PM', type: choGhadiaTypes[4], isDay: false },
            { startTime: '10:20 PM', endTime: '11:55 PM', type: choGhadiaTypes[5], isDay: false },
            { startTime: '11:55 PM', endTime: '01:30 AM', type: choGhadiaTypes[6], isDay: false },
          ],
        },
      },
    });
  }

  console.log('Created panchang data');

  // Create Announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to JainSetu',
      content: 'Welcome to JainSetu - your all-in-one app for the Jain community. Explore Panchang, Events, Directory, and more!',
      isGlobal: true,
      isPinned: true,
      isActive: true,
    },
  });

  console.log('Created announcements');

  // Create App Settings
  await prisma.appSetting.createMany({
    data: [
      { key: 'app_name', value: JSON.stringify('JainSetu') },
      { key: 'app_version', value: JSON.stringify('1.0.0') },
      { key: 'support_email', value: JSON.stringify('support@jainsetu.com') },
      { key: 'support_phone', value: JSON.stringify('+91-9999999999') },
      { key: 'terms_url', value: JSON.stringify('https://jainsetu.com/terms') },
      { key: 'privacy_url', value: JSON.stringify('https://jainsetu.com/privacy') },
    ],
  });

  console.log('Created app settings');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
