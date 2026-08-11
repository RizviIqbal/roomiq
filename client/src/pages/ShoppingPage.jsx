import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShopping } from '../hooks/useShopping'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState } from '../components/ui'
import ShoppingList from '../components/shopping/ShoppingList'
import InventoryPanel from '../components/shopping/InventoryPanel'
import { ListChecks, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShoppingPage() {
  const navigate = useNavigate()
  const { houseId, house, list, inventory, loading, refresh } = useShopping()
  const [tab, setTab] = useState('list')

  const handleRefresh = useCallback(() => refresh(), [refresh])
  useSocketEvent('shopping_updated',  handleRefresh)
  useSocketEvent('inventory_updated', handleRefresh)
  useSocketEvent('low_stock_alert', useCallback((data) => {
    toast(`📦 ${data.name} is running low (${data.currentQuantity} left)`, { duration: 5000, icon: '⚠️' })
  }, []))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No house" description="JOIN A HOUSE FIRST" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  return (
    <div className="w-full px-6 md:px-[64px] pb-24">
      {/* Header */}
      <section className="mt-8 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="font-label-caps text-[12px] uppercase tracking-[0.15em] text-primary-muted mb-2">Household Supplies</div>
          <h1 className="font-display text-[56px] md:text-[80px] font-bold text-white leading-[1.1] tracking-tight">Shopping<span className="text-gradient">.</span></h1>
          <p className="font-body-lg text-[18px] text-primary-muted max-w-xl mt-4">Never double-buy communal supplies again. Track what's running low, and automatically split costs when you restock.</p>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} color="#06B6D4" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
          {/* Shopping List Column (7 cols) */}
          <div className="xl:col-span-7 glass-panel rounded-[32px] p-8 shadow-glass border-accent-orange/10 flex flex-col">
            <ShoppingList houseId={houseId} items={list} currency={house?.currency} onRefresh={refresh} />
          </div>
          
          {/* Inventory Column (5 cols) */}
          <div className="xl:col-span-5 glass-panel rounded-[32px] p-8 shadow-glass border-accent-purple/10 flex flex-col bg-accent-purple/5">
            <InventoryPanel houseId={houseId} items={inventory} onRefresh={refresh} />
          </div>
        </div>
      )}
    </div>
  )
}
