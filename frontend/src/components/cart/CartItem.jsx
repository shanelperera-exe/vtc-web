import { Link } from 'react-router-dom'
import QuantityInput from '../ui/QuantityInput'
import { useCart } from '../../context/CartContext.jsx'

function formatLKR(amount) {
    try {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(amount) || 0)
    } catch {
        return `LKR ${amount}`
    }
}

export default function CartItem({ product, onRemove }) {
    const { updateQuantity } = useCart()
    // Prefer mapped fields; fallback to parsing variationKey if needed
    let color = product?.color
    let size = product?.size
    if ((!color || !size) && product?.variationKey) {
        try {
            const vk = String(product.variationKey)
            const pairs = vk.split(/[|;,]/).map(s => s.trim()).filter(Boolean)
            const map = {}
            pairs.forEach(p => {
                const [rawK, ...rest] = p.split(/[=:]/)
                if (!rawK) return
                const val = rest.join(':').trim()
                const key = rawK.trim()
                if (key) map[key] = val
            })
            const pkeys = Object.keys(map)
            const findParsed = (needle) => pkeys.find(k => {
                const lk = k?.toLowerCase?.() || ''
                return lk === needle || lk.includes(needle)
            })
            if (!color) {
                const pk = findParsed('color') || findParsed('colour')
                if (pk) color = map[pk]
            }
            if (!size) {
                const pk = findParsed('size')
                if (pk) size = map[pk]
            }
        } catch { }
    }
    const price = formatLKR(product?.price)

    return (
        <>
            <div className="size-27 shrink-0 overflow-hidden border-2 border-black p-1">
                <img alt={product?.name} src={product?.image} className="size-full object-cover" />
            </div>
            <div className="ml-4 flex flex-1 flex-col">
                <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3 className="pr-2">
                            <Link to={`/product/${product?.sku || product?.id}`} className="hover:text-[#04a74b]">
                                {product?.name}
                            </Link>
                        </h3>
                        <p className="ml-4 shrink-0">{price}</p>
                    </div>
                    {(color || size) && (
                        <p className="mt-0 text-[12px] text-gray-500">
                            {color && <span>Color: {color}</span>}
                            {color && size && <span> | </span>}
                            {size && <span>Size: {size}</span>}
                        </p>
                    )}
                </div>
                <div className="mt-2 flex flex-1 items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-800 hidden sm:inline text-[12px]">Quantity</span>
                        <div className="ml-1">
                            <QuantityInput
                                className="qty-large-number qty-compact"
                                inputClassName="!w-20 !h-8 text-md"
                                value={product?.quantity || 1}
                                onChange={(v) => updateQuantity(product.id, v)}
                                min={1}
                                max={15}
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => onRemove && onRemove(product)}
                            className="font-medium text-green-700 hover:text-green-800 text-xs"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

