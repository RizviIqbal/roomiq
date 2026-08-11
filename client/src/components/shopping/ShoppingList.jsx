import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Select, Avatar, EmptyState } from '../ui'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Check, Trash2, ShoppingBag, Store, Hand, ShoppingCart, X } from 'lucide-react'

const CATEGORIES = ['groceries','cleaning','toiletries','kitchen','other']
const CATEGORY_ICONS = { groceries:'🛒', cleaning:'🧴', toiletries:'🧻', kitchen:'🍳', other:'📦' }

export default function ShoppingList({ houseId, items, currency, onRefresh }) {
  const { user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:'', quantity:'1', unit:'', category:'groceries' })
  const [adding, setAdding]   = useState(false)
  const [costInputs, setCostInputs] = useState({}) // itemId -> cost value
  const [busyId, setBusyId]   = useState(null)
  const [alerting, setAlerting] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const curr = currency === 'BDT' ? '\u09f3' : currency === 'USD' ? '$' : currency

  const pending = items.filter(i => !i.isBought)
  const bought  = items.filter(i => i.isBought)

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Item name required'); return }
    setAdding(true)
    try {
      await api.post('/shopping/list', {
        houseId, name: form.name, quantity: Number(form.quantity) || 1,
        unit: form.unit, category: form.category,
      })
      toast.success('Added to list')
      setForm({ name:'', quantity:'1', unit:'', category: form.category })
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setAdding(false)
    }
  }

  const markBought = async (itemId) => {
    setBusyId(itemId)
    try {
      const cost = costInputs[itemId] ? Number(costInputs[itemId]) : null
      await api.put(`/shopping/list/${itemId}/bought`, { cost })
      toast.success('Marked as bought')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setBusyId(null)
    }
  }

  const deleteItem = async (itemId) => {
    setBusyId(itemId)
    try {
      await api.delete(`/shopping/list/${itemId}`)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setBusyId(null)
    }
  }

  const claimItem = async (itemId) => {
    setBusyId(itemId)
    try {
      await api.put(`/shopping/list/${itemId}/claim`)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim item')
    } finally {
      setBusyId(null)
    }
  }

  const handleStoreAlert = async () => {
    setAlerting(true)
    try {
      await api.post('/shopping/store-alert', { houseId })
      toast.success('Alert sent to roommates!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alert')
    } finally {
      setAlerting(false)
    }
  }

  const handleCheckout = async () => {
    const itemsToCheckout = pending.filter(item => costInputs[item._id] && Number(costInputs[item._id]) > 0)
    if (itemsToCheckout.length === 0) {
      toast.error('Enter a cost for at least one item to checkout')
      return
    }

    setCheckingOut(true)
    try {
      const payload = itemsToCheckout.map(i => ({ _id: i._id, cost: Number(costInputs[i._id]) }))
      const res = await api.post('/shopping/checkout', { houseId, items: payload })
      toast.success(`Checkout complete! Total: ${curr}${res.data.totalCost}`)
      // Clear inputs
      const newCosts = { ...costInputs }
      itemsToCheckout.forEach(i => delete newCosts[i._id])
      setCostInputs(newCosts)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div>
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-[24px] font-bold text-white">Shopping List</h2>
        <Button variant="ghost" onClick={handleStoreAlert} loading={alerting} className="border border-accent-orange/30 text-accent-orange hover:bg-accent-orange hover:text-obsidian transition-colors">
          <Store size={18} className="mr-2" /> I'm at the store!
        </Button>
      </div>

      <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-accent-orange/10 to-transparent border border-accent-orange/20">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-accent-orange/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="text-accent-orange" size={24} />
          </div>
          <div>
            <h3 className="text-white font-display font-medium text-xl mb-2">Communal Shopping</h3>
            <p className="text-primary-muted font-body text-base leading-relaxed max-w-2xl">
              Add shared items below. When someone marks an item as bought, the cost is automatically split and synced with the Finance tracker. No more arguing over who bought the toilet paper last.
            </p>
          </div>
        </div>
      </div>

      {/* Quick add */}
      <div className="flex gap-3 mb-8 flex-wrap items-end bg-black/20 p-4 rounded-2xl border border-glass-border">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Add an item..."
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          />
        </div>
        <div className="w-24">
          <Input
            type="number" min="1" placeholder="Qty"
            value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
          />
        </div>
        <div className="w-28">
          <Input
            placeholder="Unit"
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
          />
        </div>
        <div className="w-40">
          <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-obsidian text-white">{CATEGORY_ICONS[c]} {c}</option>)}
          </Select>
        </div>
        <Button onClick={handleAdd} loading={adding} className="shadow-glow">
          <Plus size={18} />
        </Button>
      </div>

      {/* Pending */}
      {pending.length === 0 && bought.length === 0 ? (
        <EmptyState icon="🛒" title="Shopping list is empty" description="Your house is fully stocked! Add items here to request communal supplies. The buyer will automatically be reimbursed." />
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-10">
              <div className="border border-glass-border rounded-2xl overflow-hidden divide-y divide-glass-border mb-4">
                {pending.map(item => {
                  const isClaimedByMe = item.claimedBy?._id === user._id
                  const isClaimedByOther = item.claimedBy && !isClaimedByMe
                  
                  return (
                    <div key={item._id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${isClaimedByOther ? 'bg-black/40 opacity-70' : isClaimedByMe ? 'bg-accent-orange/10' : 'bg-white/5 hover:bg-white/10'}`}>
                      <span className="text-3xl drop-shadow-md">{CATEGORY_ICONS[item.category]}</span>
                      <div className="flex-1 ml-2">
                        <div className="font-body text-lg font-medium text-white flex items-center gap-2">
                          {item.name} {item.quantity > 1 && <span className="text-primary-muted font-normal">× {item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>}
                        </div>
                        <div className="font-label-caps text-xs tracking-[0.15em] text-primary-muted mt-1">
                          Added by {item.addedBy?.name}
                        </div>
                      </div>

                      {/* Dibs / Claim Section */}
                      <div className="min-w-[180px] flex justify-end mr-4">
                        {isClaimedByOther ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-glass-border rounded-full shrink-0">
                            <Avatar name={item.claimedBy.name} src={item.claimedBy.avatar} size={16} />
                            <span className="font-label-caps text-[9px] text-primary-muted uppercase tracking-wider">{item.claimedBy.name} is buying</span>
                          </div>
                        ) : isClaimedByMe ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/30 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                              <Check size={12} className="text-accent-orange" />
                              <span className="font-label-caps text-[9px] text-accent-orange uppercase tracking-wider">You are buying</span>
                            </div>
                            <button 
                              onClick={() => claimItem(item._id)} 
                              className="p-1.5 rounded-full text-primary-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                              title="Unclaim item"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="px-4 py-1.5 text-xs h-8 border border-glass-border hover:bg-accent-orange/10 hover:border-accent-orange/30 hover:text-accent-orange rounded-full transition-all shrink-0"
                            onClick={() => claimItem(item._id)}
                            loading={busyId === item._id}
                          >
                            <ShoppingCart size={14} className="mr-2" /> I'll buy it
                          </Button>
                        )}
                      </div>

                      {/* Cost and Check */}
                      <input
                        type="number"
                        placeholder={`Cost (${currency})`}
                        value={costInputs[item._id] || ''}
                        onChange={e => setCostInputs(c => ({ ...c, [item._id]: e.target.value }))}
                        disabled={isClaimedByOther}
                        className="w-32 shrink-0 px-3 py-2 text-base bg-black/40 border border-glass-border rounded-lg text-white outline-none focus:border-accent-orange placeholder:text-white/20 font-display disabled:opacity-50"
                      />
                      <Button size="sm" variant="success" loading={busyId===item._id} onClick={() => markBought(item._id)} disabled={isClaimedByOther} className="h-10 w-10 p-0 shrink-0 flex items-center justify-center">
                        <Check size={18} className="shrink-0 text-current" />
                      </Button>
                      <button onClick={() => deleteItem(item._id)} className="flex p-2 shrink-0 rounded-full text-primary-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors ml-1">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )
                })}
              </div>
              
              {/* Checkout Banner */}
              {Object.keys(costInputs).length > 0 && Object.values(costInputs).some(v => Number(v) > 0) && (
                <div className="bg-accent-emerald/10 border border-accent-emerald/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-up mt-4">
                  <div>
                    <div className="font-display font-medium text-white">Ready to checkout?</div>
                    <div className="font-body text-sm text-primary-muted max-w-sm">Items with a cost will be marked as bought and split equally as a new house expense.</div>
                  </div>
                  <Button variant="success" onClick={handleCheckout} loading={checkingOut} className="shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap shrink-0">
                    Checkout & Split
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bought */}
          {bought.length > 0 && (
            <div>
              <div className="font-label-caps text-[11px] mb-4 flex items-center gap-2 text-primary-muted tracking-[0.15em] uppercase pl-1">
                <ShoppingBag size={14} className="text-accent-orange" /> Recently bought
              </div>
              <div className="space-y-2">
                {bought.slice(0,5).map(item => (
                  <div key={item._id} className="flex items-center gap-4 px-5 py-3 opacity-60 hover:opacity-100 transition-opacity bg-white/5 rounded-xl border border-transparent hover:border-glass-border">
                    <Check size={16} className="text-accent-emerald" />
                    <span className="flex-1 font-body text-[15px] line-through text-primary-muted">{item.name}</span>
                    {item.cost != null && item.cost > 0 && <span className="font-display text-[15px] text-white/50">{curr}{item.cost}</span>}
                    <span className="font-label-caps text-[10px] tracking-[0.15em] text-primary-muted">by {item.boughtBy?.name}</span>
                    <button onClick={() => deleteItem(item._id)} className="flex p-1.5 rounded-full text-primary-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors ml-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
