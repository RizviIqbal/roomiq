import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShopping } from '../hooks/useShopping'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState, Badge } from '../components/ui'
import ShoppingList from '../components/shopping/ShoppingList'
import InventoryPanel from '../components/shopping/InventoryPanel'
import { 
  ShoppingCart, Package, AlertTriangle, CheckCircle2, 
  Sparkles, Layers, ListChecks, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShoppingPage() {
  const navigate = useNavigate()
  const { houseId, house, list, inventory, loading, refresh } = useShopping()

  const handleRefresh = useCallback(() => refresh(), [refresh])
  useSocketEvent('shopping_updated',  handleRefresh)
  useSocketEvent('inventory_updated', handleRefresh)
  useSocketEvent('low_stock_alert', useCallback((data) => {
    toast(`📦 ${data.name} is running low (${data.currentQuantity} left)`, { duration: 5000, icon: '⚠️' })
  }, []))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO TRACK COMMUNAL GROCERIES" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  // Metrics
  const stats = useMemo(() => {
    const toBuy = list.filter(i => !i.isBought).length
    const bought = list.filter(i => i.isBought).length
    const totalInventory = inventory.length
    const lowStock = inventory.filter(i => i.currentQuantity <= i.lowStockThreshold).length

    return { toBuy, bought, totalInventory, lowStock }
  }, [list, inventory])

  return (
    <div className="w-full px-4 md:px-8 pb-24 max-w-7xl mx-auto space-y-8">
      
      {/* ========================================================= */}
      {/* 1. GROCERIES & PANTRY METRICS STRIP */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Items to Buy */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Shopping Checklist</span>
            <ShoppingCart size={16} className="text-accent-orange" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.toBuy} To Buy
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Needed for communal pantry
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Low Stock Items</span>
            <AlertTriangle size={16} className={stats.lowStock > 0 ? "text-accent-rose animate-pulse" : "text-primary-muted"} />
          </div>
          <div 
            className="font-display text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: stats.lowStock > 0 ? '#F43F5E' : '#FFFFFF' }}
          >
            {stats.lowStock} Low Stock
          </div>
          <div className="text-xs text-primary-muted mt-2">
            {stats.lowStock > 0 ? 'Auto-added to shopping list' : 'All essentials stocked'}
          </div>
        </div>

        {/* Tracked Inventory */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Pantry Inventory</span>
            <Package size={16} className="text-accent-purple" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.totalInventory} Essentials
          </div>
          <div className="text-xs text-primary-muted mt-2">
            With low-stock alerts enabled
          </div>
        </div>

        {/* Bought this cycle */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Restocked Items</span>
            <CheckCircle2 size={16} className="text-accent-emerald" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.bought} Purchased
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Automatically split in Finance
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. SPLIT LAYOUT (Shopping Checklist + Inventory Panel) */}
      {/* ========================================================= */}
      {loading ? (
        <div className="flex justify-center py-16 bento-card rounded-3xl">
          <Spinner size={32} color="#00E5FF" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Shopping List Column (7 cols) */}
          <div className="lg:col-span-7 bento-card rounded-3xl p-6 lg:p-8 space-y-6">
            <ShoppingList 
              houseId={houseId} 
              items={list} 
              currency={house?.currency} 
              onRefresh={refresh} 
            />
          </div>
          
          {/* Inventory Column (5 cols) */}
          <div className="lg:col-span-5 bento-card rounded-3xl p-6 lg:p-8 space-y-6 bg-accent-purple/[0.02] border-accent-purple/20">
            <InventoryPanel 
              houseId={houseId} 
              items={inventory} 
              onRefresh={refresh} 
            />
          </div>

        </div>
      )}
    </div>
  )
}
