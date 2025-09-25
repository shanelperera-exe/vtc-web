import { useCart } from '../../context/CartContext.jsx'
import { useNotifications } from './notificationsContext.js'

const AddToCartBtn = ({ product, quantity = 1 }) => {
  const { addToCart } = useCart()
  const { notify } = useNotifications()

  const handleAdd = () => {
    addToCart(product, quantity)
    const name = product?.name ?? 'Item'
    notify({ type: 'cart', text: `Added ${quantity} × ${name} to cart`, ttl: 3500 })
  }
  return (
    <div className="bg-white flex items-start">
      <div className="group relative h-fit w-fit">
        <div
          className="absolute inset-0 z-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 pointer-events-none"
          // style={{
          //   clipPath:
          //     'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0px 100%, 0px 0px)',
          // }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="relative z-10 cursor-pointer overflow-hidden font-medium text-base py-2 px-6 bg-neutral-600 text-white w-55 shimmer_shine__jD_i0 transition-all flex items-center justify-center gap-2 group-hover:-translate-x-1 group-hover:-translate-y-1 group-active:-translate-x-0 group-active:-translate-y-0"
          // style={{
          //   clipPath:
          //     'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0px 100%, 0px 0px)',
          // }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus" viewBox="0 0 16 16">
            <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/>
            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
          </svg>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default AddToCartBtn;