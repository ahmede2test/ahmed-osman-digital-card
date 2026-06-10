import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';

interface ProfileData {
  avatar_url: string;
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  skills: string[];
  linkedin: string;
  github: string;
  portfolio: string;
  facebook: string;
  instagram: string;
  email: string;
  phone: string;
  whatsapp: string;
}

const DEFAULT_PROFILE: ProfileData = {
  avatar_url: "https://github.com/ahmede2test.png",
  name: "Ahmed Osman ELsisi",
  title: "IT Specialist",
  subtitle: "IT Technical Support • Orascom Construction (Contrack FM) • Flutter Expert • Mobile App Developer",
  bio: "Architecting and developing smart, high-performance mobile applications with premium, user-centric UI/UX design layouts. Explore my professional networks and connect with me directly.",
  skills: ["Flutter", "App Developer", "MySQL", "API Integration", "IT Support"],
  linkedin: "https://www.linkedin.com/in/ahmed-osman22",
  github: "https://github.com/ahmede2test",
  portfolio: "https://ahmed-osman-portfolio.vercel.app/",
  facebook: "https://www.facebook.com/share/18tkT6hhhc/",
  instagram: "https://www.instagram.com/eng_ahmed_el_sisiy?igsh=dW1pbHU1M2E0cG50",
  email: "ahmed.osmanis.fcai@gmail.com",
  phone: "+201027451231",
  whatsapp: "201027451231",
};

