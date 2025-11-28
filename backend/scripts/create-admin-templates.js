import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to create or update card templates
 * Run with: node scripts/create-admin-templates.js
 */

async function createTemplates() {
  console.log('Creating/updating card templates...\n');

  const templates = [
    {
      name: 'Happy Birthday Balloons',
      category: 'BIRTHDAY',
      imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
      price: 7.00,
      description: 'Colorful birthday card with balloons and celebration theme'
    },
    {
      name: 'Birthday Cake Celebration',
      category: 'BIRTHDAY',
      imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800',
      price: 7.00,
      description: 'Classic birthday card with birthday cake design'
    },
    {
      name: 'Elegant Birthday Wishes',
      category: 'BIRTHDAY',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      price: 7.00,
      description: 'Sophisticated birthday card with elegant design'
    },
    {
      name: 'Merry Christmas Tree',
      category: 'CHRISTMAS',
      imageUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800',
      price: 8.00,
      description: 'Festive Christmas card with decorated tree'
    },
    {
      name: 'Winter Wonderland',
      category: 'CHRISTMAS',
      imageUrl: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
      price: 8.00,
      description: 'Beautiful winter scene Christmas card'
    },
    {
      name: 'Santa and Reindeer',
      category: 'CHRISTMAS',
      imageUrl: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800',
      price: 8.00,
      description: 'Fun Christmas card featuring Santa and his reindeer'
    },
    {
      name: 'Heartfelt Thanks',
      category: 'THANK_YOU',
      imageUrl: 'https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?w=800',
      price: 6.00,
      description: 'Simple and elegant thank you card'
    },
    {
      name: 'Grateful Heart',
      category: 'THANK_YOU',
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
      price: 6.00,
      description: 'Warm thank you card with heart design'
    },
    {
      name: 'Thank You Flowers',
      category: 'THANK_YOU',
      imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
      price: 6.00,
      description: 'Beautiful floral thank you card'
    }
  ];

  try {
    for (const template of templates) {
      const result = await prisma.cardTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template
      });
      console.log(`✓ ${result.name} (${result.category})`);
    }

    console.log(`\n✓ Successfully created/updated ${templates.length} templates`);
  } catch (error) {
    console.error('Error creating templates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTemplates();
