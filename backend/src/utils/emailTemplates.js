export const getOrderConfirmationTemplate = (order) => `
  <div style="font-family: Arial, sans-serif; max-w-xl mx-auto; color: #333;">
    <h2 style="color: #111;">Order Confirmation</h2>
    <p>Hi ${order.customerInfo.name},</p>
    <p>Thank you for shopping with NBT. Your order <strong>#${order.orderNumber}</strong> has been received successfully.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f3f4f6; text-align: left;">
        <th style="padding: 10px; border: 1px solid #e5e7eb;">Item</th>
        <th style="padding: 10px; border: 1px solid #e5e7eb;">Qty</th>
        <th style="padding: 10px; border: 1px solid #e5e7eb;">Price</th>
      </tr>
      ${order.items.map(item => `
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">
            ${item.name} <br>
            <small style="color: #6b7280;">${item.color} | Size: ${item.size}</small>
          </td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.quantity}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Rs. ${item.unitPrice}</td>
        </tr>
      `).join('')}
    </table>
    
    <p><strong>Subtotal:</strong> Rs. ${order.pricing.subtotal}</p>
    <p><strong>Shipping:</strong> Rs. ${order.pricing.shippingCost}</p>
    <p><strong>Total:</strong> Rs. ${order.pricing.total} (${order.paymentMethod})</p>
    
    <p>We will notify you once your order has been shipped.</p>
  </div>
`;

export const getOrderStatusUpdateTemplate = (order) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #111;">Order Status Update</h2>
    <p>Hi ${order.customerInfo.name},</p>
    <p>The status of your order <strong>#${order.orderNumber}</strong> has been updated to: <strong style="color: #d97706;">${order.status}</strong>.</p>
    <p>If you have any questions, feel free to reply to this email.</p>
  </div>
`;

export const getPasswordResetTemplate = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #111;">Password Reset Request</h2>
    <p>You recently requested to reset your password for your NBT account.</p>
    <p>Click the button below to reset it. This link will expire in 15 minutes.</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #111; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
    <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">If you did not request a password reset, please ignore this email.</p>
  </div>
`;