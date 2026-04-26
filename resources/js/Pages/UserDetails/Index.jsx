import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react'; // usePage to access flash messages if needed directly or via props
import { User, GraduationCap, Briefcase, Zap, Award, Languages, Plus, Trash2, Edit2, ChevronDown, Search, Share2, ChevronRight, Camera, X, Layout, Heart, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { toast } from 'sonner';
import { confirmAction } from '@/Components/ConfirmDialog';
import ProfileProgress from '@/Components/ProfileBuilder/ProfileProgress';

export default function UserDetails({ auth, userDetail, educations, experiences, skills, certifications, languages, projects, awards, volunteerWorks, publications }) {
    const [activeTab, setActiveTab] = useState('personal');
    const [showMultimediaModal, setShowMultimediaModal] = useState(false); // For image upload if needed


    // Modal states
    const [modals, setModals] = useState({
        education: false,
        experience: false,
        skill: false,
        certification: false,
        language: false,
        project: false,
        award: false,
        volunteer: false,
        publication: false
    });
    const toggleModal = (key, val) => setModals(m => ({ ...m, [key]: val }));

    // Personal Info Form
    const { data: personalData, setData: setPersonalData, post: postPersonal, processing: processingPersonal, errors: errorsPersonal } = useForm({
        full_name: userDetail?.full_name || '',
        email: userDetail?.email || '',
        phone: userDetail?.phone || '',
        address: userDetail?.address || '',
        city: userDetail?.city || '',
        state: userDetail?.state || '',
        zip_code: userDetail?.zip_code || '',
        country: userDetail?.country || '',
        website: userDetail?.website || '',
        professional_summary: userDetail?.professional_summary || '',
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
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <ProfileProgress
                                    userDetail={userDetail}
                                    educations={educations}
                                    experiences={experiences}
                                    skills={skills}
                                    certifications={certifications}
                                    languages={languages}
                                    projects={projects}
                                    awards={awards}
                                    volunteerWorks={volunteerWorks}
                                    publications={publications}
                                    onSectionClick={(section) => setActiveTab(section)}
                                />
                              
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
                                            <div>
                                                <InputLabel value="City" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    value={personalData.city}
                                                    onChange={e => setPersonalData('city', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.city} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value="State / Province" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    value={personalData.state}
                                                    onChange={e => setPersonalData('state', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.state} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value="Zip / Postal Code" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    value={personalData.zip_code}
                                                    onChange={e => setPersonalData('zip_code', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.zip_code} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value="Country" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5" />
                                                <TextInput
                                                    value={personalData.country}
                                                    onChange={e => setPersonalData('country', e.target.value)}
                                                    className="block w-full rounded-xl border-white/10 bg-white/5 h-10 px-4 text-sm font-medium text-white focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <InputError message={errorsPersonal.country} className="mt-2" />
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
                                                        {edu.description && <p className="text-sm text-slate-400 mt-3 line-clamp-2">{edu.description}</p>}
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
                                                        {exp.description && <p className="text-sm text-slate-400 mt-3 line-clamp-2">{exp.description}</p>}
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

                            {/* Projects Tab */}
                            {activeTab === 'projects' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Projects</h3>
                                        </div>
                                        <button onClick={() => toggleModal('project', true)} className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {projects.map(project => (
                                            <div key={project.id} className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-xl text-white">{project.title}</h4>
                                                        {project.technologies && <p className="text-slate-400 font-medium">{project.technologies}</p>}
                                                        {project.url && <a href={project.url} target="_blank" className="text-purple-400 text-sm hover:underline">{project.url}</a>}
                                                    </div>
                                                    <button onClick={() => handleDelete(route('user-details.project.destroy', project.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Awards Tab */}
                            {activeTab === 'awards' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Honors & Awards</h3>
                                        </div>
                                        <button onClick={() => toggleModal('award', true)} className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {awards.map(award => (
                                            <div key={award.id} className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-xl text-white">{award.title}</h4>
                                                        <p className="font-bold text-slate-400">{award.issuer}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{award.date}</p>
                                                    </div>
                                                    <button onClick={() => handleDelete(route('user-details.award.destroy', award.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Volunteering Tab */}
                            {activeTab === 'volunteering' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Volunteer Work</h3>
                                        </div>
                                        <button onClick={() => toggleModal('volunteer', true)} className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {volunteerWorks.map(work => (
                                            <div key={work.id} className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-xl text-white">{work.organization}</h4>
                                                        <p className="font-bold text-slate-400">{work.role}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                                                            {work.start_date} — {work.end_date}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => handleDelete(route('user-details.volunteer-work.destroy', work.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Publications Tab */}
                            {activeTab === 'publications' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Publications</h3>
                                        </div>
                                        <button onClick={() => toggleModal('publication', true)} className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {publications.map(pub => (
                                            <div key={pub.id} className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-xl text-white">{pub.title}</h4>
                                                        <p className="font-bold text-slate-400">{pub.publisher}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{pub.date}</p>
                                                    </div>
                                                    <button onClick={() => handleDelete(route('user-details.publication.destroy', pub.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
                <Modal show={modals.project} onClose={() => toggleModal('project', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Project</h2>
                        <ProjectForm onSuccess={() => toggleModal('project', false)} />
                    </div>
                </Modal>
                <Modal show={modals.award} onClose={() => toggleModal('award', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Award</h2>
                        <AwardForm onSuccess={() => toggleModal('award', false)} />
                    </div>
                </Modal>
                <Modal show={modals.volunteer} onClose={() => toggleModal('volunteer', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Volunteer Work</h2>
                        <VolunteerForm onSuccess={() => toggleModal('volunteer', false)} />
                    </div>
                </Modal>
                <Modal show={modals.publication} onClose={() => toggleModal('publication', false)}>
                    <div className="p-10 bg-[#1e293b] text-white">
                        <h2 className="text-2xl font-black mb-6">Add Publication</h2>
                        <PublicationForm onSuccess={() => toggleModal('publication', false)} />
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}

// Sub-components for Forms to keep main file clean-ish
function EducationForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        institution: '', degree: '', start_date: '', end_date: '', currently_studying: false, description: '', city: '', country: '', gpa: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('user-details.education.store'), { onSuccess });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <InputLabel value="Institution" />
                    <TextInput value={data.institution} onChange={e => setData('institution', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.institution} className="mt-2" />
                </div>
                <div className="md:col-span-2">
                    <InputLabel value="Degree" />
                    <TextInput value={data.degree} onChange={e => setData('degree', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.degree} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="City" />
                    <TextInput value={data.city} onChange={e => setData('city', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.city} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="Country" />
                    <TextInput value={data.country} onChange={e => setData('country', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.country} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="GPA" />
                    <TextInput value={data.gpa} onChange={e => setData('gpa', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.gpa} className="mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:col-span-1">
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
                <div className="md:col-span-2">
                    <InputLabel value="Description" />
                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-2xl border-white/10 bg-[#0f172a] text-white px-4 py-3 min-h-[100px]" />
                    <InputError message={errors.description} className="mt-2" />
                </div>
            </div>
            <div className="flex justify-end pt-4"><PrimaryButton disabled={processing}>Save Education</PrimaryButton></div>
        </form>
    );
}

function ExperienceForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        company: '', position: '', start_date: '', end_date: '', currently_working: false, location: '', city: '', country: '', is_remote: false, responsibilities: '', description: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('user-details.experience.store'), { onSuccess });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <InputLabel value="Company" />
                    <TextInput value={data.company} onChange={e => setData('company', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.company} className="mt-2" />
                </div>
                <div className="md:col-span-2">
                    <InputLabel value="Position" />
                    <TextInput value={data.position} onChange={e => setData('position', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.position} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="City" />
                    <TextInput value={data.city} onChange={e => setData('city', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.city} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="Country" />
                    <TextInput value={data.country} onChange={e => setData('country', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.country} className="mt-2" />
                </div>
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={data.is_remote} onChange={e => setData('is_remote', e.target.checked)} className="rounded border-white/10 bg-[#0f172a] text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm text-slate-400">This is a Remote position</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:col-span-1">
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
                <div className="md:col-span-2">
                    <InputLabel value="Description / Responsibilities" />
                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-2xl border-white/10 bg-[#0f172a] text-white px-4 py-3 min-h-[100px]" />
                    <InputError message={errors.description} className="mt-2" />
                </div>
            </div>
            <div className="flex justify-end pt-4"><PrimaryButton disabled={processing}>Save Experience</PrimaryButton></div>
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

function ProjectForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '', url: '', technologies: '', description: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('user-details.project.store'), { onSuccess });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel value="Project Title" />
                <TextInput value={data.title} onChange={e => setData('title', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.title} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Project URL" />
                <TextInput value={data.url} onChange={e => setData('url', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.url} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Technologies Used" />
                <TextInput value={data.technologies} onChange={e => setData('technologies', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" placeholder="e.g. React, Laravel, Docker" />
                <InputError message={errors.technologies} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Description" />
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-2xl border-white/10 bg-[#0f172a] text-white px-4 py-3 min-h-[100px]" />
                <InputError message={errors.description} className="mt-2" />
            </div>
            <div className="flex justify-end pt-4"><PrimaryButton disabled={processing}>Save Project</PrimaryButton></div>
        </form>
    );
}

function AwardForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '', issuer: '', date: '', description: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('user-details.award.store'), { onSuccess });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel value="Award Title" />
                <TextInput value={data.title} onChange={e => setData('title', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.title} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Issuer" />
                <TextInput value={data.issuer} onChange={e => setData('issuer', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.issuer} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Date" />
                <TextInput value={data.date} onChange={e => setData('date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" placeholder="e.g. June 2023" />
                <InputError message={errors.date} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Description" />
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-2xl border-white/10 bg-[#0f172a] text-white px-4 py-3 min-h-[100px]" />
                <InputError message={errors.description} className="mt-2" />
            </div>
            <div className="flex justify-end pt-4"><PrimaryButton disabled={processing}>Save Award</PrimaryButton></div>
        </form>
    );
}

function VolunteerForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        organization: '', role: '', start_date: '', end_date: '', currently_volunteering: false, description: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('user-details.volunteer-work.store'), { onSuccess });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <InputLabel value="Organization" />
                    <TextInput value={data.organization} onChange={e => setData('organization', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.organization} className="mt-2" />
                </div>
                <div className="md:col-span-2">
                    <InputLabel value="Role" />
                    <TextInput value={data.role} onChange={e => setData('role', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                    <InputError message={errors.role} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="Start Date" />
                    <TextInput value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" placeholder="e.g. Jan 2022" />
                    <InputError message={errors.start_date} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="End Date" />
                    <TextInput value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" placeholder="e.g. Present" />
                    <InputError message={errors.end_date} className="mt-2" />
                </div>
            </div>
            <div>
                <InputLabel value="Description" />
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-2xl border-white/10 bg-[#0f172a] text-white px-4 py-3 min-h-[100px]" />
                <InputError message={errors.description} className="mt-2" />
            </div>
            <div className="flex justify-end pt-4"><PrimaryButton disabled={processing}>Save Volunteering</PrimaryButton></div>
        </form>
    );
}

function PublicationForm({ onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '', publisher: '', date: '', url: '', description: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('user-details.publication.store'), { onSuccess });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel value="Title" />
                <TextInput value={data.title} onChange={e => setData('title', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.title} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Publisher / Conference" />
                <TextInput value={data.publisher} onChange={e => setData('publisher', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.publisher} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Date" />
                <TextInput value={data.date} onChange={e => setData('date', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" placeholder="e.g. 2023-05-20" />
                <InputError message={errors.date} className="mt-2" />
            </div>
            <div>
                <InputLabel value="URL" />
                <TextInput value={data.url} onChange={e => setData('url', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                <InputError message={errors.url} className="mt-2" />
            </div>
            <div>
                <InputLabel value="Description" />
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-2xl border-white/10 bg-[#0f172a] text-white px-4 py-3 min-h-[100px]" />
                <InputError message={errors.description} className="mt-2" />
            </div>
            <div className="flex justify-end pt-4"><PrimaryButton disabled={processing}>Save Publication</PrimaryButton></div>
        </form>
    );
}


