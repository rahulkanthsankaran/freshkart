const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 },
      image: String
    }
  ],
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    pincode: String
  },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cod'], default: 'upi' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  orderStatus: {
    type: String,
    enum: ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Confirmed'
  },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
