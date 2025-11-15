const { Category, Product, ProductImage, Cart, ProductStock } = require("../models")

const CartController = {

    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity, selectedColor, selectedSize } = req.body;

            const product = await Product.findByPk(productId, {
                attributes: ["id", "sizes", "colors"]
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const sizes = Array.isArray(product.sizes)
                ? product.sizes
                : JSON.parse(product.sizes || "[]");
            const colors = Array.isArray(product.colors)
                ? product.colors
                : JSON.parse(product.colors || "[]");

            const finalSize =
                selectedSize && sizes.includes(selectedSize) ? selectedSize : sizes[0];
            const finalColor =
                selectedColor && colors.includes(selectedColor) ? selectedColor : colors[0];

            if (!finalSize || !finalColor) {
                return res.status(400).json({
                    success: false,
                    message: "Product does not have valid size or color options"
                });
            }

            let cartItem = await Cart.findOne({
                where: {
                    userId,
                    productId
                }
            });

            if (cartItem) {
                return res.status(400).json({
                    success: false,
                    message: "Product already in cart"
                });
            } else {
                cartItem = await Cart.create({
                    userId,
                    productId,
                    quantity,
                    selectedColor: finalColor,
                    selectedSize: finalSize
                });

                return res.status(200).json({
                    success: true,
                    message: "Product added to cart successfully",
                    data: cartItem
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to add to cart"
            });
        }
    },

    async incrementQuantity(req, res) {
        try {
            const userId = req.user.id;
            const { productId, selectedColor, selectedSize } = req.body;

            const cartItem = await Cart.findOne({
                where: {
                    userId,
                    productId,
                    selectedColor,
                    selectedSize
                }
            });

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found in cart"
                });
            }

            cartItem.quantity += 1;
            await cartItem.save();

            return res.status(200).json({
                success: true,
                message: "Cart item quantity incremented",
                dat: cartItem
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to increment quantity"
            })
        }
    },

    async decrementQuantity(req, res) {
        try {
            const userId = req.user.id;
            const { productId, selectedColor, selectedSize } = req.body;

            const cartItem = await Cart.findOne({
                where: {
                    userId,
                    productId,
                    selectedColor,
                    selectedSize
                }
            });

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found in cart"
                });
            }

            cartItem.quantity -= 1;
            await cartItem.save();

            return res.status(200).json({
                success: true,
                message: "Cart item quantity decremented",
                data: cartItem
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to decrement quantity"
            })
        }
    },

    async removeFromCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, selectedColor, selectedSize } = req.body;

            const cartItem = await Cart.findOne({
                where: {
                    userId,
                    productId,
                    selectedColor,
                    selectedSize
                }
            });

            if (!cartItem) {
                return res.status(400).json({
                    success: false,
                    message: "Product not found in cart"
                });
            }

            await cartItem.destroy();

            return res.status(200).json({
                success: true,
                message: "Product removed from cart successfully"
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to remove product from cart"
            });
        }
    },

    async getCartItems(req, res) {
        try {

            const userId = req.user.id;

            const cartItems = await Cart.findAll({
                where: { userId },
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: [
                            "id",
                            "productName",
                            "model",
                            "sizes",
                            "colors",
                            "originalPrice",
                            "discountPercent",
                            "discountedPrice",
                            "categoryId",
                            "totalStock"
                        ],
                        include: [
                            {
                                model: ProductImage,
                                as: "images",
                                attributes: ["id", "image", "imageContentType"]
                            },
                            {
                                model: Category,
                                as: "category",
                                attributes: ["id", "name"]
                            },
                            {
                                model: ProductStock, // added for lowStockThreshold
                                as: "stocks",
                                attributes: ["lowStockThreshold"],
                                order: [["createdAt", "DESC"]],
                                limit: 1
                            }
                        ],

                    }
                ]
            });

            const formattedCartItems = cartItems.map(item => {
                const product = item.product;

                const totalStock = product.totalStock;
                const lowStockThreshold =
                    product.stocks && product.stocks[0]
                        ? product.stocks[0].lowStockThreshold
                        : null;

                let stockStatus = "noStockData";
                if (totalStock !== null && totalStock !== undefined) {
                    if (totalStock === 0) stockStatus = "outOfStock";
                    else if (lowStockThreshold && totalStock <= lowStockThreshold)
                        stockStatus = "lowStock";
                    else stockStatus = "inStock";
                }

                return {
                    id: item.id,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor,
                    selectedSize: item.selectedSize,
                    product: {
                        id: product.id,
                        productName: product.productName,
                        model: product.model,
                        sizes: product.sizes,
                        colors: product.colors,
                        originalPrice: product.originalPrice,
                        discountPercent: product.discountPercent,
                        discountedPrice: product.discountedPrice,
                        category: product.category,
                        images: product.images.map(img => ({
                            id: img.id,
                            productId: img.productId,
                            image: img.image
                                ? `data:${img.imageContentType};base64,${img.image.toString("base64")}`
                                : null
                        })),
                        stockStatus,
                        totalStock
                    }
                };
            });

            return res.status(200).json({
                success: true,
                message: "Cart items fetched successfully",
                data: formattedCartItems
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get cart items"
            });
        }
    },

}

module.exports = CartController;