import { useParams } from 'react-router-dom';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();

  return (
    <section className="container">
      <h1>Pedido recibido</h1>
      <p>Tu pedido #{orderId} ha sido registrado.</p>
    </section>
  );
}
