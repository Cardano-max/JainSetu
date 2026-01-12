import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { useCartStore, useAuthStore } from '@/lib/store';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl?: string;
  stock: number;
  rating: number;
  reviewCount: number;
}

const CATEGORIES = ['All', 'Books', 'Puja Items', 'Clothing', 'Jewelry', 'Food'];

export default function StoreScreen() {
  const { isAuthenticated } = useAuthStore();
  const { items: cartItems, addItem, updateQuantity, removeItem, getTotal } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/store/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Demo data
      setProducts([
        {
          id: '1',
          name: 'Jain Agam Book Set',
          description: 'Complete set of Jain Agams with Hindi translation.',
          price: 2999,
          originalPrice: 3500,
          category: 'Books',
          stock: 15,
          rating: 4.8,
          reviewCount: 125,
        },
        {
          id: '2',
          name: 'Silver Puja Thali',
          description: 'Pure silver puja thali with traditional design.',
          price: 4500,
          category: 'Puja Items',
          stock: 8,
          rating: 4.7,
          reviewCount: 89,
        },
        {
          id: '3',
          name: 'White Dhoti Set',
          description: 'Premium quality white cotton dhoti for daily puja.',
          price: 899,
          originalPrice: 1200,
          category: 'Clothing',
          stock: 50,
          rating: 4.5,
          reviewCount: 67,
        },
        {
          id: '4',
          name: 'Navkar Mantra Pendant',
          description: 'Gold-plated pendant with Navkar Mantra engraving.',
          price: 1499,
          category: 'Jewelry',
          stock: 20,
          rating: 4.9,
          reviewCount: 156,
        },
        {
          id: '5',
          name: 'Sandalwood Incense Sticks',
          description: 'Pure sandalwood incense sticks for puja. Pack of 100.',
          price: 299,
          category: 'Puja Items',
          stock: 100,
          rating: 4.6,
          reviewCount: 230,
        },
        {
          id: '6',
          name: 'Dry Fruits Mix Box',
          description: 'Premium quality dry fruits mix. 500g box.',
          price: 799,
          originalPrice: 999,
          category: 'Food',
          stock: 30,
          rating: 4.7,
          reviewCount: 112,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts = products.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Store',
            headerRight: () => (
              <TouchableOpacity style={styles.cartButton}>
                <Ionicons name="cart-outline" size={24} color={colors.gray[700]} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Store',
          headerRight: () => (
            <TouchableOpacity style={styles.cartButton} onPress={() => setShowCart(true)}>
              <Ionicons name="cart-outline" size={24} color={colors.gray[700]} />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard}>
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="cube" size={40} color={colors.saffron[400]} />
              {item.originalPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.productContent}>
              <Text style={styles.productCategory}>{item.category}</Text>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={colors.yellow[500]} />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewCount}>({item.reviewCount})</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>
                    {formatPrice(item.originalPrice)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(item)}
              >
                <Ionicons name="add" size={18} color={colors.white} />
                <Text style={styles.addToCartText}>Add</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      {/* Cart Modal */}
      <Modal
        visible={showCart}
        animationType="slide"
        onRequestClose={() => setShowCart(false)}
      >
        <SafeAreaView style={styles.cartModal}>
          <View style={styles.cartHeader}>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <Ionicons name="close" size={24} color={colors.gray[700]} />
            </TouchableOpacity>
            <Text style={styles.cartTitle}>Your Cart</Text>
            <View style={{ width: 24 }} />
          </View>

          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={64} color={colors.gray[300]} />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => setShowCart(false)}
              >
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView style={styles.cartItems}>
                {cartItems.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemImage}>
                      <Ionicons name="cube" size={30} color={colors.saffron[400]} />
                    </View>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        {formatPrice(item.price)}
                      </Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeItem(item.id);
                          }
                        }}
                      >
                        <Ionicons name="remove" size={18} color={colors.saffron[600]} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={18} color={colors.saffron[600]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.cartFooter}>
                <View style={styles.cartTotal}>
                  <Text style={styles.cartTotalLabel}>Total</Text>
                  <Text style={styles.cartTotalValue}>{formatPrice(getTotal())}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={() => {
                    if (!isAuthenticated) {
                      Alert.alert('Login Required', 'Please login to proceed to checkout');
                      return;
                    }
                    Alert.alert('Checkout', 'Proceeding to payment...');
                  }}
                >
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.saffron[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.saffron[600],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  categoriesContainer: {
    maxHeight: 50,
    marginTop: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  categoryChipActive: {
    backgroundColor: colors.saffron[600],
    borderColor: colors.saffron[600],
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImagePlaceholder: {
    height: 120,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.red[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  productContent: {
    padding: 12,
  },
  productCategory: {
    fontSize: 11,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: 4,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[900],
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.gray[500],
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },
  originalPrice: {
    fontSize: 12,
    color: colors.gray[500],
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  addToCartText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 16,
  },
  cartModal: {
    flex: 1,
    backgroundColor: colors.white,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 16,
  },
  continueShoppingButton: {
    backgroundColor: colors.saffron[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  continueShoppingText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cartItems: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  cartItemPrice: {
    fontSize: 14,
    color: colors.saffron[600],
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.saffron[600],
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginHorizontal: 12,
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 16,
    color: colors.gray[600],
  },
  cartTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