const ADMIN_PASSWORD = "admin2026"; // ← CHANGE THIS TO A STRONG PASSWORD

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [newSkill, setNewSkill] = useState("");

  // Load from Supabase
  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error && error.code !== 'PGRST116') {
        setMessage({ type: 'error', text: 'Could not load profile from database.' });
      } else if (data) {
        setProfile({
          avatar_url: data.avatar_url || DEFAULT_PROFILE.avatar_url,
          name: data.name || DEFAULT_PROFILE.name,
          title: data.title || DEFAULT_PROFILE.title,
          subtitle: data.subtitle || DEFAULT_PROFILE.subtitle,
          bio: data.bio || DEFAULT_PROFILE.bio,
          skills: Array.isArray(data.skills) ? data.skills : DEFAULT_PROFILE.skills,
          linkedin: data.linkedin || DEFAULT_PROFILE.linkedin,
          github: data.github || DEFAULT_PROFILE.github,
          portfolio: data.portfolio || DEFAULT_PROFILE.portfolio,
          facebook: data.facebook || DEFAULT_PROFILE.facebook,
          instagram: data.instagram || DEFAULT_PROFILE.instagram,
          email: data.email || DEFAULT_PROFILE.email,
          phone: data.phone || DEFAULT_PROFILE.phone,
          whatsapp: data.whatsapp || DEFAULT_PROFILE.whatsapp,
        });
        if (data.updated_at) setLastSaved(new Date(data.updated_at).toLocaleString());
        setMessage({ type: 'success', text: 'Profile loaded successfully.' });
      } else {
        setMessage({ type: 'info', text: 'No profile saved yet. Fill the form and click Save.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load data from Supabase.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadProfile();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError("");
      setPasswordInput("");
    } else {
      setAuthError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    setAuthError("");
    setMessage(null);
    setLastSaved("");
  };

  const updateField = (field: keyof ProfileData, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (message?.type !== 'success') setMessage(null);
  };

  // Skills
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      updateField('skills', [...profile.skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    updateField('skills', profile.skills.filter((_, i) => i !== index));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file (JPG/PNG).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image is too large. Maximum 5MB.' });
      return;
    }

    setUploading(true);
    setMessage({ type: 'info', text: 'Uploading photo...' });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        updateField('avatar_url', urlData.publicUrl);
        setMessage({ type: 'success', text: 'Photo uploaded! Click Save to publish it.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Upload failed. Make sure the "avatars" bucket is public in Supabase.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Save to database
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: 'info', text: 'Saving changes...' });

    try {
      const { error } = await supabase
        .from('profile')
        .upsert({ id: 'default', ...profile, updated_at: new Date().toISOString() });

      if (error) throw error;

      const now = new Date().toLocaleString();
      setLastSaved(now);
      setMessage({ type: 'success', text: '✅ Saved successfully! Changes are live on the public card.' });
    } catch {
      setMessage({ type: 'error', text: 'Save failed. Check your Supabase table and permissions.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('Reset all fields to the original defaults?')) return;
    setProfile(DEFAULT_PROFILE);
    setMessage({ type: 'info', text: 'Reset to defaults. Click Save to apply.' });
  };

  // Auto-hide non-success messages
  useEffect(() => {
    if (message && message.type !== 'success') {
      const t = setTimeout(() => setMessage(null), 7000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // ==================== LOGIN SCREEN ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-5">
              <span className="text-white text-3xl font-black tracking-[-2px]">A</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-[-1px] text-black">Admin Studio</h1>
            <p className="text-[#555] mt-1.5">Ahmed Osman ELsisi — Digital Business Card</p>
          </div>

          <div className="bg-white border border-[#e5e5e5] rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold tracking-[1.5px] text-[#666] mb-2">ADMIN PASSWORD</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full h-14 px-5 border border-[#e5e5e5] rounded-2xl text-lg focus:outline-none focus:border-black"
                  placeholder="Enter password"
                  required
                />
                {authError && <p className="text-red-600 text-sm mt-2 font-medium">{authError}</p>}
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-black hover:bg-[#111] text-white font-semibold text-sm tracking-[1.8px] uppercase rounded-2xl active:scale-[0.985] transition-all"
              >
                SIGN IN
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-[#777] hover:text-black underline underline-offset-4">
                ← Back to Public Card
              </Link>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#999] mt-7 tracking-widest">SECURE ACCESS</p>
        </div>
      </div>
    );
  }

  // ==================== MAIN DASHBOARD - CLEAN & PROFESSIONAL ====================
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      {/* Clean Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl tracking-[-2px]">A</span>
            </div>
            <div>
              <div className="font-semibold text-[17px] tracking-[-0.3px] text-black">Admin Studio</div>
              <div className="text-[9px] text-[#888] -mt-0.5 tracking-[1.5px]">AHMED OSMAN ELSISI</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Link 
              to="/" 
              target="_blank" 
              className="px-4 py-1.5 rounded-2xl border border-[#e5e5e5] hover:bg-white font-medium transition-colors"
            >
              View Public Card ↗
            </Link>
            <button 
              onClick={handleLogout} 
              className="px-4 py-1.5 text-red-600 hover:bg-red-50 rounded-2xl font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 pt-8 pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-[-0.7px] text-black">Business Card Editor</h1>
          <p className="text-[#555] mt-1 text-[15px]">Edit your card. Changes save to Supabase and appear instantly on the public site.</p>
          {lastSaved && <p className="text-xs text-[#777] mt-1">Last saved: {lastSaved}</p>}
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`mb-6 px-5 py-3.5 rounded-3xl text-sm flex items-start gap-3 border ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
            message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 
            'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex-1 leading-relaxed">{message.text}</div>
            <button onClick={() => setMessage(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        {loading && <div className="text-sm text-[#666] mb-4">Loading data from database...</div>}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Avatar + Name/Title */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Avatar Card */}
            <div className="lg:col-span-5 bg-white border border-[#e5e5e5] rounded-3xl p-7">
              <div className="text-[10px] font-semibold tracking-[1.5px] text-[#666] mb-4">PROFILE PHOTO</div>

              <div className="flex flex-col items-center">
                <div className="relative w-[148px] h-[148px] mb-5">
                  <div className="absolute inset-0 rounded-full bg-[#FF0033] p-[5px]">
                    <div className="w-full h-full rounded-full bg-white p-[3px]">
                      <div className="w-full h-full rounded-full overflow-hidden border border-[#f0f0f0]">
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PROFILE.avatar_url; }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <label className="cursor-pointer">
                  <span className={`inline-block px-7 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.985] ${uploading ? 'bg-[#f1f1f1] text-[#999]' : 'bg-black text-white'}`}>
                    {uploading ? 'UPLOADING...' : 'UPLOAD NEW PHOTO'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
                <p className="text-xs text-[#888] mt-2 text-center">JPG or PNG • Max 5MB</p>

                <div className="w-full mt-5">
                  <div className="text-xs font-medium text-[#666] mb-1.5">OR PASTE IMAGE URL</div>
                  <input
                    type="text"
                    value={profile.avatar_url}
                    onChange={(e) => updateField('avatar_url', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-black font-mono text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Name + Title */}
            <div className="lg:col-span-7 bg-white border border-[#e5e5e5] rounded-3xl p-7 space-y-5">
              <div>
                <div className="text-[10px] font-semibold tracking-[1.5px] text-[#666] mb-1.5">FULL NAME</div>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 text-lg font-semibold border border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[1.5px] text-[#666] mb-1.5">TITLE / BADGE</div>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-4 py-3 border border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Subtitle + Bio */}
          <div className="bg-white border border-[#e5e5e5] rounded-3xl p-7 space-y-5">
            <div>
              <div className="text-[10px] font-semibold tracking-[1.5px] text-[#666] mb-1.5">SUBTITLE</div>
              <input
                type="text"
                value={profile.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-black text-sm"
              />
            </div>

            <div>
              <div className="text-[10px] font-semibold tracking-[1.5px] text-[#666] mb-1.5">BIO / DESCRIPTION</div>
              <textarea
                value={profile.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-3xl focus:outline-none focus:border-black text-sm resize-y"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white border border-[#e5e5e5] rounded-3xl p-7">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] font-semibold tracking-[1.5px] text-[#666]">EXPERTISE / SKILLS</div>
              <div className="text-xs text-[#888]">Click × to remove</div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <div key={index} className="inline-flex items-center gap-1 pl-4 pr-2 py-1.5 bg-[#f8f8f8] border border-[#e5e5e5] rounded-2xl text-sm font-medium text-[#222]">
                    {skill}
                    <button onClick={() => removeSkill(index)} className="w-5 h-5 flex items-center justify-center text-[#999] hover:text-red-500 hover:bg-white rounded-full text-xl leading-none transition-colors">×</button>
                  </div>
                ))
              ) : (
                <span className="text-sm text-[#888]">No skills added yet</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Add new skill (e.g. React) and press Enter"
                className="flex-1 px-4 py-2.5 text-sm border border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-black"
              />
              <button 
                onClick={addSkill} 
                disabled={!newSkill.trim()}
                className="px-6 font-semibold text-sm bg-black text-white rounded-2xl disabled:bg-[#e5e5e5] disabled:text-[#999] active:scale-[0.985] transition-all"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-[#888] mt-1.5">Remember to click the big Save button below after editing.</p>
          </div>

          {/* Social Links */}
          <div className="bg-white border border-[#e5e5e5] rounded-3xl p-7">
            <div className="text-[10px] font-semibold tracking-[1.5px] text-[#666] mb-4">SOCIAL LINKS &amp; DIRECT CONTACT</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              {[
                { key: 'linkedin' as const, label: 'LinkedIn' },
                { key: 'github' as const, label: 'GitHub' },
                { key: 'portfolio' as const, label: 'Portfolio Website' },
                { key: 'facebook' as const, label: 'Facebook' },
                { key: 'instagram' as const, label: 'Instagram' },
                { key: 'email' as const, label: 'Email Address' },
                { key: 'phone' as const, label: 'Phone (with +)' },
                { key: 'whatsapp' as const, label: 'WhatsApp (no +)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div className="text-xs font-medium text-[#666] mb-1.5">{label}</div>
                  <input
                    type="text"
                    value={profile[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-black"
                    placeholder={key.includes('phone') || key === 'whatsapp' ? (key === 'phone' ? '+20123456789' : '20123456789') : 'https://...'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-14 bg-black hover:bg-[#111] disabled:bg-[#444] text-white font-semibold text-sm tracking-[1.8px] uppercase rounded-3xl transition-all active:scale-[0.985]"
          >
            {saving ? 'SAVING TO SUPABASE...' : 'SAVE ALL CHANGES TO DATABASE'}
          </button>

          <button
            onClick={handleReset}
            className="h-14 px-8 border border-[#e5e5e5] hover:bg-white text-sm font-medium rounded-3xl transition-all active:scale-[0.985]"
          >
            Reset to Original Defaults
          </button>
        </div>

        <div className="text-center mt-6 text-xs text-[#888]">
          All fields are live on the public card immediately after saving.
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-[#666] hover:text-black underline underline-offset-4">
            ← Return to the public digital business card
          </Link>
        </div>
      </div>
    </div>
  );
}
