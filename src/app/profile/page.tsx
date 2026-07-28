"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { Loader2, Camera, MapPin, Phone, Briefcase, Calendar, Store, GraduationCap, Users, Edit, Trophy, ShieldCheck, Plus, Trash2, Heart, Baby, User as UserIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { validateRequired, validateMinLength, validateMaxLength, validatePhone, collectErrors } from "@/lib/validation"
import { getIdToken } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ProfilePage() {
    const { user, refreshUser, changePassword, isPasswordUser, getToken } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activity, setActivity] = useState<any>(null)
    const [activityLoading, setActivityLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("posts")
    const [filterType, setFilterType] = useState<string>("all")

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        location: "",
        gotra: "",
        bio: "",
        familyMembers: [] as any[],
    })

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                mobile: user.mobile || "",
                location: user.location || "",
                gotra: user.gotra || "",
                bio: user.bio || "",
                familyMembers: user.familyMembers || [],
            })
        }
    }, [user])

    const addFamilyMember = () => {
        setFormData(prev => ({
            ...prev,
            familyMembers: [
                ...prev.familyMembers,
                { name: "", relationship: "", dob: "", occupation: "" }
            ]
        }))
    }

    const removeFamilyMember = (index: number) => {
        setFormData(prev => ({
            ...prev,
            familyMembers: prev.familyMembers.filter((_, i) => i !== index)
        }))
    }

    const updateFamilyMember = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const updated = [...prev.familyMembers]
            updated[index] = { ...updated[index], [field]: value }
            return { ...prev, familyMembers: updated }
        })
    }

    // Add validation for family members later if needed, but we'll focus on the core flow first.

    useEffect(() => {
        const fetchActivity = async () => {
            if (!user) return
            try {
                const token = await getToken()
                const headers: Record<string, string> = {}
                if (token) headers['Authorization'] = `Bearer ${token}`
                const res = await fetch('/api/profile/activity', { headers })
                if (res.ok) {
                    setActivity(await res.json())
                }
            } catch (error) {
                console.error("Failed to fetch activity", error)
            } finally {
                setActivityLoading(false)
            }
        }
        fetchActivity()
    }, [user])

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
        }
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            name: [validateRequired(formData.name, 'Full Name'), validateMinLength(formData.name, 2, 'Full Name')],
            ...(formData.mobile ? { mobile: [validatePhone(formData.mobile)] } : {}),
            ...(formData.bio ? { bio: [validateMaxLength(formData.bio, 500, 'About Me')] } : {}),
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers,
                body: JSON.stringify(formData),
            })
            if (res.ok) {
                await refreshUser()
                setIsEditing(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError("")
        setPasswordSuccess("")

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Passwords do not match.")
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.")
            return
        }

        setPasswordLoading(true)
        const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
        if (result.success) {
            setPasswordSuccess("Password changed successfully!")
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } else {
            setPasswordError(result.message || "Failed to change password.")
        }
        setPasswordLoading(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("image", file)

        setUploading(true)
        try {
            const token = await getToken()
            const res = await fetch("/api/profile/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            })
            if (res.ok) {
                await refreshUser()
            }
        } catch (error) {
            console.error("Upload failed", error)
        } finally {
            setUploading(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">

                {/* Profile Header Card */}
                <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden mb-12 rounded-[3rem] bg-white">
                    <div className="h-48 bg-slate-900 relative overflow-hidden group">
                        {/* Decorative pattern for header */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                        </div>

                        {isEditing ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="absolute top-6 right-6 bg-white/10 hover:bg-white text-white hover:text-slate-900 border-0 rounded-full px-6 font-bold backdrop-blur-md transition-all"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel Edit
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="absolute top-6 right-6 bg-white/10 hover:bg-white text-white hover:text-slate-900 border-0 rounded-full px-6 font-bold backdrop-blur-md transition-all"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit className="h-4 w-4 mr-2" /> Edit Profile
                            </Button>
                        )}
                    </div>

                    <CardContent className="pt-0 pb-12 px-8 sm:px-12 relative">
                        <div className="flex flex-col items-center -mt-20 mb-8">
                            <div className="relative h-40 w-40 rounded-[2.5rem] border-[6px] border-white bg-slate-50 shadow-2xl overflow-hidden group">
                                {user.profileImage ? (
                                    <Image src={user.profileImage} alt={user.name || "Profile"} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-900 font-black text-4xl">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white"
                                >
                                    {uploading ? <Loader2 className="h-10 w-10 animate-spin" /> : (
                                        <>
                                            <Camera className="h-10 w-10 mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                                        </>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </div>

                            {!isEditing && (
                                <div className="text-center mt-6">
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">{user.name}</h1>
                                    <p className="text-lg text-slate-500 font-bold mb-6">{user.email}</p>

                                    <div className="flex flex-wrap justify-center gap-4 text-sm font-bold">
                                        {user.location && (
                                            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-100 text-slate-600">
                                                <MapPin className="h-4 w-4 text-secondary" /> {user.location}
                                            </div>
                                        )}
                                        {user.gotra && (
                                            <div className="px-5 py-2.5 bg-secondary/10 text-secondary rounded-full border border-secondary/20 font-black uppercase tracking-widest text-[10px]">
                                                Gotra: {user.gotra}
                                            </div>
                                        )}
                                        {user.mobile && (
                                            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-100 text-slate-600">
                                                <Phone className="h-4 w-4 text-secondary" /> {user.mobile}
                                            </div>
                                        )}
                                    </div>

                                    {user.bio && (
                                        <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 max-w-2xl mx-auto italic text-slate-600 text-lg leading-relaxed font-medium">
                                            "{user.bio}"
                                        </div>
                                    )}

                                    {/* Family Details View */}
                                    {user.status === 'approved' && user.familyMembers && user.familyMembers.length > 0 && (
                                        <div className="mt-12 w-full max-w-2xl mx-auto text-left">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-secondary/10 rounded-xl">
                                                    <Heart className="h-5 w-5 text-secondary" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Family Members</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {user.familyMembers.map((member: any) => (
                                                    <div key={member.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                                        <div className="flex items-start gap-4">
                                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-secondary/10 transition-colors">
                                                                {['Son', 'Daughter', 'Child'].includes(member.relationship) ? (
                                                                    <Baby className="h-6 w-6 text-secondary" />
                                                                ) : (
                                                                    <UserIcon className="h-6 w-6 text-slate-400 group-hover:text-secondary transition-colors" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-slate-900 leading-tight">{member.name}</h4>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-0.5">{member.relationship}</p>
                                                                {member.occupation && (
                                                                    <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                                                                        <Briefcase className="h-3 w-3" /> {member.occupation}
                                                                    </p>
                                                                )}
                                                                {member.dob && (
                                                                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                                                                        <Calendar className="h-3 w-3" /> {new Date(member.dob).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {user.status !== 'approved' && (
                                        <div className="mt-10 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 max-w-2xl mx-auto flex items-center gap-4 text-amber-800">
                                            <ShieldCheck className="h-6 w-6 shrink-0 opacity-50" />
                                            <p className="text-sm font-bold leading-relaxed">
                                                Verify your account to add family details and unlock more community features.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="name" className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Full Name *</Label>
                                        <Input id="name" name="name" value={formData.name} onChange={handleChange} className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold ${errors.name ? 'border-red-500' : ''}`} />
                                        {errors.name && <p className="text-red-500 text-xs mt-1 font-bold ml-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="gotra" className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Gotra</Label>
                                        <Input id="gotra" name="gotra" value={formData.gotra} onChange={handleChange} placeholder="e.g. Kashyapa" className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="mobile" className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Mobile Number</Label>
                                        <Input id="mobile" name="mobile" value={formData.mobile} onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            setFormData(prev => ({ ...prev, mobile: val }))
                                            if (errors.mobile) setErrors(prev => { const n = { ...prev }; delete n.mobile; return n })
                                        }} maxLength={10} className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold ${errors.mobile ? 'border-red-500' : ''}`} />
                                        {errors.mobile && <p className="text-red-500 text-xs mt-1 font-bold ml-1">{errors.mobile}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="location" className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Location</Label>
                                        <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="City, State" className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="bio" className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">About Me (max 500 chars)</Label>
                                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Share a brief introduction about yourself..." rows={4} className={`rounded-[2rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 py-4 font-bold resize-none ${errors.bio ? 'border-red-500' : ''}`} />
                                    {errors.bio && <p className="text-red-500 text-xs mt-1 font-bold ml-1">{errors.bio}</p>}
                                </div>
                                {user.status === 'approved' && (
                                    <div className="space-y-6 pt-6 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-secondary/10 rounded-xl">
                                                    <Heart className="h-4 w-4 text-secondary" />
                                                </div>
                                                <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Family Details</Label>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addFamilyMember}
                                                className="rounded-xl border-slate-100 font-bold text-[10px] uppercase tracking-widest h-10 px-4 hover:bg-slate-50 transition-all"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-2" /> Add Member
                                            </Button>
                                        </div>

                                        <div className="grid gap-6">
                                            {formData.familyMembers.map((member, index) => (
                                                <div key={index} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group animate-in fade-in slide-in-from-right-4 duration-300">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFamilyMember(index)}
                                                        className="absolute top-4 right-4 h-8 w-8 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                                                            <Input
                                                                value={member.name}
                                                                onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                                                                placeholder="Member Name"
                                                                className="h-12 rounded-xl border-slate-200 bg-white focus:ring-secondary/20 px-4 font-bold text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Relationship</Label>
                                                            <Select
                                                                value={member.relationship}
                                                                onValueChange={(val) => updateFamilyMember(index, 'relationship', val)}
                                                            >
                                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white focus:ring-secondary/20 px-4 font-bold text-sm">
                                                                    <SelectValue placeholder="Select Relation" />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                                    {['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'].map(rel => (
                                                                        <SelectItem key={rel} value={rel} className="font-bold py-2">{rel}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</Label>
                                                            <Input
                                                                type="date"
                                                                value={member.dob ? new Date(member.dob).toISOString().split('T')[0] : ""}
                                                                onChange={(e) => updateFamilyMember(index, 'dob', e.target.value)}
                                                                className="h-12 rounded-xl border-slate-200 bg-white focus:ring-secondary/20 px-4 font-bold text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Occupation</Label>
                                                            <Input
                                                                value={member.occupation || ""}
                                                                onChange={(e) => updateFamilyMember(index, 'occupation', e.target.value)}
                                                                placeholder="e.g. Student, Engineer"
                                                                className="h-12 rounded-xl border-slate-200 bg-white focus:ring-secondary/20 px-4 font-bold text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {formData.familyMembers.length === 0 && (
                                                <div className="py-10 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">No family members added yet</p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={addFamilyMember}
                                                        className="rounded-xl"
                                                    >
                                                        Add First Member
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center pt-4">
                                    <Button type="submit" className="w-full h-16 bg-slate-900 hover:bg-secondary text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all uppercase tracking-widest" disabled={loading}>
                                        {loading ? <Loader2 className="h-6 w-6 mr-2 animate-spin" /> : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs & Content */}
                {!isEditing && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex p-1.5 bg-white rounded-full shadow-xl shadow-slate-200/50 border border-slate-100">
                                <button
                                    onClick={() => setActiveTab("posts")}
                                    className={cn(
                                        "px-8 py-3 rounded-full text-sm font-black transition-all duration-300 uppercase tracking-widest",
                                        activeTab === "posts"
                                            ? "bg-slate-900 text-white shadow-lg"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Activity
                                </button>
                                <button
                                    onClick={() => setActiveTab("security")}
                                    className={cn(
                                        "px-8 py-3 rounded-full text-sm font-black transition-all duration-300 uppercase tracking-widest",
                                        activeTab === "security"
                                            ? "bg-slate-900 text-white shadow-lg"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Security
                                </button>
                            </div>
                        </div>

                        {activeTab === "posts" && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 ml-4">
                                        <div className="h-2 w-8 bg-secondary rounded-full" />
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Filter Feed</h3>
                                    </div>
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-[200px] h-12 rounded-2xl border-none bg-slate-50 focus:ring-secondary/20 px-6 font-bold text-slate-600">
                                            <SelectValue placeholder="All Activities" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                            <SelectItem value="all" className="font-bold py-3">All Activities</SelectItem>
                                            <SelectItem value="achievement" className="font-bold py-3 text-secondary">Achievements</SelectItem>
                                            <SelectItem value="business" className="font-bold py-3 text-green-600">Businesses</SelectItem>
                                            <SelectItem value="job" className="font-bold py-3 text-blue-600">Jobs</SelectItem>
                                            <SelectItem value="event" className="font-bold py-3 text-amber-600">Events</SelectItem>
                                            <SelectItem value="scholarship" className="font-bold py-3 text-purple-600">Scholarships</SelectItem>
                                            <SelectItem value="mentorship" className="font-bold py-3 text-pink-600">Mentorship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {activityLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                        <Loader2 className="h-12 w-12 animate-spin text-secondary mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Activity...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {(() => {
                                            const combined = [
                                                ...(activity?.businesses || []).map((item: any) => ({ ...item, actType: 'business' })),
                                                ...(activity?.jobs || []).map((item: any) => ({ ...item, actType: 'job' })),
                                                ...(activity?.events || []).map((item: any) => ({ ...item, actType: 'event' })),
                                                ...(activity?.scholarships || []).map((item: any) => ({ ...item, actType: 'scholarship' })),
                                                ...(activity?.mentorships || []).map((item: any) => ({ ...item, actType: 'mentorship' })),
                                                ...(activity?.achievements || []).map((item: any) => ({ ...item, actType: 'achievement' })),
                                            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

                                            const filtered = filterType === "all"
                                                ? combined
                                                : combined.filter(item => item.actType === filterType)

                                            if (filtered.length === 0) {
                                                return (
                                                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
                                                        <div className="h-20 w-20 bg-slate-50 flex items-center justify-center rounded-[2rem] mx-auto mb-6">
                                                            <Users className="h-10 w-10 text-slate-200" />
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-900 mb-2">No activities found</h3>
                                                        <p className="text-slate-500 font-bold mb-8">You haven't shared anything in this category yet.</p>
                                                        <Link href="/social">
                                                            <Button className="h-14 bg-slate-900 hover:bg-secondary text-white rounded-2xl px-10 font-black uppercase tracking-widest transition-all">
                                                                Explore Social Feed
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )
                                            }

                                            const StatusBadge = ({ status }: { status?: string }) => {
                                                if (!status || status === 'approved') return null
                                                if (status === 'pending') return (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                        Pending
                                                    </span>
                                                )
                                                if (status === 'rejected') return (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                                                        Rejected
                                                    </span>
                                                )
                                                return null
                                            }

                                            return filtered.map((item) => {
                                                const config: Record<string, { icon: any, color: string, label: string, bg: string }> = {
                                                    'achievement': { icon: <Trophy className="h-4 w-4" />, color: 'text-secondary', label: 'Achievement', bg: 'bg-secondary/10' },
                                                    'business': { icon: <Store className="h-4 w-4" />, color: 'text-green-600', label: 'Business', bg: 'bg-green-50' },
                                                    'job': { icon: <Briefcase className="h-4 w-4" />, color: 'text-blue-600', label: 'Job Post', bg: 'bg-blue-50' },
                                                    'event': { icon: <Calendar className="h-4 w-4" />, color: 'text-amber-600', label: 'Event', bg: 'bg-amber-50' },
                                                    'scholarship': { icon: <GraduationCap className="h-4 w-4" />, color: 'text-purple-600', label: 'Scholarship', bg: 'bg-purple-50' },
                                                    'mentorship': { icon: <Users className="h-4 w-4" />, color: 'text-pink-600', label: 'Mentorship', bg: 'bg-pink-50' },
                                                }
                                                const c = config[item.actType]

                                                return (
                                                    <Card key={`${item.actType}-${item.id}`} className="group border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
                                                        <CardContent className="p-8">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                                                <div className="space-y-4 flex-1">
                                                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 ${c.bg} ${c.color} rounded-full text-[10px] font-black uppercase tracking-widest`}>
                                                                        {c.icon} {c.label}
                                                                    </div>
                                                                    <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-secondary transition-colors">
                                                                        {item.actType === 'achievement' ? item.title :
                                                                            item.actType === 'business' ? item.name :
                                                                                item.actType === 'event' ? item.title :
                                                                                    item.actType === 'job' ? item.title :
                                                                                        item.title || item.name}
                                                                    </h3>
                                                                    <p className="text-slate-500 font-bold line-clamp-2 max-w-2xl leading-relaxed">
                                                                        {item.description || item.bio || (item.actType === 'business' ? `${item.category} • ${item.city}` : '')}
                                                                    </p>
                                                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-3 self-stretch sm:self-auto justify-between">
                                                                    <StatusBadge status={item.status} />
                                                                    <Link href={
                                                                        item.actType === 'business' ? `/business/${item.id}` :
                                                                            item.actType === 'event' ? `/events/${item.id}` :
                                                                                item.actType === 'achievement' ? `/achievements` : '#'
                                                                    }>
                                                                        <Button variant="outline" className="h-12 rounded-2xl border-slate-100 text-slate-900 font-black px-6 hover:bg-slate-900 hover:text-white transition-all">
                                                                            View Record
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
                                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden group">
                                        <div className="absolute -right-8 -bottom-8 opacity-10 transition-transform group-hover:scale-110 duration-700">
                                            <ShieldCheck className="h-40 w-40 text-secondary" />
                                        </div>
                                        <h3 className="text-2xl font-black relative z-10 tracking-tight">Account Security</h3>
                                        <p className="text-slate-400 text-sm font-bold relative z-10 mt-1">Manage your password and authentication</p>
                                    </div>
                                    <CardContent className="p-8 md:p-12">
                                        {isPasswordUser ? (
                                            <form onSubmit={handlePasswordChange} className="space-y-8">
                                                <div className="space-y-3">
                                                    <Label htmlFor="currentPassword" title="Current Password" className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Current Password</Label>
                                                    <Input
                                                        id="currentPassword"
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="newPassword" title="New Password" className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">New Password</Label>
                                                    <Input
                                                        id="newPassword"
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="confirmPassword" title="Confirm New Password" className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Confirm New Password</Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold"
                                                        required
                                                    />
                                                </div>

                                                {passwordError && (
                                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                                                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0">
                                                            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                                        </div>
                                                        <p className="text-sm font-bold text-red-600">{passwordError}</p>
                                                    </div>
                                                )}
                                                {passwordSuccess && (
                                                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                                                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0">
                                                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                                                        </div>
                                                        <p className="text-sm font-bold text-green-600">{passwordSuccess}</p>
                                                    </div>
                                                )}

                                                <Button
                                                    type="submit"
                                                    className="w-full h-16 bg-slate-900 hover:bg-secondary text-white rounded-2xl font-black text-lg transition-all uppercase tracking-widest"
                                                    disabled={passwordLoading}
                                                >
                                                    {passwordLoading ? <Loader2 className="h-6 w-6 mr-2 animate-spin" /> : "Update Password"}
                                                </Button>
                                            </form>
                                        ) : (
                                            <div className="text-center py-12 px-6 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                                <div className="h-20 w-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                                    <Image src="/google-icon.svg" alt="Google" width={32} height={32} />
                                                </div>
                                                <h4 className="text-xl font-black text-slate-900 mb-2">Google Managed Account</h4>
                                                <p className="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">
                                                    Your account is securely managed via Google. Password settings can be adjusted in your Google Account dashboard.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
