import { ExtendedProfile, Post, StoryHighlight } from '../types/profile';

export const DEMO_PROFILE: ExtendedProfile = {
  id: '1',
  firstName: 'Rajesh',
  firstNameGuj: 'રાજેશ',
  lastName: 'Shah',
  lastNameGuj: 'શાહ',
  gender: 'male',
  dateOfBirth: '1990-05-15',
  city: 'Surat',
  nativePlace: 'Palanpur',
  bloodGroup: 'B+',
  bio: 'Jai Jinendra! Devoted Jain | Software Professional | Meditation Enthusiast',
  isVerified: true,
  postsCount: 24,
  followersCount: 1250,
  followingCount: 340,
  family: {
    fatherName: 'Kantilal Shah',
    motherName: 'Pushpaben Shah',
    spouseName: 'Nidhi Shah',
    children: ['Aryan', 'Anvi'],
    mamajiName: 'Sureshbhai Mehta',
    mamajiCity: 'Ahmedabad',
    buvaName: 'Prabhaben Jain',
    buvaCity: 'Mumbai',
    sanghName: 'Shri Surat Jain Shwetambar Sangh',
  },
  dharmik: {
    sampraday: 'Shwetambar',
    guruName: 'Acharya Shri Ratnakarji Maharaj',
    darshanDaily: true,
    samayikDaily: true,
    pratikramanDaily: false,
  },
  tap: {
    type: ['Upvas', 'Ekasanu', 'Beasanu'],
    totalFasts: 156,
    currentStreak: 3,
    history: [
      { id: '1', type: 'Upvas', date: '2024-03-10', location: 'Palitana' },
      { id: '2', type: 'Atthai', date: '2024-02-15', duration: '8 days', location: 'Surat' },
      { id: '3', type: 'Ekasanu', date: '2024-01-20' },
    ],
  },
  lifestyle: {
    diet: 'Jain',
    wakeUpTime: '5:30 AM',
    sleepTime: '10:00 PM',
    yoga: true,
    meditation: true,
  },
  social: {
    bio: 'Jai Jinendra! Devoted Jain | Software Professional | Meditation Enthusiast',
    interests: ['Meditation', 'Reading Agam', 'Yoga', 'Temple Visits', 'Community Service'],
    privacy: 'public',
  },
  points: {
    balance: 2450,
    lifetimeEarned: 5200,
    transactions: [
      { id: '1', type: 'earned', amount: 100, description: 'Daily Login Bonus', date: '2024-03-10' },
      { id: '2', type: 'earned', amount: 50, description: 'Completed Samayik', date: '2024-03-09' },
      { id: '3', type: 'spent', amount: 100, description: 'Contact Unlock - Matrimony', date: '2024-03-08' },
      { id: '4', type: 'earned', amount: 200, description: 'Invited 2 friends', date: '2024-03-05' },
      { id: '5', type: 'earned', amount: 500, description: 'Paryushan Special Quiz', date: '2024-02-28' },
    ],
  },
};

export const DEMO_POSTS: Post[] = [
  { id: '1', caption: 'Beautiful darshan at Palitana', likesCount: 142, commentsCount: 18, createdAt: '2024-03-10' },
  { id: '2', caption: 'Paryushan Celebrations', likesCount: 256, commentsCount: 32, createdAt: '2024-02-28' },
  { id: '3', caption: 'Morning Samayik', likesCount: 89, commentsCount: 12, createdAt: '2024-02-20' },
  { id: '4', caption: 'Visited Ranakpur Temple', likesCount: 312, commentsCount: 45, createdAt: '2024-02-14' },
  { id: '5', caption: 'Community Seva Day', likesCount: 198, commentsCount: 28, createdAt: '2024-02-10' },
  { id: '6', caption: 'Girnar Yatra', likesCount: 445, commentsCount: 56, createdAt: '2024-01-20' },
  { id: '7', caption: 'Navkar Mantra Meditation', likesCount: 167, commentsCount: 22, createdAt: '2024-01-15' },
  { id: '8', caption: 'Shikharji Darshan', likesCount: 523, commentsCount: 67, createdAt: '2024-01-05' },
  { id: '9', caption: 'Dilwara Temple Visit', likesCount: 389, commentsCount: 41, createdAt: '2023-12-28' },
];

export const DEMO_HIGHLIGHTS: StoryHighlight[] = [
  { id: '1', title: 'Tap', icon: 'flame', color: '#f59e0b', count: 12 },
  { id: '2', title: 'Tirth', icon: 'location', color: '#14b8a6', count: 8 },
  { id: '3', title: 'Events', icon: 'calendar', color: '#3b82f6', count: 15 },
  { id: '4', title: 'Seva', icon: 'heart', color: '#ec4899', count: 6 },
  { id: '5', title: 'Family', icon: 'people', color: '#8b5cf6', count: 10 },
];
