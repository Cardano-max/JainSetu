import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateProductInput, CreateOrderInput } from '../schemas/store.schema.js';

export class StoreController {
  // Get Categories
  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await prisma.storeCategory.findMany({
        where: { isActive: true, parentId: null },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      res.json({ success: true, categories });
    } catch (error) {
      next(error);
    }
  };

  // Get Products
  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = '1',
        limit = '20',
        categoryId,
        search,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const where: any = { isActive: true };

      if (categoryId) where.categoryId = categoryId;

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }

      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder;

      const [products, total] = await Promise.all([
        prisma.storeProduct.findMany({
          where,
          include: { category: true },
          orderBy: [{ isFeatured: 'desc' }, orderBy],
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.storeProduct.count({ where }),
      ]);

      res.json({
        success: true,
        products,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Featured Products
  getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = '10' } = req.query;

      const products = await prisma.storeProduct.findMany({
        where: { isActive: true, isFeatured: true },
        include: { category: true },
        take: parseInt(limit as string),
      });

      res.json({ success: true, products });
    } catch (error) {
      next(error);
    }
  };

  // Get Product by ID
  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const product = await prisma.storeProduct.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Increment view count
      await prisma.storeProduct.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      // Get related products
      const relatedProducts = await prisma.storeProduct.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: id },
          isActive: true,
        },
        take: 4,
      });

      res.json({ success: true, product, relatedProducts });
    } catch (error) {
      next(error);
    }
  };

  // Create Order
  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = req.body as CreateOrderInput;

      // Get products and calculate prices
      const productIds = data.items.map((i) => i.productId);
      const products = await prisma.storeProduct.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== data.items.length) {
        throw new AppError('Some products are not available', 400);
      }

      // Calculate totals
      let subtotal = 0;
      let shippingCharge = 0;

      const orderItems = data.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;

        if (product.quantity < item.quantity) {
          throw new AppError(`${product.name} is out of stock`, 400);
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        if (!product.isFreeShipping && product.shippingCharge) {
          shippingCharge += product.shippingCharge;
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          totalPrice: itemTotal,
        };
      });

      // Generate order number
      const orderNumber = `JS${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create order
      const order = await prisma.storeOrder.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          shippingCharge,
          totalAmount: subtotal + shippingCharge,
          shippingName: data.shippingName,
          shippingPhone: data.shippingPhone,
          shippingAddress: data.shippingAddress,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          shippingPincode: data.shippingPincode,
          notes: data.notes,
          paymentMethod: data.paymentMethod,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // Update product quantities
      for (const item of data.items) {
        await prisma.storeProduct.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          title: 'Order Placed',
          body: `Your order #${orderNumber} has been placed successfully.`,
          type: 'store_order',
          entityType: 'order',
          entityId: order.id,
        },
      });

      res.status(201).json({ success: true, order });
    } catch (error) {
      next(error);
    }
  };

  // Get My Orders
  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { status, page = '1', limit = '20' } = req.query;

      const where: any = { userId };
      if (status) where.status = status;

      const [orders, total] = await Promise.all([
        prisma.storeOrder.findMany({
          where,
          include: {
            items: {
              include: { product: { select: { name: true, images: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.storeOrder.count({ where }),
      ]);

      res.json({
        success: true,
        orders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Order by ID
  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const order = await prisma.storeOrder.findFirst({
        where: { id, userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      res.json({ success: true, order });
    } catch (error) {
      next(error);
    }
  };

  // Cancel Order
  cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const order = await prisma.storeOrder.findFirst({
        where: { id, userId },
        include: { items: true },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new AppError('Cannot cancel this order', 400);
      }

      // Restore product quantities
      for (const item of order.items) {
        await prisma.storeProduct.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        });
      }

      const updated = await prisma.storeOrder.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      res.json({ success: true, order: updated });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Create Category
  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, icon, description, parentId, sortOrder } = req.body;

      const category = await prisma.storeCategory.create({
        data: { name, icon, description, parentId, sortOrder },
      });

      res.status(201).json({ success: true, category });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update Category
  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, icon, description, parentId, sortOrder, isActive } = req.body;

      const category = await prisma.storeCategory.update({
        where: { id },
        data: { name, icon, description, parentId, sortOrder, isActive },
      });

      res.json({ success: true, category });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Create Product
  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateProductInput;

      const product = await prisma.storeProduct.create({
        data,
        include: { category: true },
      });

      res.status(201).json({ success: true, product });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update Product
  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as CreateProductInput;

      const product = await prisma.storeProduct.update({
        where: { id },
        data,
        include: { category: true },
      });

      res.json({ success: true, product });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Delete Product
  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await prisma.storeProduct.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get All Orders
  getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, page = '1', limit = '50' } = req.query;

      const where: any = {};
      if (status) where.status = status;

      const [orders, total] = await Promise.all([
        prisma.storeOrder.findMany({
          where,
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
            items: {
              include: { product: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.storeOrder.count({ where }),
      ]);

      res.json({
        success: true,
        orders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update Order Status
  updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, trackingNumber } = req.body;

      const order = await prisma.storeOrder.update({
        where: { id },
        data: {
          status,
          trackingNumber,
          ...(status === 'SHIPPED' && { shippedAt: new Date() }),
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'Order Update',
          body: `Your order #${order.orderNumber} status: ${status}`,
          type: 'order_update',
          entityType: 'order',
          entityId: id,
        },
      });

      res.json({ success: true, order });
    } catch (error) {
      next(error);
    }
  };
}
