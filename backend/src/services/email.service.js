import { Resend } from "resend";
import {
    getOrderConfirmationTemplate,
    getOrderStatusUpdateTemplate,
    getPasswordResetTemplate
} from "../utils/emailTemplates.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER_EMAIL = "Qala <onboarding@qalaofficial.com>";

const sendEmail = async ({ to, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to,
            subject,
            html,
        });

        if (error) {
            console.error(`Email sending failed to ${to}:`, error.message);
            return;
        }

        console.log(`Email sent successfully to ${to} (ID: ${data?.id})`);
    } catch (error) {
        console.error(`Email sending failed to ${to}:`, error.message);
        // We do NOT throw the error to prevent breaking the main transaction flow
    }
};

export const sendOrderConfirmationEmail = async (order) => {
    await sendEmail({
        to: order.customerInfo.email,
        subject: `Order Confirmation - #${order.orderNumber}`,
        html: getOrderConfirmationTemplate(order)
    });
};

export const sendAdminNewOrderNotification = async (order) => {
    const adminEmail = process.env.ADMIN_EMAIL || "muhammadahmed.zahid2002@gmail.com";
    await sendEmail({
        to: adminEmail,
        subject: `New Order Received - #${order.orderNumber}`,
        html: `<p>A new order (#${order.orderNumber}) has been placed by ${order.customerInfo.name} for Rs. ${order.pricing.total}.</p>`
    });
};

export const sendOrderStatusEmail = async (order) => {
    await sendEmail({
        to: order.customerInfo.email,
        subject: `Update on Order #${order.orderNumber}`,
        html: getOrderStatusUpdateTemplate(order)
    });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: getPasswordResetTemplate(resetUrl)
    });
};