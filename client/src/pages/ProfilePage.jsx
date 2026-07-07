import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Avatar, Badge } from '../components/ui'
import api from '../services/api'
import toast from 'react-hot-toast'
import { User, Phone, Image as ImageIcon, Heart, LogOut, Mail, Camera, Home, DollarSign } from 'lucide-react'

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name:   user?.name  || '',
    phone:  user?.phone || '',
    bio:    user?.bio   || '',
    avatar: user?.avatar|| '',
    occupation: user?.occupation || '',
    bkashNumber: user?.bkashNumber || '',
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const dirty = JSON.stringify(form) !== JSON.stringify({
    name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '', avatar: user?.avatar || '', occupation: user?.occupation || '', bkashNumber: user?.bkashNumber || ''
  })

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return }
    setLoading(true)
    try {
      await api.put('/auth/me', form)
      await refreshUser()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    setUploading(true)
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const avatarUrl = res.data.url
      
      setForm(f => ({ ...f, avatar: avatarUrl }))
      // Auto-save the profile with new avatar
      await api.put('/auth/me', { ...form, avatar: avatarUrl })
      await refreshUser()
      toast.success('Profile picture updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = null
    }
  }

  const handleLeaveHouse = async () => {
    if (!window.confirm("Are you sure you want to leave this house? You will lose access to all house data.")) return
    
    setLeaving(true)
    try {
      await api.post(`/houses/${user.currentHouse._id}/leave`)
      await refreshUser()
      toast.success('Left house successfully')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave house')
    } finally {
      setLeaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const quizDone = !!user?.compatibilityProfile?.completedAt

  return (
    <div className="w-full px-6 md:px-[64px] pb-24">
      {/* Header */}
      <section className="mt-8 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="font-label-caps text-[12px] uppercase tracking-[0.15em] text-primary-muted mb-2">Account Settings</div>
          <h1 className="font-display text-[56px] md:text-[80px] font-bold text-white leading-[1.1] tracking-tight">Profile<span className="text-gradient">.</span></h1>
          <p className="font-body-lg text-[18px] text-primary-muted max-w-xl mt-4">Manage your personal info, house settings, and preferences.</p>
        </div>
      </section>

      <div className="max-w-3xl space-y-8">
        {/* Profile header */}
        <div className="glass-panel rounded-[32px] p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div 
            className="relative cursor-pointer group rounded-full overflow-hidden shrink-0" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar name={form.name || user?.name} size={96} src={form.avatar} />
            <div className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${uploading ? 'opacity-100' : ''}`}>
              {uploading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*" 
          />
          <div className="flex-1 min-w-0">
            <div className="font-display text-[32px] font-medium text-white tracking-tight mb-1 leading-none">{user?.name}</div>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-2 font-label-caps text-[11px] tracking-[0.15em] uppercase text-primary-muted">
                <Mail size={14} className="text-white/40" /> {user?.email}
              </div>
              <Badge color={quizDone ? 'green' : 'yellow'}>{quizDone ? 'Quiz complete' : 'Quiz pending'}</Badge>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="glass-panel rounded-[32px] p-8">
          <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted mb-8">Personal information</div>

          <div className="flex flex-col gap-6 max-w-xl">
            <Input
              label="Full name"
              value={form.name}
              onChange={set('name')}
              icon={<User size={16} />}
            />
            <Input
              label="Phone number"
              placeholder="+880..."
              value={form.phone}
              onChange={set('phone')}
              icon={<Phone size={16} />}
            />
            <Input
              label="Occupation"
              placeholder="e.g. Software Engineer, Student"
              value={form.occupation}
              onChange={set('occupation')}
              icon={<User size={16} />}
            />
            <Input
              label="bKash Number (For settling expenses)"
              placeholder="017..."
              value={form.bkashNumber}
              onChange={set('bkashNumber')}
              icon={<DollarSign size={16} />}
            />
            <div>
              <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Bio</div>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                placeholder="A short note about yourself..."
                rows={4}
                maxLength={300}
                className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl text-[15px] text-white resize-y outline-none focus:border-accent-orange placeholder:text-white/20 transition-colors"
              />
              <div className="font-label-caps text-[10px] tracking-[0.15em] text-primary-muted mt-1 text-right">
                {form.bio.length}/300
              </div>
            </div>

            <Button onClick={handleSave} loading={loading} disabled={!dirty} className={`self-start ${dirty ? 'shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}>
              Save changes
            </Button>
          </div>
        </div>

        {/* House Settings */}
        {user?.currentHouse && (
          <div className="glass-panel rounded-[32px] p-8">
            <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted mb-8">House Settings</div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 font-display text-[20px] font-medium text-white mb-2">
                  <Home size={20} className="text-white/60" /> {user.currentHouse.name}
                </div>
                <div className="font-body text-[15px] text-primary-muted max-w-sm">
                  You are currently a member of this house. Leaving will remove your access to all house data.
                </div>
              </div>
              <Button variant="danger" onClick={handleLeaveHouse} loading={leaving}>
                Leave house
              </Button>
            </div>
          </div>
        )}

        {/* Compatibility */}
        <div className="glass-panel rounded-[32px] p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-display text-[20px] font-medium text-white mb-2">
                <Heart size={20} className="text-accent-rose" /> Compatibility profile
              </div>
              <div className="font-body text-[15px] text-primary-muted max-w-sm">
                {quizDone
                  ? `Completed on ${new Date(user.compatibilityProfile.completedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`
                  : 'Complete the quiz to see roommate matching scores.'}
              </div>
            </div>
            <Button variant="secondary" onClick={() => navigate('/quiz')}>
              {quizDone ? 'Retake quiz' : 'Take quiz'}
            </Button>
          </div>
        </div>

        {/* Account actions */}
        <div className="glass-panel rounded-[32px] p-8 bg-accent-rose/5 border-accent-rose/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-display text-[20px] font-medium text-white mb-2">Account Security</div>
            <div className="font-body text-[15px] text-primary-muted max-w-sm">Sign out of your account on this device.</div>
          </div>
          <Button variant="danger" onClick={handleLogout} className="shadow-[0_0_15px_rgba(225,29,72,0.3)]">
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
