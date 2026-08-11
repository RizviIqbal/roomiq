import { useState } from 'react'
import { Button, Input, Select, Badge, EmptyState } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, AlertTriangle, RefreshCw, Package } from 'lucide-react'

const CATEGORIES = ['groceries','cleaning','toiletries','kitchen','other']
const CATEGORY_ICONS = { groceries:'🛒', cleaning:'🧴', toiletries:'🧻', kitchen:'🍳', other:'📦' }

export default function InventoryPanel({ houseId, items, onRefresh }) {
  const [showAdd, setShowAdd]   = useState(false)
  const [restockId, setRestockId] = useState(null)
  const [restockVal, setRestockVal] = useState('')
  const [busy, setBusy]         = useState(false)

  const [form, setForm] = useState({
    name:'', currentQuantity:'', unit:'', lowStockThreshold:'', category:'groceries'
  })

  const handleAdd = async () => {
    if (!form.name.trim() || form.currentQuantity === '' || form.lowStockThreshold === '') {
      toast.error('Fill all required fields'); return
    }
    setBusy(true)
    try {
      await api.post('/shopping/inventory', {
        houseId,
        name: form.name,
        currentQuantity: Number(form.currentQuantity),
        unit: form.unit,
        lowStockThreshold: Number(form.lowStockThreshold),
        category: form.category,
      })
      toast.success('Inventory item added')
      setForm({ name:'', currentQuantity:'', unit:'', lowStockThreshold:'', category: form.category })
      setShowAdd(false)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const handleRestock = async (itemId) => {
    if (restockVal === '') return
    setBusy(true)
    try {
      await api.put(`/shopping/inventory/${itemId}`, { currentQuantity: Number(restockVal) })
      toast.success('Stock updated')
      setRestockId(null)
      setRestockVal('')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const lowStockCount = items.filter(i => i.isLowStock).length

  return (
    <div>
      <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-accent-purple/10 to-transparent border border-accent-purple/20">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center shrink-0">
            <Package className="text-accent-purple" size={24} />
          </div>
          <div>
            <h3 className="text-white font-display font-medium text-xl mb-2">Shared Inventory</h3>
            <p className="text-primary-muted font-body text-base leading-relaxed max-w-2xl">
              Track household staples (like olive oil and toilet paper). Set minimum levels, and RoomiQ will alert the house before you run out, giving you time to add it to the Shopping List.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="font-label-caps text-[11px] tracking-[0.15em] text-primary-muted uppercase">
          {lowStockCount > 0 ? (
            <span className="flex items-center gap-2 text-accent-rose">
              <AlertTriangle size={14} /> {lowStockCount} item{lowStockCount>1?'s':''} low on stock
            </span>
          ) : 'All items well stocked'}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)} className="flex items-center gap-1.5">
          <Plus size={14} /> Add item
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="📦" title="No inventory tracked" description="Start tracking shared staples like paper towels and cleaning supplies. RoomiQ will warn everyone before they run out." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => (
            <div key={item._id} className={[
              'flex flex-col gap-4 p-6 rounded-3xl border transition-all',
              item.isLowStock 
                ? 'bg-accent-rose/10 border-accent-rose/40 shadow-[0_0_15px_rgba(225,29,72,0.15)]' 
                : 'bg-accent-emerald/10 border-accent-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-accent-emerald/50',
            ].join(' ')}>
              <div className="flex justify-between items-start">
                <span className="text-5xl drop-shadow-md">{CATEGORY_ICONS[item.category]}</span>
                {item.isLowStock ? (
                  <div className="w-3 h-3 rounded-full bg-accent-rose animate-pulse" title="Low Stock!" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,0.6)]" title="In Stock" />
                )}
              </div>
              <div className="flex-1 mt-2">
                <div className="font-body text-xl font-medium text-white line-clamp-1">{item.name}</div>
                <div className="font-label-caps text-xs tracking-[0.1em] text-primary-muted mt-2">
                  Threshold: {item.lowStockThreshold}
                </div>
              </div>

              {restockId === item._id ? (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-glass-border">
                  <input
                    type="number"
                    autoFocus
                    value={restockVal}
                    onChange={e => setRestockVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRestock(item._id) }}
                    className="w-full px-3 py-2 text-base font-display bg-black/40 border border-glass-border rounded-lg text-white outline-none focus:border-accent-purple"
                  />
                  <Button size="sm" loading={busy} onClick={() => handleRestock(item._id)} className="h-10 w-10 p-0 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]">✓</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-glass-border">
                  <Badge color={item.isLowStock ? 'red' : 'green'} className="text-sm px-3 py-1">
                    {item.currentQuantity} <span className="opacity-70 ml-1">{item.unit}</span>
                  </Badge>
                  <button
                    onClick={() => { setRestockId(item._id); setRestockVal(String(item.currentQuantity)) }}
                    className={`p-2 rounded-full transition-colors ${item.isLowStock ? 'text-accent-rose hover:bg-accent-rose/20' : 'text-accent-emerald hover:bg-accent-emerald/20'}`}
                    title="Update Stock"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <Overlay onClose={() => setShowAdd(false)}>
          <div className="w-full max-w-md glass-panel p-0 border border-glass-border shadow-glow rounded-3xl !overflow-visible">
            <ModalHeader title="Add inventory item" onClose={() => setShowAdd(false)} />
            <div className="px-8 pb-8 pt-4 flex flex-col gap-6">
              <Input
                label="Item name"
                placeholder='e.g. "Toilet Paper"'
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Current quantity"
                  type="number"
                  value={form.currentQuantity}
                  onChange={e => setForm(f => ({ ...f, currentQuantity: e.target.value }))}
                />
                <Input
                  label="Unit"
                  placeholder="rolls, bottles..."
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                />
              </div>
              <Input
                label="Low stock alert threshold"
                type="number"
                placeholder="Alert when quantity drops to or below this"
                value={form.lowStockThreshold}
                onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
              />
              <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-obsidian text-white">{CATEGORY_ICONS[c]} {c}</option>)}
              </Select>
              <div className="flex gap-4 pt-2">
                <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleAdd} loading={busy} className="flex-[2] shadow-[0_0_15px_rgba(255,255,255,0.2)]">Add item</Button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}
