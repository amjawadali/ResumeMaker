import React from 'react';
import EditableField from './Elements/EditableField';

export default function Modern({ data, mode = 'preview', canvasState, selectedId, onUpdate, onSelect }) {
    const { user, userDetail, educations, experiences, skills, certifications, languages, resume } = data;
    const isEditMode = mode === 'edit';

    // Helper to get content with override
    const getContent = (field, defaultValue) => {
        if (canvasState && canvasState[field] !== undefined) return canvasState[field];
        return defaultValue;
    };

    // Helper to get styles
    const getStyles = (field) => {
        return canvasState?.styles?.[field] || {};
    };

    const handleDelete = (id) => {
        if (window.parent) {
            window.parent.postMessage({ type: 'DELETE_ELEMENT', field: id, designId: id }, '*');
        }
    };

    const renderField = (id, tag, defaultContent, className, styleOverride = {}) => (
        <EditableField
            key={id}
            id={id}
            tag={tag}
            content={getContent(id, defaultContent)}
            className={className}
            style={{ ...getStyles(id), ...styleOverride }}
            isEditMode={isEditMode}
            isSelected={selectedId === id}
            onUpdate={onUpdate}
            onSelect={onSelect}
            onDelete={handleDelete}
        />
    );

    // Helper for visibility with fallback
    const isVisible = (section) => {
        return resume.sections_visibility?.[section] ?? true;
    };

    return (
        <div className="resume-wrapper relative bg-white font-sans text-slate-900 min-h-[1123px] w-[794px] mx-auto shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-[35%] bg-slate-900 text-white p-10 flex flex-col" style={getStyles('sidebar_area')}>
                <div className="text-center mb-12">
                    {isVisible('personal_info') && userDetail?.profile_photo && (
                        <div className="mb-6 mx-auto relative group">
                            <img
                                src={getStyles('profile_photo').src || userDetail.profile_photo_url || '/storage/' + userDetail.profile_photo}
                                alt="Profile"
                                className={`relative rounded-2xl mx-auto border-2 border-indigo-500/30 object-cover shadow-2xl w-36 h-36 ${isEditMode && selectedId === 'profile_photo' ? 'ring-2 ring-purple-500' : ''}`}
                                style={getStyles('profile_photo')}
                                onClick={(e) => {
                                    if (isEditMode) {
                                        e.stopPropagation();
                                        onSelect('profile_photo', 'image', getStyles('profile_photo'));
                                    }
                                }}
                            />
                        </div>
                    )}

                    {renderField('name_text', 'h1', userDetail?.full_name || user.name, 'text-3xl font-black uppercase tracking-tight text-white mb-2 leading-tight')}

                    <div className="h-1 w-12 bg-indigo-500 mx-auto rounded-full mb-4" style={getStyles('name_divider')}></div>

                    {renderField('position_text', 'p', experiences?.[0]?.position || 'Professional Title', 'text-slate-400 uppercase text-[10px] font-black tracking-[0.3em]')}
                </div>

                <div className="space-y-10 flex-grow">
                    {isVisible('personal_info') && (
                        <section>
                            {renderField('label_contact', 'h2', 'Contact', 'text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mb-6 flex items-center')}
                            <ul className="space-y-5 text-sm">
                                {userDetail?.phone && (
                                    <li className="flex items-start group">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 text-indigo-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                        </div>
                                        {renderField('phone_text', 'span', userDetail.phone, 'text-slate-300 font-medium pt-1')}
                                    </li>
                                )}
                                {userDetail?.email && (
                                    <li className="flex items-start group">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 text-indigo-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        {renderField('email_text', 'span', userDetail.email, 'text-slate-300 font-medium pt-1 break-all')}
                                    </li>
                                )}
                                {userDetail?.address && (
                                    <li className="flex items-start group">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 text-indigo-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        </div>
                                        {renderField('address_text', 'span', userDetail.address, 'text-slate-300 font-medium pt-1')}
                                    </li>
                                )}
                            </ul>
                        </section>
                    )}

                    {isVisible('skills') && skills?.length > 0 && (
                        <section>
                            {renderField('label_skills', 'h2', 'Skills & Expertise', 'text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mb-6 flex items-center')}
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(skill => (
                                        renderField(`skill_item_${skill.id}`, 'span', skill.name, 'bg-white/5 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/5 inline-block')
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow p-12 bg-white flex flex-col" style={getStyles('main_content_area')}>
                {isVisible('summary') && userDetail?.professional_summary && (
                    <section className="mb-12">
                        <div className="flex items-center mb-6">
                            <div className="w-1 h-8 bg-indigo-500 rounded-full mr-4" style={getStyles('summary_line')}></div>
                            {renderField('label_summary', 'h2', 'Professional Profile', 'text-2xl font-black text-slate-900 uppercase tracking-tight')}
                        </div>
                        {renderField('summary_text', 'div', userDetail.professional_summary, 'text-slate-600 leading-relaxed text-base font-medium')}
                    </section>
                )}

                {isVisible('experience') && experiences?.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center mb-8">
                            <div className="w-1 h-8 bg-indigo-500 rounded-full mr-4" style={getStyles('experience_line')}></div>
                            {renderField('label_experience', 'h2', 'Work Experience', 'text-2xl font-black text-slate-900 uppercase tracking-tight')}
                        </div>
                        <div className="space-y-10">
                            {experiences.map(exp => (
                                <div key={exp.id} className="relative group">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                                        <div>
                                            {renderField(`exp_pos_${exp.id}`, 'h3', exp.position, 'text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors')}
                                            <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mt-1 flex items-center">
                                                {renderField(`exp_comp_${exp.id}`, 'span', exp.company)}
                                                <span className="text-slate-400 mx-2">|</span>
                                                {renderField(`exp_loc_${exp.id}`, 'span', exp.location)}
                                            </p>
                                        </div>
                                        {renderField(`exp_date_${exp.id}`, 'div', `${exp.start_date} — ${exp.currently_working ? 'PRESENT' : exp.end_date}`, 'mt-2 md:mt-0 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap')}
                                    </div>
                                    {renderField(`exp_resp_${exp.id}`, 'div', exp.responsibilities, 'text-sm text-slate-600 leading-relaxed font-medium mt-4 space-y-2 whitespace-pre-wrap')}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Dynamic Canvas Elements */}
                {canvasState && Object.keys(canvasState).map(id => {
                    // Filter out non-dynamic fields or styles
                    if (id === 'styles' || !id.startsWith('text_') && !id.startsWith('shape_') && !id.startsWith('img_')) return null;

                    const content = canvasState[id]; // For text
                    const style = getStyles(id);
                    const type = id.split('_')[0];
                    let tag = 'div';
                    if (style.tag) tag = style.tag; // Use tag from config if saved

                    // Images/Shapes handling slightly different
                    if (type === 'img') {
                        return (
                            <div
                                key={id}
                                style={{ position: 'absolute', ...style }}
                                className={`group ${isEditMode && selectedId === id ? 'ring-2 ring-purple-500' : ''}`}
                                onClick={(e) => {
                                    if (isEditMode) {
                                        e.stopPropagation();
                                        onSelect(id, 'image', style);
                                    }
                                }}
                            >
                                <img src={style.src} className={style.className} />
                                {/* Simplified selection for image for now, ideally wrap with EditableField too but EditableField expects text content */}
                            </div>
                        );
                    }

                    return renderField(id, tag, content, style.className || '', { position: 'absolute', ...style });
                })}
            </div>
        </div>
    );
}
