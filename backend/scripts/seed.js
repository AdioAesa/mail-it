import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'Happy Birthday Balloons',
    category: 'BIRTHDAY',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 7.00,
    description: 'Colorful birthday card with balloons and celebration theme'
  },
  {
    name: 'Birthday Cake Celebration',
    category: 'BIRTHDAY',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 7.00,
    description: 'Classic birthday card with birthday cake design'
  },
  {
    name: 'Elegant Birthday Wishes',
    category: 'BIRTHDAY',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 7.00,
    description: 'Sophisticated birthday card with elegant design'
  },
  {
    name: 'Merry Christmas Tree',
    category: 'CHRISTMAS',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 8.00,
    description: 'Festive Christmas card with decorated tree'
  },
  {
    name: 'Winter Wonderland',
    category: 'CHRISTMAS',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 8.00,
    description: 'Beautiful winter scene Christmas card'
  },
  {
    name: 'Santa and Reindeer',
    category: 'CHRISTMAS',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 8.00,
    description: 'Fun Christmas card featuring Santa and his reindeer'
  },
  {
    name: 'Heartfelt Thanks',
    category: 'THANK_YOU',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 6.00,
    description: 'Simple and elegant thank you card'
  },
  {
    name: 'Grateful Heart',
    category: 'THANK_YOU',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 6.00,
    description: 'Warm thank you card with heart design'
  },
  {
    name: 'Thank You Flowers',
    category: 'THANK_YOU',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 6.00,
    description: 'Beautiful floral thank you card'
  }
];

async function seed() {
  console.log('Starting seed...');

  try {
    // Clear existing templates
    await prisma.cardTemplate.deleteMany({});
    console.log('Cleared existing templates');

    // Create new templates
    for (const template of templates) {
      const created = await prisma.cardTemplate.create({
        data: template
      });
      console.log(`Created template: ${created.name}`);
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
