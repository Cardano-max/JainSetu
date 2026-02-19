export interface PachchkanTrack {
  id: string;
  number: number;
  title: string;
  titleGuj?: string;
  duration: string;
  durationMs: number;
  description?: string;
}

export const DEMO_PACHCHKAN_TRACKS: PachchkanTrack[] = [
  { id: '1', number: 1, title: 'Namokar Mantra', titleGuj: 'નમોકાર મંત્ર', duration: '2:30', durationMs: 150000, description: 'The most important mantra in Jainism' },
  { id: '2', number: 2, title: 'Chattari Mangalam', titleGuj: 'ચત્તારી મંગલમ', duration: '1:45', durationMs: 105000, description: 'Four auspicious elements' },
  { id: '3', number: 3, title: 'Panch Parmeshthi', titleGuj: 'પંચ પરમેષ્ઠી', duration: '2:15', durationMs: 135000, description: 'Five supreme beings' },
  { id: '4', number: 4, title: 'Karemi Bhante', titleGuj: 'કરેમિ ભંતે', duration: '3:00', durationMs: 180000, description: 'Samayik sutra' },
  { id: '5', number: 5, title: 'Iriyavahiyam', titleGuj: 'ઇરિયાવહિયમ', duration: '2:45', durationMs: 165000, description: 'Pratikraman sutra' },
  { id: '6', number: 6, title: 'Tassautari', titleGuj: 'તસ્સઉત્તરી', duration: '1:30', durationMs: 90000, description: 'Forgiveness sutra' },
  { id: '7', number: 7, title: 'Annathha', titleGuj: 'અણ્ણત્થ', duration: '2:00', durationMs: 120000, description: 'Purpose declaration' },
  { id: '8', number: 8, title: 'Logassa', titleGuj: 'લોગસ્સ', duration: '2:30', durationMs: 150000, description: 'Praise of 24 Tirthankaras' },
  { id: '9', number: 9, title: 'Savva Loe', titleGuj: 'સવ્વ લોએ', duration: '1:15', durationMs: 75000, description: 'Universal prayer' },
  { id: '10', number: 10, title: 'Pukkharavaradivihe', titleGuj: 'પુક્ખરવરદીવિહે', duration: '1:45', durationMs: 105000, description: 'Description of the universe' },
  { id: '11', number: 11, title: 'Siddhaanam', titleGuj: 'સિદ્ધાણમ', duration: '1:30', durationMs: 90000, description: 'Praise of Siddhas' },
  { id: '12', number: 12, title: 'Veyavachcha', titleGuj: 'વેયાવચ્ચ', duration: '2:15', durationMs: 135000, description: 'Service to others' },
  { id: '13', number: 13, title: 'Khaamemi Savve Jiva', titleGuj: 'ખામેમિ સવ્વે જીવ', duration: '2:00', durationMs: 120000, description: 'Forgiveness to all living beings' },
  { id: '14', number: 14, title: 'Icchhaami Khamasaman', titleGuj: 'ઇચ્છામિ ખમાસમણ', duration: '1:45', durationMs: 105000, description: 'Seeking forgiveness' },
  { id: '15', number: 15, title: 'Icchhakaaren', titleGuj: 'ઇચ્છાકારેન', duration: '1:30', durationMs: 90000, description: 'Voluntary observance' },
  { id: '16', number: 16, title: 'Namutkhunam', titleGuj: 'નમુત્થુણં', duration: '2:30', durationMs: 150000, description: 'Salutation to Mahavir' },
  { id: '17', number: 17, title: 'Jai Viyaraya', titleGuj: 'જય વીયરાય', duration: '2:45', durationMs: 165000, description: 'Victory to the brave' },
  { id: '18', number: 18, title: 'Siddha Bhagwant', titleGuj: 'સિદ્ધ ભગવંત', duration: '2:00', durationMs: 120000, description: 'Prayer to liberated souls' },
  { id: '19', number: 19, title: 'Uvasaggaharam', titleGuj: 'ઉવસગ્ગહરમ', duration: '3:15', durationMs: 195000, description: 'Removal of obstacles' },
  { id: '20', number: 20, title: 'Santikaram', titleGuj: 'સંતિકારમ', duration: '2:30', durationMs: 150000, description: 'Peace invocation' },
  { id: '21', number: 21, title: 'Namotthunam', titleGuj: 'નમોત્થુણં', duration: '1:45', durationMs: 105000, description: 'Universal salutation' },
  { id: '22', number: 22, title: 'Bhaktamar Stotra', titleGuj: 'ભક્તામર સ્તોત્ર', duration: '3:30', durationMs: 210000, description: 'Devotional hymn to first Tirthankara' },
  { id: '23', number: 23, title: 'Kalyan Mandir Stotra', titleGuj: 'કલ્યાણ મંદિર સ્તોત્ર', duration: '3:00', durationMs: 180000, description: 'Auspicious temple prayer' },
  { id: '24', number: 24, title: 'Ajit Shanti Stavan', titleGuj: 'અજિત શાંતિ સ્તવન', duration: '2:45', durationMs: 165000, description: 'Prayer for peace and prosperity' },
];
