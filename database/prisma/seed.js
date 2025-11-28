const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...');
  await prisma.orderAddOn.deleteMany();
  await prisma.order.deleteMany();
  await prisma.addOn.deleteMany();
  await prisma.cardTemplate.deleteMany();
  await prisma.mailerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.legacyLetter.deleteMany();
  await prisma.payout.deleteMany();

  // Create Users
  console.log('Creating users...');
  const senderUser = await prisma.user.create({
    data: {
      clerkId: 'clerk_sender_test_123',
      email: 'sender@example.com',
      firstName: 'John',
      lastName: 'Sender',
      phone: '+15125551234',
      role: 'SENDER',
    },
  });

  const mailerUser = await prisma.user.create({
    data: {
      clerkId: 'clerk_mailer_test_456',
      email: 'mailer@example.com',
      firstName: 'Jane',
      lastName: 'Mailer',
      phone: '+15125555678',
      role: 'MAILER',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'clerk_admin_test_789',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+15125559999',
      role: 'ADMIN',
    },
  });

  console.log('Users created:', { senderUser: senderUser.email, mailerUser: mailerUser.email, adminUser: adminUser.email });

  // Create Mailer Profile
  console.log('Creating mailer profile...');
  const mailerProfile = await prisma.mailerProfile.create({
    data: {
      userId: mailerUser.id,
      latitude: 30.2672,
      longitude: -97.7431,
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      radiusMiles: 15,
      isActive: true,
      isVerified: true,
      rating: 4.8,
      totalRatings: 25,
      completedJobs: 20,
      stripeAccountId: 'acct_test_mailer_123',
      stripeOnboarded: true,
    },
  });

  console.log('Mailer profile created:', mailerProfile.city);

  // Create Card Templates
  console.log('Creating card templates...');
  const cardTemplates = await Promise.all([
    // Birthday Templates
    prisma.cardTemplate.create({
      data: {
        name: 'Birthday Balloons',
        description: 'Colorful balloons for a festive birthday celebration',
        category: 'BIRTHDAY',
        imageUrl: 'https://picsum.photos/seed/birthday1/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/birthday1/200/300',
        basePriceCents: 700,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.cardTemplate.create({
      data: {
        name: 'Elegant Birthday',
        description: 'Sophisticated gold and black birthday design',
        category: 'BIRTHDAY',
        imageUrl: 'https://picsum.photos/seed/birthday2/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/birthday2/200/300',
        basePriceCents: 800,
        isActive: true,
        sortOrder: 2,
      },
    }),
    // Christmas Templates
    prisma.cardTemplate.create({
      data: {
        name: 'Traditional Christmas',
        description: 'Classic red and green holiday card with Santa',
        category: 'CHRISTMAS',
        imageUrl: 'https://picsum.photos/seed/christmas1/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/christmas1/200/300',
        basePriceCents: 750,
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.cardTemplate.create({
      data: {
        name: 'Modern Christmas',
        description: 'Minimalist winter wonderland design',
        category: 'CHRISTMAS',
        imageUrl: 'https://picsum.photos/seed/christmas2/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/christmas2/200/300',
        basePriceCents: 750,
        isActive: true,
        sortOrder: 4,
      },
    }),
    // Thank You Templates
    prisma.cardTemplate.create({
      data: {
        name: 'Simple Thanks',
        description: 'Clean and elegant thank you card',
        category: 'THANK_YOU',
        imageUrl: 'https://picsum.photos/seed/thankyou1/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/thankyou1/200/300',
        basePriceCents: 650,
        isActive: true,
        sortOrder: 5,
      },
    }),
    prisma.cardTemplate.create({
      data: {
        name: 'Floral Thanks',
        description: 'Beautiful floral thank you design',
        category: 'THANK_YOU',
        imageUrl: 'https://picsum.photos/seed/thankyou2/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/thankyou2/200/300',
        basePriceCents: 700,
        isActive: true,
        sortOrder: 6,
      },
    }),
    // Sympathy Templates
    prisma.cardTemplate.create({
      data: {
        name: 'Peaceful Sympathy',
        description: 'Gentle and comforting sympathy card',
        category: 'SYMPATHY',
        imageUrl: 'https://picsum.photos/seed/sympathy1/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/sympathy1/200/300',
        basePriceCents: 700,
        isActive: true,
        sortOrder: 7,
      },
    }),
    prisma.cardTemplate.create({
      data: {
        name: 'Heartfelt Sympathy',
        description: 'Thoughtful condolence card with white lilies',
        category: 'SYMPATHY',
        imageUrl: 'https://picsum.photos/seed/sympathy2/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/sympathy2/200/300',
        basePriceCents: 700,
        isActive: true,
        sortOrder: 8,
      },
    }),
    // Congratulations Templates
    prisma.cardTemplate.create({
      data: {
        name: 'Celebration Confetti',
        description: 'Festive congratulations with confetti',
        category: 'CONGRATULATIONS',
        imageUrl: 'https://picsum.photos/seed/congrats1/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/congrats1/200/300',
        basePriceCents: 700,
        isActive: true,
        sortOrder: 9,
      },
    }),
    prisma.cardTemplate.create({
      data: {
        name: 'Achievement Unlocked',
        description: 'Modern congratulations for accomplishments',
        category: 'CONGRATULATIONS',
        imageUrl: 'https://picsum.photos/seed/congrats2/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/congrats2/200/300',
        basePriceCents: 700,
        isActive: true,
        sortOrder: 10,
      },
    }),
    // Custom Templates
    prisma.cardTemplate.create({
      data: {
        name: 'Blank Canvas',
        description: 'Simple white card for custom messages',
        category: 'CUSTOM',
        imageUrl: 'https://picsum.photos/seed/custom1/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/custom1/200/300',
        basePriceCents: 600,
        isActive: true,
        sortOrder: 11,
      },
    }),
    prisma.cardTemplate.create({
      data: {
        name: 'Artistic Border',
        description: 'Decorative border for personalized messages',
        category: 'CUSTOM',
        imageUrl: 'https://picsum.photos/seed/custom2/400/600',
        thumbnailUrl: 'https://picsum.photos/seed/custom2/200/300',
        basePriceCents: 650,
        isActive: true,
        sortOrder: 12,
      },
    }),
  ]);

  console.log(`Created ${cardTemplates.length} card templates`);

  // Create Add-Ons
  console.log('Creating add-ons...');
  const addOns = await Promise.all([
    prisma.addOn.create({
      data: {
        name: 'Local Flowers',
        description: 'Fresh bouquet from a local florist',
        priceCents: 1500,
        imageUrl: 'https://picsum.photos/seed/addon-flowers/300/300',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.addOn.create({
      data: {
        name: 'Box of Chocolates',
        description: 'Gourmet chocolate assortment',
        priceCents: 1200,
        imageUrl: 'https://picsum.photos/seed/addon-chocolates/300/300',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.addOn.create({
      data: {
        name: 'Gift Card',
        description: '$25 gift card to popular retailers',
        priceCents: 2500,
        imageUrl: 'https://picsum.photos/seed/addon-giftcard/300/300',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.addOn.create({
      data: {
        name: 'Balloon Bouquet',
        description: 'Colorful helium balloon arrangement',
        priceCents: 1000,
        imageUrl: 'https://picsum.photos/seed/addon-balloons/300/300',
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.addOn.create({
      data: {
        name: 'Calligraphy Writing',
        description: 'Professional calligraphy for your message',
        priceCents: 500,
        imageUrl: 'https://picsum.photos/seed/addon-calligraphy/300/300',
        isActive: true,
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`Created ${addOns.length} add-ons`);

  // Create Test Orders
  console.log('Creating test orders...');

  // Helper function to generate order number
  const generateOrderNumber = () => {
    return `ML${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  // Order 1: PENDING
  const order1 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: 'PENDING',
      senderId: senderUser.id,
      cardType: 'BIRTHDAY',
      cardTemplateId: cardTemplates[0].id,
      message: 'Happy Birthday! Wishing you all the best on your special day!',
      senderName: 'John Sender',
      recipientName: 'Sarah Smith',
      deliveryAddress: '456 Oak Ave',
      deliveryCity: 'Austin',
      deliveryState: 'TX',
      deliveryZip: '78702',
      latitude: 30.2711,
      longitude: -97.7437,
      basePriceCents: 700,
      deliveryFeeCents: 300,
      addOnsTotalCents: 0,
      totalPriceCents: 1000,
      platformFeeCents: 150,
      mailerPayoutCents: 850,
      deliveryType: 'STANDARD',
      isPaid: false,
    },
  });

  // Order 2: PAID
  const order2 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: 'PAID',
      senderId: senderUser.id,
      cardType: 'THANK_YOU',
      cardTemplateId: cardTemplates[4].id,
      message: 'Thank you so much for your kindness and support!',
      senderName: 'John Sender',
      recipientName: 'Mike Johnson',
      deliveryAddress: '789 Elm St',
      deliveryCity: 'Austin',
      deliveryState: 'TX',
      deliveryZip: '78703',
      latitude: 30.2850,
      longitude: -97.7550,
      basePriceCents: 650,
      deliveryFeeCents: 300,
      addOnsTotalCents: 1200,
      totalPriceCents: 2150,
      platformFeeCents: 320,
      mailerPayoutCents: 1830,
      deliveryType: 'STANDARD',
      isPaid: true,
      stripePaymentIntentId: 'pi_test_123456789',
      stripePaidAt: new Date(),
    },
  });

  // Add chocolate add-on to order 2
  await prisma.orderAddOn.create({
    data: {
      orderId: order2.id,
      addOnId: addOns[1].id,
      priceCents: 1200,
    },
  });

  // Order 3: ASSIGNED
  const order3 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: 'ASSIGNED',
      senderId: senderUser.id,
      mailerId: mailerProfile.id,
      assignedAt: new Date(),
      cardType: 'CONGRATULATIONS',
      cardTemplateId: cardTemplates[8].id,
      message: 'Congratulations on your graduation! So proud of you!',
      senderName: 'John Sender',
      recipientName: 'Emily Davis',
      deliveryAddress: '321 Pine Rd',
      deliveryCity: 'Austin',
      deliveryState: 'TX',
      deliveryZip: '78704',
      latitude: 30.2500,
      longitude: -97.7500,
      basePriceCents: 700,
      deliveryFeeCents: 500,
      addOnsTotalCents: 1500,
      totalPriceCents: 2700,
      platformFeeCents: 405,
      mailerPayoutCents: 2295,
      deliveryType: 'RUSH',
      isPaid: true,
      stripePaymentIntentId: 'pi_test_987654321',
      stripePaidAt: new Date(),
    },
  });

  // Add flowers to order 3
  await prisma.orderAddOn.create({
    data: {
      orderId: order3.id,
      addOnId: addOns[0].id,
      priceCents: 1500,
    },
  });

  // Order 4: IN_TRANSIT
  const order4 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: 'IN_TRANSIT',
      senderId: senderUser.id,
      mailerId: mailerProfile.id,
      assignedAt: new Date(Date.now() - 3600000), // 1 hour ago
      cardType: 'SYMPATHY',
      cardTemplateId: cardTemplates[6].id,
      message: 'Our deepest condolences during this difficult time. You are in our thoughts.',
      senderName: 'John Sender',
      recipientName: 'Robert Wilson',
      deliveryAddress: '654 Maple Dr',
      deliveryCity: 'Austin',
      deliveryState: 'TX',
      deliveryZip: '78705',
      latitude: 30.2900,
      longitude: -97.7400,
      basePriceCents: 700,
      deliveryFeeCents: 300,
      addOnsTotalCents: 0,
      totalPriceCents: 1000,
      platformFeeCents: 150,
      mailerPayoutCents: 850,
      deliveryType: 'STANDARD',
      isPaid: true,
      stripePaymentIntentId: 'pi_test_456789123',
      stripePaidAt: new Date(Date.now() - 7200000),
      printedAt: new Date(Date.now() - 3600000),
      inTransitAt: new Date(Date.now() - 1800000),
    },
  });

  // Order 5: DELIVERED
  const order5 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: 'DELIVERED',
      senderId: senderUser.id,
      mailerId: mailerProfile.id,
      assignedAt: new Date(Date.now() - 86400000), // 1 day ago
      cardType: 'CHRISTMAS',
      cardTemplateId: cardTemplates[2].id,
      message: 'Merry Christmas! Wishing you joy and happiness this holiday season!',
      senderName: 'John Sender',
      recipientName: 'Lisa Anderson',
      deliveryAddress: '987 Cedar Ln',
      deliveryCity: 'Austin',
      deliveryState: 'TX',
      deliveryZip: '78701',
      latitude: 30.2700,
      longitude: -97.7450,
      basePriceCents: 750,
      deliveryFeeCents: 300,
      addOnsTotalCents: 2500,
      totalPriceCents: 3550,
      platformFeeCents: 530,
      mailerPayoutCents: 3020,
      deliveryType: 'SCHEDULED',
      scheduledDate: new Date(Date.now() - 43200000),
      isPaid: true,
      stripePaymentIntentId: 'pi_test_111222333',
      stripePaidAt: new Date(Date.now() - 86400000),
      printedAt: new Date(Date.now() - 43200000),
      inTransitAt: new Date(Date.now() - 21600000),
      deliveredAt: new Date(Date.now() - 3600000),
      deliveryPhotoUrl: 'https://picsum.photos/seed/delivered/800/600',
      deliveryNotes: 'Left on front porch as requested',
      mailerRating: 5,
      ratingComment: 'Excellent service! Very professional and on time.',
    },
  });

  // Add gift card and balloons to order 5
  await prisma.orderAddOn.createMany({
    data: [
      {
        orderId: order5.id,
        addOnId: addOns[2].id,
        priceCents: 2500,
      },
    ],
  });

  console.log(`Created 5 test orders`);

  // Create a Legacy Letter
  console.log('Creating legacy letter...');
  await prisma.legacyLetter.create({
    data: {
      userId: senderUser.id,
      recipientName: 'Future Grandchild',
      recipientEmail: 'future@example.com',
      deliveryAddress: '123 Future St',
      deliveryCity: 'Austin',
      deliveryState: 'TX',
      deliveryZip: '78701',
      message: 'Dear future grandchild, this is a message from the past...',
      deliverOn: new Date(Date.now() + 31536000000), // 1 year from now
      reminderSent: false,
      isDelivered: false,
    },
  });

  console.log('Legacy letter created');

  // Create a test payout
  console.log('Creating test payout...');
  await prisma.payout.create({
    data: {
      mailerId: mailerProfile.id,
      amountCents: 3020,
      stripeTransferId: 'tr_test_123456',
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  console.log('Test payout created');

  console.log('Seed completed successfully!');
  console.log('\nSummary:');
  console.log('- 3 Users (Sender, Mailer, Admin)');
  console.log('- 1 Mailer Profile (Austin, TX)');
  console.log('- 12 Card Templates');
  console.log('- 5 Add-ons');
  console.log('- 5 Orders (various statuses)');
  console.log('- 1 Legacy Letter');
  console.log('- 1 Payout');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
