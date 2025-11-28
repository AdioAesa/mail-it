import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/templates
 * List all card templates
 */
router.get('/', asyncHandler(async (req, res) => {
  const { category } = req.query;

  const where = { isActive: true };

  if (category) {
    where.category = category;
  }

  const templates = await prisma.cardTemplate.findMany({
    where,
    orderBy: {
      name: 'asc'
    }
  });

  res.json({
    success: true,
    templates: templates.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      imageUrl: template.imageUrl,
      price: template.price,
      description: template.description
    }))
  });
}));

/**
 * GET /api/templates/:id
 * Get template details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const template = await prisma.cardTemplate.findUnique({
    where: { id }
  });

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }

  if (!template.isActive) {
    return res.status(404).json({
      success: false,
      error: 'Template not available'
    });
  }

  res.json({
    success: true,
    template: {
      id: template.id,
      name: template.name,
      category: template.category,
      imageUrl: template.imageUrl,
      price: template.price,
      description: template.description
    }
  });
}));

export default router;
