/**
 * Mock card templates data
 * In production, this would come from the API
 */
export const cardTemplates = [
  // Birthday Cards
  {
    id: 'bday-1',
    category: 'birthday',
    name: 'Happy Birthday Balloons',
    imageUrl: 'https://picsum.photos/seed/bday1/400/600',
    description: 'Colorful balloons celebration design',
  },
  {
    id: 'bday-2',
    category: 'birthday',
    name: 'Birthday Cake Delight',
    imageUrl: 'https://picsum.photos/seed/bday2/400/600',
    description: 'Sweet birthday cake with candles',
  },

  // Christmas Cards
  {
    id: 'xmas-1',
    category: 'christmas',
    name: 'Snowy Christmas Tree',
    imageUrl: 'https://picsum.photos/seed/xmas1/400/600',
    description: 'Winter wonderland with decorated tree',
  },
  {
    id: 'xmas-2',
    category: 'christmas',
    name: 'Santa & Reindeer',
    imageUrl: 'https://picsum.photos/seed/xmas2/400/600',
    description: 'Classic Santa Claus design',
  },

  // Thank You Cards
  {
    id: 'thanks-1',
    category: 'thankyou',
    name: 'Floral Thank You',
    imageUrl: 'https://picsum.photos/seed/thanks1/400/600',
    description: 'Beautiful flowers with gratitude message',
  },
  {
    id: 'thanks-2',
    category: 'thankyou',
    name: 'Simple Elegance',
    imageUrl: 'https://picsum.photos/seed/thanks2/400/600',
    description: 'Minimalist thank you design',
  },

  // Congratulations Cards
  {
    id: 'congrats-1',
    category: 'congratulations',
    name: 'Celebration Confetti',
    imageUrl: 'https://picsum.photos/seed/congrats1/400/600',
    description: 'Festive confetti celebration',
  },
  {
    id: 'congrats-2',
    category: 'congratulations',
    name: 'Achievement Stars',
    imageUrl: 'https://picsum.photos/seed/congrats2/400/600',
    description: 'Stars and success theme',
  },

  // Get Well Soon Cards
  {
    id: 'getwell-1',
    category: 'getwell',
    name: 'Sunshine & Flowers',
    imageUrl: 'https://picsum.photos/seed/getwell1/400/600',
    description: 'Bright and cheerful design',
  },
  {
    id: 'getwell-2',
    category: 'getwell',
    name: 'Healing Thoughts',
    imageUrl: 'https://picsum.photos/seed/getwell2/400/600',
    description: 'Calming and peaceful design',
  },
]

export const cardCategories = [
  {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎂',
    description: 'Celebrate another year',
  },
  {
    id: 'christmas',
    name: 'Christmas',
    icon: '🎄',
    description: 'Season\'s greetings',
  },
  {
    id: 'thankyou',
    name: 'Thank You',
    icon: '🙏',
    description: 'Express gratitude',
  },
  {
    id: 'congratulations',
    name: 'Congratulations',
    icon: '🎉',
    description: 'Celebrate achievements',
  },
  {
    id: 'getwell',
    name: 'Get Well Soon',
    icon: '💐',
    description: 'Send healing wishes',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✨',
    description: 'Upload your own design',
  },
]

export const getTemplatesByCategory = (category) => {
  if (category === 'custom') return []
  return cardTemplates.filter((template) => template.category === category)
}
