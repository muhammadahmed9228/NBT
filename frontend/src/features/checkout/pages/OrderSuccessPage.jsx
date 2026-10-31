import { useLocation, Link, Navigate } from "react-router-dom";

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber;

  if (!orderNumber) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h2 className="text-4xl font-serif font-bold">Thank You!</h2>
      <p className="text-neutral-600 text-lg">Your order has been placed successfully.</p>
      
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 my-8 inline-block min-w-[300px]">
        <p className="text-sm text-neutral-500 mb-1">Order Number</p>
        <p className="text-2xl font-bold tracking-wider">{orderNumber}</p>
      </div>

      <p className="text-sm text-neutral-500 mb-8 max-w-md mx-auto">
        We will process your order soon. You will receive a confirmation email shortly.
      </p>

      <Link to="/products" className="inline-block bg-neutral-900 text-white px-8 py-3 rounded-md hover:bg-neutral-800 transition font-medium">
        Continue Shopping
      </Link>
    </div>
  );
}