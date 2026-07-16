import { useAuth } from '../../context/AuthContext'
import { Avatar, EmptyState } from '../ui'
import { ArrowRight, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BalanceSummary({ balances, members, currency }) {
  const { user } = useAuth()
  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency

  const findUser = (id) => members?.find(m => m.user._id === id)?.user

  // My balances
  const iOwe    = balances.filter(b => b.debtor === user._id)
  const owedToMe= balances.filter(b => b.creditor === user._id)
  const totalIOwe     = iOwe.reduce((a,b) => a + b.amount, 0)
  const totalOwedToMe = owedToMe.reduce((a,b) => a + b.amount, 0)
  const net = totalOwedToMe - totalIOwe

  // House-wide simplified debts (everyone)
  const otherDebts = balances.filter(b => b.debtor !== user._id && b.creditor !== user._id)

  return (
    <div className="space-y-8 bento-card rounded-3xl p-8 sticky top-32">
      {/* Net position */}
      <div>
        <div className="font-label-caps text-[11px] mb-4 text-primary-muted flex items-center gap-2 tracking-[0.15em] uppercase">
          <Scale size={14} className="text-accent-orange" /> Your net position
        </div>
        <div className={[
          'font-display text-[48px] md:text-[56px] font-bold leading-none tracking-tight mb-2 drop-shadow-md transition-colors',
          net > 0 ? 'text-accent-emerald drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]' : net < 0 ? 'text-accent-rose drop-shadow-[0_0_12px_rgba(225,29,72,0.3)]' : 'text-white',
        ].join(' ')}>
          {net === 0 ? `${curr}0` : `${net > 0 ? '+' : '−'}${curr}${Math.abs(net).toFixed(2)}`}
        </div>
        <div className="font-body text-[15px] text-primary-muted mt-2">
          {net > 0 && `You are owed ${curr}${net.toFixed(2)} overall`}
          {net < 0 && `You owe ${curr}${Math.abs(net).toFixed(2)} overall`}
          {net === 0 && 'You are all settled up'}
        </div>
      </div>

      {/* You owe */}
      {iOwe.length > 0 && (
        <div>
          <div className="font-label-caps text-[11px] tracking-[0.15em] mb-4 text-primary-muted">You owe</div>
          <div className="space-y-3">
            {iOwe.map((b, i) => (
              <DebtRow key={i} from={user} to={findUser(b.creditor)} amount={b.amount} curr={curr} negative />
            ))}
          </div>
        </div>
      )}

      {/* Owed to you */}
      {owedToMe.length > 0 && (
        <div>
          <div className="font-label-caps text-[11px] tracking-[0.15em] mb-4 text-primary-muted">Owed to you</div>
          <div className="space-y-3">
            {owedToMe.map((b, i) => (
              <DebtRow key={i} from={findUser(b.debtor)} to={user} amount={b.amount} curr={curr} />
            ))}
          </div>
        </div>
      )}

      {/* Other house debts */}
      {otherDebts.length > 0 && (
        <div>
          <div className="font-label-caps text-[11px] tracking-[0.15em] mb-4 text-primary-muted">Other house debts</div>
          <div className="space-y-3">
            {otherDebts.map((b, i) => (
              <DebtRow key={i} from={findUser(b.debtor)} to={findUser(b.creditor)} amount={b.amount} curr={curr} muted />
            ))}
          </div>
        </div>
      )}

      {balances.length === 0 && (
        <EmptyState icon="✅" title="Everyone's settled up" description="NO OUTSTANDING BALANCES" />
      )}
    </div>
  )
}

const DebtRow = ({ from, to, amount, curr, negative, muted }) => {
  const handleBkash = () => {
    if (!to?.bkashNumber) return;
    navigator.clipboard.writeText(to.bkashNumber);
    toast.success(`Copied ${to.bkashNumber}. Opening bKash...`, {
      icon: '📱',
      style: {
        background: '#e2136e',
        color: '#fff',
      }
    });
    // Attempt to open bKash app
    setTimeout(() => {
      window.location.href = 'bkash://';
    }, 500);
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-glass-border relative group">
      <div className="flex items-center gap-3">
        <Avatar name={from?.name} size={32} src={from?.avatar} />
        <span className={['font-body-md text-[15px]', muted ? 'text-primary-muted' : 'text-white font-medium'].join(' ')}>{from?.name}</span>
        <ArrowRight size={14} className="text-primary-muted/50 flex-shrink-0 mx-1" />
        <Avatar name={to?.name} size={32} src={to?.avatar} />
        <span className={['font-body-md text-[15px] flex-1', muted ? 'text-primary-muted' : 'text-white font-medium'].join(' ')}>{to?.name}</span>
        <span className={[
          'font-mono font-bold text-[18px] px-3 py-1 rounded-lg',
          muted ? 'text-primary-muted' : negative ? 'text-accent-rose bg-accent-rose/10 border border-accent-rose/20' : 'text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        ].join(' ')}>
          {curr}{amount.toFixed(2)}
        </span>
      </div>

      {/* bKash Payment Button */}
      {negative && to?.bkashNumber && (
        <div className="border-t border-glass-border pt-2 mt-1 animate-fade-up">
          <button 
            onClick={handleBkash} 
            className="w-full flex items-center justify-center gap-2 bg-[#e2136e] hover:bg-[#d00f63] text-white py-2 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98]"
          >
            Pay {curr}{amount.toFixed(2)} via bKash
          </button>
        </div>
      )}
    </div>
  )
}
