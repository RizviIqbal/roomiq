import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Avatar, EmptyState } from '../ui'
import { ArrowRight, TrendingUp, TrendingDown, Scale, CheckCircle2, Wallet, HandCoins } from 'lucide-react'
import SettleBalanceModal from './SettleBalanceModal'
import toast from 'react-hot-toast'

export default function BalanceSummary({ balances = [], members = [], currency = 'BDT', houseId, onRefresh }) {
  const { user } = useAuth()
  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency

  const [settlingTarget, setSettlingTarget] = useState(null)

  const findUser = (id) => members?.find(m => m.user?._id === id || m.user === id)?.user

  // My balances
  const iOwe     = balances.filter(b => b.debtor === user?._id)
  const owedToMe = balances.filter(b => b.creditor === user?._id)
  const totalIOwe     = iOwe.reduce((a,b) => a + b.amount, 0)
  const totalOwedToMe = owedToMe.reduce((a,b) => a + b.amount, 0)
  const net = totalOwedToMe - totalIOwe

  // House-wide simplified debts (everyone)
  const otherDebts = balances.filter(b => b.debtor !== user?._id && b.creditor !== user?._id)

  const handleOpenSettle = (creditorUser, amount) => {
    setSettlingTarget({
      creditor: creditorUser,
      debtor: user,
      amount
    })
  }

  return (
    <div className="space-y-6 bento-card rounded-3xl p-6 sm:p-8 sticky top-32 shadow-xl border-white/10">
      
      {/* Net position Header */}
      <div>
        <div className="font-label-caps text-[11px] mb-3 text-primary-muted flex items-center gap-2 tracking-[0.15em] uppercase">
          <Scale size={14} className="text-accent-orange" /> Your Net Position
        </div>
        <div className={[
          'font-display text-4xl sm:text-5xl font-extrabold leading-none tracking-tight mb-2 drop-shadow-md transition-colors',
          net > 0 ? 'text-accent-emerald' : net < 0 ? 'text-accent-rose' : 'text-white',
        ].join(' ')}>
          {net === 0 ? `${curr}0.00` : `${net > 0 ? '+' : '−'}${curr}${Math.abs(net).toFixed(2)}`}
        </div>
        <div className="font-body text-xs sm:text-sm text-primary-muted mt-1">
          {net > 0 && `You are owed ${curr}${net.toFixed(2)} overall`}
          {net < 0 && `You owe ${curr}${Math.abs(net).toFixed(2)} overall`}
          {net === 0 && 'All debts settled with roommates!'}
        </div>
      </div>

      {/* You owe */}
      {iOwe.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-glass-border">
          <div className="flex justify-between items-center text-[11px] font-label-caps text-primary-muted uppercase tracking-wider">
            <span>You Owe</span>
            <span className="text-accent-rose font-bold">{iOwe.length} Debt{iOwe.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2.5">
            {iOwe.map((b, i) => {
              const creditorUser = findUser(b.creditor)
              return (
                <DebtRow 
                  key={i} 
                  from={user} 
                  to={creditorUser} 
                  amount={b.amount} 
                  curr={curr} 
                  negative 
                  onSettle={() => handleOpenSettle(creditorUser, b.amount)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Owed to you */}
      {owedToMe.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-glass-border">
          <div className="flex justify-between items-center text-[11px] font-label-caps text-primary-muted uppercase tracking-wider">
            <span>Owed To You</span>
            <span className="text-accent-emerald font-bold">{owedToMe.length} Credit{owedToMe.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2.5">
            {owedToMe.map((b, i) => (
              <DebtRow 
                key={i} 
                from={findUser(b.debtor)} 
                to={user} 
                amount={b.amount} 
                curr={curr} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Other house debts */}
      {otherDebts.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-glass-border">
          <div className="font-label-caps text-[11px] text-primary-muted uppercase tracking-wider">
            Other Roommate Balances
          </div>
          <div className="space-y-2.5">
            {otherDebts.map((b, i) => (
              <DebtRow 
                key={i} 
                from={findUser(b.debtor)} 
                to={findUser(b.creditor)} 
                amount={b.amount} 
                curr={curr} 
                muted 
              />
            ))}
          </div>
        </div>
      )}

      {balances.length === 0 && (
        <div className="py-6 text-center space-y-2">
          <div className="text-3xl">🎉</div>
          <div className="text-sm font-bold text-white">Everyone's Settled Up</div>
          <div className="text-xs text-primary-muted">NO OUTSTANDING BALANCES IN THIS HOUSE</div>
        </div>
      )}

      {/* Settle Money Modal */}
      {settlingTarget && (
        <SettleBalanceModal
          houseId={houseId}
          creditor={settlingTarget.creditor}
          debtor={settlingTarget.debtor}
          amount={settlingTarget.amount}
          currency={currency}
          onClose={() => setSettlingTarget(null)}
          onSettled={() => {
            setSettlingTarget(null)
            if (onRefresh) onRefresh()
          }}
        />
      )}

    </div>
  )
}

const DebtRow = ({ from, to, amount, curr, negative, muted, onSettle }) => {
  return (
    <div className="flex flex-col gap-2 p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-glass-border relative group">
      <div className="flex items-center gap-2.5 justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Avatar name={from?.name} size={28} src={from?.avatar} />
          <span className={['text-xs truncate', muted ? 'text-primary-muted' : 'text-white font-medium'].join(' ')}>
            {from?.name}
          </span>
          <ArrowRight size={12} className="text-primary-muted/50 flex-shrink-0" />
          <Avatar name={to?.name} size={28} src={to?.avatar} />
          <span className={['text-xs truncate', muted ? 'text-primary-muted' : 'text-white font-medium'].join(' ')}>
            {to?.name}
          </span>
        </div>

        <span className={[
          'font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg shrink-0',
          muted 
            ? 'text-primary-muted' 
            : negative 
              ? 'text-accent-rose bg-accent-rose/10 border border-accent-rose/20' 
              : 'text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20',
        ].join(' ')}>
          {curr}{amount.toFixed(2)}
        </span>
      </div>

      {/* Settle Money Action Button */}
      {negative && onSettle && (
        <div className="pt-2 border-t border-glass-border flex gap-2">
          <button 
            onClick={onSettle} 
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-accent-emerald to-teal-500 hover:opacity-95 text-obsidian py-2 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-[0.98]"
          >
            <HandCoins size={13} />
            <span>Settle {curr}{amount.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
