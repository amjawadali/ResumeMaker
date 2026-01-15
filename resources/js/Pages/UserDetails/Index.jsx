import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react'; // usePage to access flash messages if needed directly or via props
import { User, GraduationCap, Briefcase, Zap, Award, Languages, Plus, Trash2, Edit2, ChevronDown, Search, Share2, ChevronRight, CheckCircle, AlertCircle, Camera, UploadCloud, X, Sparkles, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { toast } from 'sonner';
import { confirmAction } from '@/Components/ConfirmDialog';

export default function UserDetails({ auth, userDetail, educations, experiences, skills, certifications, languages }) {
    const [activeTab, setActiveTab] = useState('personal');
    const [showMultimediaModal, setShowMultimediaModal] = useState(false); // For image upload if needed

    // AI Extraction states
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [extracting, setExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const [saving, setSaving] = useState(false);
    // Modal states
    const [modals, setModals] = useState({
        education: false,
        experience: false,
        skill: false,
        certification: false,
        language: false
    });
    const toggleModal = (key, val) => setModals(m => ({ ...m, [key]: val }));

    // Personal Info Form
    const { data: personalData, setData: setPersonalData, post: postPersonal, processing: processingPersonal, errors: errorsPersonal } = useForm({
        full_name: userDetail?.full_name || '',
        email: userDetail?.email || '',
        phone: userDetail?.phone || '',
        address: userDetail?.address || '',
        website: userDetail?.website || '',
        professional_summary: userDetail?.professional_summary || '',
        // social_links parsing logic might be complex if JSON is passed, assume it's array
        social_links: userDetail?.social_links || [],
        profile_photo: null,
    });

    const [photoPreview, setPhotoPreview] = useState(userDetail?.profile_photo ? `/storage/${userDetail.profile_photo}` : null);

    const handlePhotoDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setPersonalData('profile_photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPersonalData('profile_photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setPersonalData('profile_photo', null);
        setPhotoPreview(null);
        // Note: Actual server deletion would require a separate endpoint if we wanted to delete it immediately, 
        // but setting it to null here primarily clears the *new* upload. 
        // If we want to remove the existing one, we might need a flag or separate action.
        // For now, let's assume this just clears the current selection/preview.
        if (userDetail?.profile_photo) {
            setPhotoPreview(`/storage/${userDetail.profile_photo}`); // Restore original if we just cancelled a new upload? 
            // Or if used to remove existing, we need a way to signal "delete" to backend.
            // Simpler approach for now: Just clear the input and preview of NEW file.
        }
    };

    const submitPersonal = (e) => {
        e.preventDefault();
        postPersonal(route('user-details.update-personal-info'), {
            forceFormData: true,
        });
    };

    // Generic delete handler
    const handleDelete = async (routeUrl) => {
        const confirmed = await confirmAction({
            title: 'Delete Item?',
            message: 'Are you sure you want to delete this item? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete'
        });

        if (confirmed) {
            router.delete(routeUrl, {
                onSuccess: () => toast.success('Item deleted successfully')
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Profile Builder" />

            <div className="relative py-10 bg-[#0f172a] min-h-screen text-slate-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="glass-panel bg-white/5 rounded-3xl shadow-2xl overflow-hidden sticky top-24 border border-white/5">
                                <div className="p-6 border-b border-white/5 bg-white/5 relative overflow-hidden">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Workspace</h3>
                                    <p className="text-xl font-black text-white leading-tight tracking-tight">Profile Builder</p>
                                </div>
                                <nav className="p-3 space-y-1">
                                    {[
                                        { id: 'personal', label: 'Personal Info', icon: <User size={16} /> },
                                        { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
                                        { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
                                        { id: 'skills', label: 'Skills', icon: <Zap size={16} /> },
                                        { id: 'certifications', label: 'Certifications', icon: <Award size={16} /> },
                                        { id: 'languages', label: 'Languages', icon: <Languages size={16} /> },
                                        { id: 'ai-extract', label: 'Create via AI', icon: <Sparkles size={16} /> },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 group ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                                                {tab.icon}
                                            </div>
                                            <span className="font-bold tracking-wider">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-10">
                            {/* Personal Info Tab */}
                            {activeTab === 'personal' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-8 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                        <div>
                                            <h3 className="text-xl font-black text-white">Personal Information</h3>
                                            <p className="text-xs font-medium text-slate-400 mt-1">Foundational data for all your resumes.</p>
                                        </div>
                                    </div>
                                    <form onSubmit={submitPersonal} className="space-y-6">
                                        {/* Profile Photo Upload */}
                                        <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-white/5 rounded-2xl border border-dashed border-white/20">
                                            <div
                                                className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-800 ring-4 ring-white/10 group cursor-pointer"
                                                onDragOver={e => e.preventDefault()}
                                                onDrop={handlePhotoDrop}
                                                onClick={() => document.getElementById('photo-upload').click()}
                                            >
                                                {photoPreview ? (
                                                    <img src={photoPreview} className="w-full h-full object-cover" alt="Profile" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        <User size={48} />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="text-white" />
                                                </div>
                                            </div>

                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-white font-bold text-lg mb-1">Profile Picture</h4>
                                                <p className="text-slate-400 text-sm mb-4">
                                                    Drag & drop your new photo here, or click to browse. <br />
                                                    <span className="text-xs text-slate-500">Supports JPG, PNG (Max 2MB)</span>
                                                </p>
                                                <input
                                                    id="photo-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handlePhotoSelect}
                                                />
                                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('photo-upload').click()}
                                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wide text-white transition-colors"
                                                    >
                                                        Upload New
                                                    </button>
                                                    {photoPreview && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPersonalData('profile_photo', null);
                                                                setPhotoPreview(userDetail?.profile_photo ? `/storage/${userDetail.profile_photo}` : null);
                                                            }}
                                                            className="px-4 py-2 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2">
                                                <InputLabel value="Full Name" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    value={personalData.full_name}
                                                    onChange={e => setPersonalData('full_name', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.full_name} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value="Email" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    type="email"
                                                    value={personalData.email}
                                                    onChange={e => setPersonalData('email', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.email} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value="Phone" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    value={personalData.phone}
                                                    onChange={e => setPersonalData('phone', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.phone} className="mt-2" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputLabel value="Address" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    value={personalData.address}
                                                    onChange={e => setPersonalData('address', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.address} className="mt-2" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputLabel value="Website / Portfolio" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    value={personalData.website}
                                                    onChange={e => setPersonalData('website', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.website} className="mt-2" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputLabel value="Professional Summary" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <textarea
                                                    value={personalData.professional_summary}
                                                    onChange={e => setPersonalData('professional_summary', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 min-h-[120px] p-4 text-sm font-medium text-white focus:border-purple-500 focus:ring-purple-500 bg-transparent"
                                                />
                                                <InputError message={errorsPersonal.professional_summary} className="mt-2" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-6">
                                            <PrimaryButton disabled={processingPersonal} className="px-12 py-5 bg-purple-600 rounded-2xl">
                                                Save Profile Data
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Education Tab */}
                            {activeTab === 'education' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-8 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-xl font-black text-white">Academic History</h3>
                                            <p className="text-xs font-medium text-slate-400 mt-1">Manage your degrees and qualifications.</p>
                                        </div>
                                        <button onClick={() => toggleModal('education', true)} className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {educations.map(edu => (
                                            <div key={edu.id} className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-xl text-white">{edu.degree}</h4>
                                                        <p className="font-bold text-slate-400 text-lg">{edu.institution}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                                                            {edu.start_date} — {edu.currently_studying ? 'Present' : edu.end_date}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => handleDelete(route('user-details.education.destroy', edu.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {educations.length === 0 && (
                                            <div className="text-center py-20 opacity-50"><p>No education records found</p></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Validations for other tabs omitted for brevity - Assume similar structure */}
                            {/* Experience Tab */}
                            {activeTab === 'experience' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Work History</h3>
                                        </div>
                                        <button onClick={() => toggleModal('experience', true)} className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {experiences.map(exp => (
                                            <div key={exp.id} className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-xl text-white">{exp.position}</h4>
                                                        <p className="font-bold text-slate-400 text-lg">{exp.company}</p>
                                                    </div>
                                                    <button onClick={() => handleDelete(route('user-details.experience.destroy', exp.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills Tab */}
                            {activeTab === 'skills' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Skills</h3>
                                        </div>
                                        <button onClick={() => toggleModal('skill', true)} className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {skills.map(skill => (
                                            <div key={skill.id} className="group relative bg-white/5 border border-white/5 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all flex items-center gap-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-white">{skill.name}</h4>
                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">{skill.level}</p>
                                                </div>
                                                <button onClick={() => handleDelete(route('user-details.skill.destroy', skill.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Certifications Tab */}
                            {activeTab === 'certifications' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Certifications</h3>
                                        </div>
                                        <button onClick={() => toggleModal('certification', true)} className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {certifications.map(cert => (
                                            <div key={cert.id} className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-xl text-white">{cert.name}</h4>
                                                        <p className="font-bold text-slate-400 text-lg">{cert.issuing_organization}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{cert.issue_date}</p>
                                                    </div>
                                                    <button onClick={() => handleDelete(route('user-details.certification.destroy', cert.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Languages Tab */}
                            {activeTab === 'languages' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Languages</h3>
                                        </div>
                                        <button onClick={() => toggleModal('language', true)} className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {languages.map(lang => (
                                            <div key={lang.id} className="group relative bg-white/5 border border-white/5 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all flex items-center gap-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-white">{lang.name}</h4>
                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">{lang.proficiency}</p>
                                                </div>
                                                <button onClick={() => handleDelete(route('user-details.language.destroy', lang.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Extraction Tab */}
                            {activeTab === 'ai-extract' && (
                                <AiExtractionTab
                                    selectedFile={selectedFile}
                                    setSelectedFile={setSelectedFile}
                                    filePreview={filePreview}
                                    setFilePreview={setFilePreview}
                                    extracting={extracting}
                                    setExtracting={setExtracting}
                                    extractedData={extractedData}
                                    setExtractedData={setExtractedData}
                                    saving={saving}
                                    setSaving={setSaving}
                                />
                            )}

                        </div>
                    </div>
                </div>

                {/* Modals */}
                <Modal show={modals.education} onClose={() => toggleModal('education', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Education</h2>
                        <EducationForm onSuccess={() => toggleModal('education', false)} />
                    </div>
                </Modal>
                <Modal show={modals.experience} onClose={() => toggleModal('experience', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Experience</h2>
                        <ExperienceForm onSuccess={() => toggleModal('experience', false)} />
                    </div>
                </Modal>
                <Modal show={modals.skill} onClose={() => toggleModal('skill', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Skill</h2>
                        <SkillForm onSuccess={() => toggleModal('skill', false)} />
                    </div>
                </Modal>
                <Modal show={modals.certification} onClose={() => toggleModal('certification', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Certification</h2>
                        <CertificationForm onSuccess={() => toggleModal('certification', false)} />
                    </div>
                </Modal>
                <Modal show={modals.language} onClose={() => toggleModal('language', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Language</h2>
                        <LanguageForm onSuccess={() => toggleModal('language', false)} />
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}

// Sub-components for Forms to keep main file clean-ish
function EducationForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        institution: '', degree: '', start_date: '', end_date: '', currently_studying: false, description: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('user-details.education.store'), { onSuccess });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel value="Institution" />
                <TextInput value={data.institution} onChange={e => setData('institution', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.institution} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Degree" />
                <TextInput value={data.degree} onChange={e => setData('degree', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.degree} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel value="Start Date" />
                    <TextInput type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.start_date} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="End Date" />
                    <TextInput type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.end_date} className="mt-2" />
                </div>
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={processing}>Save</PrimaryButton></div>
        </form>
    );
}

function ExperienceForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        company: '', position: '', start_date: '', end_date: '', currently_working: false, location: '', responsibilities: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('user-details.experience.store'), { onSuccess });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel value="Company" />
                <TextInput value={data.company} onChange={e => setData('company', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.company} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Position" />
                <TextInput value={data.position} onChange={e => setData('position', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.position} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel value="Start Date" />
                    <TextInput type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.start_date} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="End Date" />
                    <TextInput type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.end_date} className="mt-2" />
                </div>
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={processing}>Save</PrimaryButton></div>
        </form>
    );
}

function SkillForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({ name: '', level: 'Intermediate' });
    const submit = (e) => { e.preventDefault(); post(route('user-details.skill.store'), { onSuccess }); };
    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel value="Skill Name" />
                <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.name} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Level" />
                <select value={data.level} onChange={e => setData('level', e.target.value)} className="w-full rounded-2xl border-white/10 bg-[#0f172a] text-white px-4 py-3">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                </select>
                <InputError message={errors.level} className="mt-2" />
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={processing}>Save</PrimaryButton></div>
        </form>
    );
}

function CertificationForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({ name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '' });
    const submit = (e) => { e.preventDefault(); post(route('user-details.certification.store'), { onSuccess }); };
    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel value="Certification Name" />
                <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.name} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Issuing Org" />
                <TextInput value={data.issuing_organization} onChange={e => setData('issuing_organization', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.issuing_organization} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel value="Issue Date" />
                    <TextInput type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.issue_date} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="Expiration Date" />
                    <TextInput type="date" value={data.expiration_date} onChange={e => setData('expiration_date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.expiration_date} className="mt-2" />
                </div>
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={processing}>Save</PrimaryButton></div>
        </form>
    );
}

function LanguageForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({ name: '', proficiency: 'Intermediate' });
    const submit = (e) => { e.preventDefault(); post(route('user-details.language.store'), { onSuccess }); };
    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel value="Language" />
                <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.name} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Proficiency" />
                <select value={data.proficiency} onChange={e => setData('proficiency', e.target.value)} className="w-full rounded-2xl border-white/10 bg-[#0f172a] text-white px-4 py-3">
                    <option>Native</option><option>Fluent</option><option>Intermediate</option><option>Basic</option>
                </select>
                <InputError message={errors.proficiency} className="mt-2" />
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={processing}>Save</PrimaryButton></div>
        </form>
    );
}

// AI Extraction Tab Component
function AiExtractionTab({ selectedFile, setSelectedFile, filePreview, setFilePreview, extracting, setExtracting, extractedData, setExtractedData, saving, setSaving }) {

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileSelect = (file) => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a PDF, image (JPG/PNG), or Word document');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            toast.error('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleExtract = async () => {
        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        setExtracting(true);
        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const response = await axios.post(route('user-details.extract-from-document'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setExtractedData(response.data.data);
                toast.success('Profile data extracted successfully!');
            } else {
                toast.error(response.data.error || 'Failed to extract data');
            }
        } catch (error) {
            console.error('Extraction error:', error);
            toast.error(error.response?.data?.error || 'An error occurred during extraction');
        } finally {
            setExtracting(false);
        }
    };

    const handleSave = async () => {
        if (!extractedData) {
            toast.error('No data to save');
            return;
        }

        setSaving(true);

        try {
            const response = await axios.post(route('user-details.save-extracted-data'), {
                data: extractedData
            });

            if (response.data.success) {
                toast.success('Profile data saved successfully!');
                // Reload the page to show updated data
                window.location.reload();
            } else {
                toast.error(response.data.error || 'Failed to save data');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.error || 'An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <Sparkles className="text-purple-400" size={24} />
                        Create Profile via AI
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-1">Upload your resume/CV and let AI extract your profile data</p>
                </div>
            </div>

            {!extractedData ? (
                <div className="space-y-6">
                    {/* File Upload Zone */}
                    <div
                        className="relative border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-all cursor-pointer bg-white/5"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('ai-file-upload').click()}
                    >
                        <input
                            id="ai-file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                        />

                        {selectedFile ? (
                            <div className="space-y-4">
                                {filePreview && (
                                    <img src={filePreview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-lg" />
                                )}
                                <div className="flex items-center justify-center gap-3 text-white">
                                    <FileText size={24} className="text-purple-400" />
                                    <span className="font-bold">{selectedFile.name}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                            setFilePreview(null);
                                        }}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <UploadCloud size={64} className="mx-auto text-slate-500" />
                                <div>
                                    <p className="text-white font-bold text-lg mb-2">Drop your resume here or click to browse</p>
                                    <p className="text-slate-400 text-sm">
                                        Supports PDF, Images (JPG, PNG), and Word documents (DOC, DOCX)
                                    </p>
                                    <p className="text-slate-500 text-xs mt-2">Maximum file size: 10MB</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Extract Button */}
                    {selectedFile && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleExtract}
                                disabled={extracting}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                {extracting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Extracting Profile Data...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Extract Profile Data
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Extracted Data Review */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-3 text-green-400">
                            <CheckCircle size={24} />
                            <div>
                                <p className="font-bold">Data Extracted Successfully!</p>
                                <p className="text-sm text-slate-400">Review the extracted information below and click "Save to Profile" to add it to your profile.</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    {extractedData.personal_info && Object.values(extractedData.personal_info).some(v => v !== null) && (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                                <User size={20} className="text-purple-400" />
                                Personal Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {Object.entries(extractedData.personal_info).map(([key, value]) => value && (
                                    <div key={key}>
                                        <span className="text-slate-500 text-xs uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                                        <p className="text-white font-medium">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {extractedData.education && extractedData.education.length > 0 && (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                                <GraduationCap size={20} className="text-purple-400" />
                                Education ({extractedData.education.length})
                            </h4>
                            <div className="space-y-3">
                                {extractedData.education.map((edu, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-xl p-4">
                                        <p className="text-white font-bold">{edu.degree}</p>
                                        <p className="text-slate-400 text-sm">{edu.institution}</p>
                                        <p className="text-slate-500 text-xs mt-1">{edu.start_date} - {edu.currently_studying ? 'Present' : edu.end_date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {extractedData.experience && extractedData.experience.length > 0 && (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-purple-400" />
                                Experience ({extractedData.experience.length})
                            </h4>
                            <div className="space-y-3">
                                {extractedData.experience.map((exp, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-xl p-4">
                                        <p className="text-white font-bold">{exp.position}</p>
                                        <p className="text-slate-400 text-sm">{exp.company}</p>
                                        <p className="text-slate-500 text-xs mt-1">{exp.start_date} - {exp.currently_working ? 'Present' : exp.end_date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {extractedData.skills && extractedData.skills.length > 0 && (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                                <Zap size={20} className="text-purple-400" />
                                Skills ({extractedData.skills.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {extractedData.skills.map((skill, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-white/10 rounded-xl text-white text-sm font-medium">
                                        {skill.name} <span className="text-slate-400 text-xs">({skill.level})</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {extractedData.certifications && extractedData.certifications.length > 0 && (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                                <Award size={20} className="text-purple-400" />
                                Certifications ({extractedData.certifications.length})
                            </h4>
                            <div className="space-y-3">
                                {extractedData.certifications.map((cert, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-xl p-4">
                                        <p className="text-white font-bold">{cert.name}</p>
                                        <p className="text-slate-400 text-sm">{cert.issuing_organization}</p>
                                        <p className="text-slate-500 text-xs mt-1">{cert.issue_date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {extractedData.languages && extractedData.languages.length > 0 && (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                                <Languages size={20} className="text-purple-400" />
                                Languages ({extractedData.languages.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {extractedData.languages.map((lang, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-white/10 rounded-xl text-white text-sm font-medium">
                                        {lang.name} <span className="text-slate-400 text-xs">({lang.proficiency})</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-white/10">
                        <button
                            onClick={() => {
                                setExtractedData(null);
                                setSelectedFile(null);
                                setFilePreview(null);
                            }}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-sm uppercase tracking-wider transition-all"
                        >
                            Start Over
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Save to Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
