import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      price: Number
    }
  ],
  fullname: String,
  phone: String,
  address: String,
  payment: String,
  totalAmount: Number,
  status: {
    type: String,
    default: 'Chờ xác nhận'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
