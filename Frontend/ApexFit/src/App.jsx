import { Routes, Route } from "react-router-dom";
import PaymentSuccess from "./pages/Payment/PaymentSuccess"; 
import PaymentFailed from "./pages/Payment/Failure"; 
import PaymentForm from "./pages/Payment/PaymentForm"

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaymentForm />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/payment-failure" element={<PaymentFailed />} />
      <Route path="/payment-form" element={<PaymentForm />} />
    </Routes>
  );
}

export default App;
