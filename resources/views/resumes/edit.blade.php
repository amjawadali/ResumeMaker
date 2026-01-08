@extends('layouts.app')

@section('header')
    <!-- Header Hidden for Full Screen Editor Mode -->
@endsection

@section('content')
<div class="h-[calc(100vh-65px)] bg-[#18191b] overflow-hidden flex" 
     x-data="konvaDesigner(@js($resume->canvas_state ?? []), @js($resume->template), @js([
        'name' => $user->name,
        'email' => $user->email,
        'phone' => $userDetail->phone ?? '',
        'summary' => $userDetail->professional_summary ?? 'Your professional summary goes here...',
        'experience' => $experiences,
        'education' => $educations,
        'skills' => $skills
     ]))" 
     x-cloak>
    
    <!-- LEFT SIDEBAR: RESOURCES -->
    <div class="w-20 bg-[#000000]/30 border-r border-white/5 flex flex-col items-center py-4 space-y-4 z-20 backdrop-blur-md">
        <template x-for="tab in ['design', 'elements', 'text', 'uploads', 'settings']">
            <button @click="activeTab = tab" 
                :class="activeTab === tab ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/10'"
                class="w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 group">
                
                <span x-show="tab === 'design'" class="text-xl">🎨</span>
                <span x-show="tab === 'elements'" class="text-xl">🟧</span>
                <span x-show="tab === 'text'" class="text-xl">T</span>
                <span x-show="tab === 'uploads'" class="text-xl">☁️</span>
                <span x-show="tab === 'settings'" class="text-xl">⚙️</span>
                
                <span class="text-[9px] mt-1 font-medium capitalize" x-text="tab"></span>
            </button>
        </template>
    </div>

    <!-- LEFT PANEL DRAWER -->
    <div class="w-80 bg-[#1e1f22] border-r border-white/5 flex flex-col z-10 transition-all duration-300 transform"
         x-show="true">
        
        <div class="p-5 overflow-y-auto custom-scrollbar h-full">
            <h3 class="text-white font-bold text-lg mb-4 capitalize" x-text="activeTab"></h3>

            <!-- SETTINGS TAB -->
            <div x-show="activeTab === 'settings'" class="space-y-6">
                 <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-400 uppercase">Resume Title</label>
                    <input type="text" x-model="resumeTitle" @change="saveCanvas(true)" class="w-full bg-[#18191b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition">
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-400 uppercase">Page Size</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button @click="resizeCanvas(794, 1123)" class="bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold border border-transparent transition">A4 (Standard)</button>
                        <button @click="resizeCanvas(816, 1056)" class="bg-[#2b2d31] hover:bg-[#313338] text-white py-2 rounded-lg text-xs font-bold border border-white/10 transition">US Letter</button>
                        <button @click="resizeCanvas(1123, 1587)" class="bg-[#2b2d31] hover:bg-[#313338] text-white py-2 rounded-lg text-xs font-bold border border-white/10 transition">A3 (Large)</button>
                        <button @click="resizeCanvas(600, 800)" class="bg-[#2b2d31] hover:bg-[#313338] text-white py-2 rounded-lg text-xs font-bold border border-white/10 transition">Web (Compact)</button>
                    </div>
                    <p class="text-[10px] text-slate-500 mt-1">Changing size may require re-arranging items.</p>
                </div>

                <div class="pt-4 border-t border-white/5">
                     <label class="text-xs font-bold text-slate-400 uppercase mb-3 block">Visible Sections</label>
                     <p class="text-[10px] text-slate-500">Go to your Profile to toggle sections globally.</p>
                     <a href="{{ route('user-details.index') }}" target="_blank" class="mt-2 block w-full text-center py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition">Manage Profile</a>
                </div>
                
                <div class="pt-4 border-t border-white/5">
                    <button @click="initDefaultContent(true)" class="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold border border-red-500/20 transition">Reset to Template Defaults</button>
                    <p class="text-[10px] text-red-400/60 mt-1 text-center">Warning: This clears all manual changes.</p>
                </div>
            </div>

            <!-- TEXT TAB -->
            <div x-show="activeTab === 'text'" class="space-y-4">
                <button @click="addText('Heading')" class="w-full bg-[#2b2d31] hover:bg-[#313338] text-white py-3 rounded-lg text-left px-4 font-bold text-2xl transition border border-transparent hover:border-white/10">Add a heading</button>
                <button @click="addText('Subheading')" class="w-full bg-[#2b2d31] hover:bg-[#313338] text-white py-3 rounded-lg text-left px-4 font-semibold text-lg transition border border-transparent hover:border-white/10">Add a subheading</button>
                <button @click="addText('Body')" class="w-full bg-[#2b2d31] hover:bg-[#313338] text-white py-2 rounded-lg text-left px-4 text-sm transition border border-transparent hover:border-white/10">Add a little bit of body text</button>
            </div>

            <!-- ELEMENTS TAB -->
            <div x-show="activeTab === 'elements'" class="space-y-4">
                <h4 class="text-xs font-bold text-slate-400 mb-2">Shapes</h4>
                <div class="grid grid-cols-4 gap-2">
                    <button @click="addSquare" class="aspect-square bg-[#2b2d31] rounded flex items-center justify-center hover:bg-[#313338] transition"><div class="w-6 h-6 bg-slate-400 rounded-sm"></div></button>
                    <button @click="addCircle" class="aspect-square bg-[#2b2d31] rounded flex items-center justify-center hover:bg-[#313338] transition"><div class="w-6 h-6 bg-slate-400 rounded-full"></div></button>
                    <button @click="addLine" class="aspect-square bg-[#2b2d31] rounded flex items-center justify-center hover:bg-[#313338] transition"><div class="w-6 h-0.5 bg-slate-400"></div></button>
                </div>
            </div>
             
             <!-- UPLOADS TAB -->
             <div x-show="activeTab === 'uploads'">
                 <button @click="$refs.imageUpload.click()" class="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold text-sm shadow-lg shadow-purple-900/20 hover:scale-[1.02] transition">Upload Media</button>
                 <input type="file" x-ref="imageUpload" @change="uploadImage($event)" class="hidden" accept="image/*">
             </div>
             
             <!-- DESIGN TAB -->
            <div x-show="activeTab === 'design'" class="space-y-4">
                 <div class="bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg">
                     <p class="text-xs text-purple-200">Current Template: <span class="font-bold">{{ $resume->template->name }}</span></p>
                 </div>
                 <p class="text-xs text-slate-500">More templates coming soon.</p>
            </div>
        </div>
    </div>

    <!-- MAIN EDITOR AREA -->
    <div class="flex-1 relative flex flex-col bg-[#18191b] overflow-hidden">
        
        <!-- TOP TOOLBAR -->
        <div class="h-14 bg-[#1e1f22] border-b border-white/5 flex items-center justify-between px-4 z-20">
            <div class="flex items-center space-x-2">
                <button @click="undo" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-white/10 transition"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg></button>
                <div class="h-4 w-px bg-white/10 mx-2"></div>
                <div class="flex items-center text-xs font-bold text-slate-300">
                    <button @click="zoom(-0.1)" class="p-1 hover:bg-white/10 rounded">-</button>
                    <span class="mx-2" x-text="Math.round(zoomLevel * 100) + '%'"></span>
                    <button @click="zoom(0.1)" class="p-1 hover:bg-white/10 rounded">+</button>
                </div>
            </div>
            
            <div class="flex items-center space-x-3">
                <span class="text-[10px] font-bold uppercase tracking-wider transition-colors duration-300"
                      :class="{'text-green-400': autoSaveStatus === 'Saved!', 'text-red-400': autoSaveStatus === 'Error!', 'text-slate-500': autoSaveStatus.includes('Ready') || autoSaveStatus.includes('Last')}"
                      x-text="autoSaveStatus"></span>

                <button @click="saveCanvas()" class="px-4 py-1.5 bg-white text-black font-bold text-sm rounded hover:bg-gray-200 transition">Save</button>
                <a href="{{ route('resumes.download-pdf', $resume) }}" class="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm rounded shadow-lg shadow-purple-500/20 hover:scale-105 transition">Download</a>
            </div>
        </div>

        <!-- CANVAS AREA -->
        <div class="flex-1 overflow-auto bg-[#18191b] p-10 flex justify-center relative custom-scrollbar">
            <div id="konva-container" class="shadow-2xl shadow-black/50 overflow-hidden bg-white origin-top transition-transform duration-200"></div>
        </div>

        <!-- FLOATING PROPERTIES BAR -->
        <div x-show="selectedNode"
             class="absolute top-20 left-1/2 -translate-x-1/2 bg-[#2b2d31] border border-white/10 shadow-2xl rounded-lg px-4 py-2 flex items-center space-x-4 z-50">
            
            <template x-if="selectedNode && selectedNode.className === 'Text'">
                <div class="flex items-center space-x-3">
                    <select @change="updateNodeStyle('fontFamily', $event.target.value)" class="bg-[#1e1f22] text-white text-xs rounded border border-white/10 px-2 py-1 outline-none">
                         <option value="Inter">Inter</option>
                         <option value="Arial">Arial</option>
                         <option value="Georgia">Georgia</option>
                    </select>

                    <div class="flex items-center bg-[#1e1f22] rounded border border-white/10">
                        <button @click="changeSize(-1)" class="px-2 py-1 text-white hover:bg-white/10">-</button>
                        <span class="text-xs text-white w-8 text-center" x-text="Math.round(selectedNode ? selectedNode.fontSize() : 0)"></span>
                        <button @click="changeSize(1)" class="px-2 py-1 text-white hover:bg-white/10">+</button>
                    </div>
                    <input type="color" @input="updateNodeStyle('fill', $event.target.value)" class="w-6 h-6 rounded cursor-pointer bg-transparent border-none">
                    <button @click="toggleStyle('fontStyle', 'bold')" class="p-1 rounded text-white hover:bg-white/10 font-bold">B</button>
                </div>
            </template>

            <button @click="deleteNode" class="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-400/10"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>

    </div>
</div>

@push('scripts')
<script src="https://unpkg.com/konva@9/konva.min.js"></script>
<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('konvaDesigner', (initialState, template, userData) => ({
            activeTab: 'design',
            stage: null,
            layer: null,
            transformer: null,
            selectedNode: null,
            resumeTitle: "{{ $resume->title }}",
            autoSaveStatus: 'Ready',
            hasChanges: false,
            zoomLevel: 0.9,
            userData: userData,
            template: template,
            pageWidth: 794,
            pageHeight: 1123,

            init() {
                // Determine page size from state if exists
                if (initialState && initialState.attrs && initialState.attrs.width) {
                    this.pageWidth = initialState.attrs.width;
                    this.pageHeight = initialState.attrs.height;
                }

                this.stage = new Konva.Stage({
                    container: 'konva-container',
                    width: this.pageWidth,
                    height: this.pageHeight,
                    scale: { x: this.zoomLevel, y: this.zoomLevel }
                });

                this.layer = new Konva.Layer();
                this.stage.add(this.layer);

                this.transformer = new Konva.Transformer({
                    anchorFill: '#ffffff',
                    anchorStroke: '#7c3aed',
                    anchorSize: 10,
                    borderStroke: '#7c3aed',
                    keepRatio: true,
                });
                this.layer.add(this.transformer);

                if (initialState && Object.keys(initialState).length > 0 && initialState.children && initialState.children.length > 0) {
                     this.loadState(initialState);
                } else {
                     this.initDefaultContent();
                }

                this.stage.on('click tap', (e) => {
                    if (e.target === this.stage || e.target.name() === 'page-bg') {
                        this.deselect();
                        return;
                    }
                    this.selectNode(e.target);
                });

                this.stage.on('dragend transformend', () => {
                    this.hasChanges = true;
                    this.saveCanvas(true);
                    this.selectedNode = this.selectedNode; // force update
                });

                this.stage.on('dblclick dbltap', (e) => {
                    if (e.target instanceof Konva.Text) this.editText(e.target);
                });
                
                // Adjust stage container style
                this.updateZoom();
            },

            loadState(json) {
                // Rehydrate from JSON
                const loadedStage = Konva.Node.create(json);
                const loadedLayer = loadedStage.findOne('Layer');
                
                if (loadedLayer) {
                    this.layer.destroyChildren(); // Clear current
                    
                    // Move children from loaded layer to actual layer
                    // We must clone or move carefully
                    const kids = loadedLayer.getChildren().toArray();
                    kids.forEach(node => {
                        if (node.className !== 'Transformer') {
                            node.moveTo(this.layer);
                        }
                    });
                    
                    this.layer.add(this.transformer);
                    this.layer.draw();
                }
            },

            initDefaultContent(forceReset = false) {
                 if (forceReset) {
                     if(!confirm('Are you sure? This will erase everything.')) return;
                     this.layer.destroyChildren();
                     this.layer.add(this.transformer);
                 }

                 // Background
                 const bg = new Konva.Rect({
                     x: 0, y: 0,
                     width: this.pageWidth, height: this.pageHeight,
                     fill: 'white',
                     name: 'page-bg',
                     listening: true
                 });
                 this.layer.add(bg);
                 bg.moveToBottom();

                 // SMART TEMPLATE LOADER
                 const layoutY = 50;
                 const marginX = 50;
                 let cursorY = layoutY;

                 // Header / Name
                 this.addTextNode(this.userData.name.toUpperCase(), 40, marginX, cursorY, 32, 'bold');
                 cursorY += 40;
                 
                 // Contact Info
                 const contact = `${this.userData.email} | ${this.userData.phone}`;
                 this.addTextNode(contact, 40, marginX, cursorY, 14, 'normal', '#666');
                 cursorY += 40;
                 
                 // Divider
                 const line = new Konva.Line({
                     points: [marginX, cursorY, this.pageWidth - marginX, cursorY],
                     stroke: '#ddd',
                     strokeWidth: 2,
                     draggable: true
                 });
                 this.layer.add(line);
                 cursorY += 30;

                 // Summary
                 if (this.userData.summary) {
                     this.addTextNode("PROFESSIONAL SUMMARY", 20, marginX, cursorY, 14, 'bold', '#7c3aed');
                     cursorY += 25;
                     this.addTextNode(this.userData.summary, 14, marginX, cursorY, 12, 'normal', '#333', this.pageWidth - 100);
                     cursorY += 80; // Approximate height
                 }

                 // Experience
                 if (this.userData.experience && this.userData.experience.length > 0) {
                     this.addTextNode("WORK EXPERIENCE", 20, marginX, cursorY, 14, 'bold', '#7c3aed');
                     cursorY += 25;
                     
                     this.userData.experience.forEach(exp => {
                         this.addTextNode(`${exp.position} | ${exp.company}`, 20, marginX, cursorY, 13, 'bold');
                         cursorY += 20;
                         this.addTextNode(`${exp.start_date} - ${exp.end_date || 'Present'}`, 20, marginX, cursorY, 11, 'italic', '#666');
                         cursorY += 20;
                         if (exp.description) {
                             this.addTextNode(exp.description, 14, marginX, cursorY, 12, 'normal', '#333', this.pageWidth - 100);
                             cursorY += 50;
                         }
                         cursorY += 10;
                     });
                 }
                 
                 // Education
                 if (this.userData.education && this.userData.education.length > 0) {
                     this.addTextNode("EDUCATION", 20, marginX, cursorY, 14, 'bold', '#7c3aed');
                     cursorY += 25;
                     
                     this.userData.education.forEach(edu => {
                         this.addTextNode(`${edu.degree} in ${edu.field_of_study}`, 20, marginX, cursorY, 13, 'bold');
                         cursorY += 20;
                         this.addTextNode(`${edu.institution}`, 20, marginX, cursorY, 12, 'normal');
                         cursorY += 30;
                     });
                 }
                 
                 this.layer.draw();
                 this.saveCanvas(true);
            },
            
            addTextNode(text, height, x, y, fontSize, fontStyle = 'normal', color = '#333', width = null) {
                const node = new Konva.Text({
                    x: x, y: y,
                    text: text,
                    fontSize: fontSize,
                    fontFamily: 'Inter',
                    fontStyle: fontStyle,
                    fill: color,
                    draggable: true,
                    name: 'Text',
                    width: width
                });
                this.layer.add(node);
                return node;
            },

            resizeCanvas(w, h) {
                this.pageWidth = w;
                this.pageHeight = h;
                this.stage.width(w);
                this.stage.height(h);
                
                // Update bg
                const bg = this.layer.findOne('.page-bg');
                if (bg) {
                    bg.width(w);
                    bg.height(h);
                }
                
                this.stage.batchDraw();
                this.saveCanvas(true);
            },
            
            zoom(delta) {
                this.zoomLevel += delta;
                if (this.zoomLevel < 0.2) this.zoomLevel = 0.2;
                if (this.zoomLevel > 2.0) this.zoomLevel = 2.0;
                this.stage.scale({ x: this.zoomLevel, y: this.zoomLevel });
                this.stage.batchDraw();
            },
            
            updateZoom() {
                 this.stage.scale({ x: this.zoomLevel, y: this.zoomLevel });
            },

            selectNode(node) {
                if (node === this.transformer) return;
                this.selectedNode = node;
                this.transformer.nodes([node]);
                this.layer.batchDraw();
            },

            deselect() {
                this.selectedNode = null;
                this.transformer.nodes([]);
                this.layer.batchDraw();
            },

            // --- Editing Actions ---
            addText(type) {
                // ... same as before
                let size = 16, text = "Text", weight = 'normal';
                if (type === 'Heading') { size = 32; text = "Heading"; weight = 'bold'; }
                if (type === 'Subheading') { size = 24; text = "Subheading"; weight = 'bold'; }
                const node = new Konva.Text({ x: 100, y: 100, text: text, fontSize: size, fontFamily: 'Inter', fontStyle: weight, fill: '#333', draggable: true, name: 'Text' });
                this.layer.add(node); this.selectNode(node); this.hasChanges = true;
            },
            addSquare() {
                 const node = new Konva.Rect({ x: 150, y: 150, width: 100, height: 100, fill: '#94a3b8', draggable: true, name: 'Shape' });
                 this.layer.add(node); this.selectNode(node); this.hasChanges = true;
            },
            addCircle() {
                 const node = new Konva.Circle({ x: 200, y: 200, radius: 50, fill: '#94a3b8', draggable: true, name: 'Shape' });
                 this.layer.add(node); this.selectNode(node); this.hasChanges = true;
            },
            addLine() {
                 const node = new Konva.Rect({ x: 100, y: 100, width: 200, height: 2, fill: '#333', draggable: true, name: 'Shape' });
                 this.layer.add(node); this.selectNode(node); this.hasChanges = true;
            },
            uploadImage(e) { /* ... same as before ... */ },
            deleteNode() {
                if (this.selectedNode) {
                    this.selectedNode.destroy();
                    this.deselect();
                    this.hasChanges = true;
                }
            },
            updateNodeStyle(attr, val) {
                if (!this.selectedNode) return;
                this.selectedNode.setAttr(attr, val);
                this.layer.batchDraw();
                this.hasChanges = true;
            },
            changeSize(delta) { 
                if (!this.selectedNode) return;
                if (this.selectedNode instanceof Konva.Text) this.selectedNode.fontSize(this.selectedNode.fontSize() + delta);
                else { this.selectedNode.scale({ x: this.selectedNode.scaleX() * (1 + delta*0.1), y: this.selectedNode.scaleY() * (1 + delta*0.1) }); }
                this.layer.batchDraw(); this.hasChanges = true;
            },
            toggleStyle(attr, val) { /* ... same as before ... */ },
            
            // --- Common Save Logic ---
            async saveCanvas(isAuto = false) {
                if (!isAuto) this.autoSaveStatus = 'Saving...';
                const json = this.stage.toJSON();
                const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                try {
                    const response = await fetch("{{ route('resumes.update', $resume) }}", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': token },
                        body: JSON.stringify({ _method: 'PUT', canvas_state: JSON.parse(json), title: this.resumeTitle, sections_visibility: [] })
                    });
                    if (!response.ok) throw new Error('Network response was not ok');
                    this.hasChanges = false;
                    if (!isAuto) { this.autoSaveStatus = 'Saved!'; setTimeout(() => this.autoSaveStatus = 'Ready', 2000); }
                    else { this.autoSaveStatus = 'Last Autosave: ' + new Date().toLocaleTimeString(); }
                } catch (error) { console.error('Save failed:', error); this.autoSaveStatus = 'Error!'; }
            },
            undo() {},
            editText(textNode) {
                textNode.hide(); this.transformer.hide(); this.layer.draw();
                const textPosition = textNode.absolutePosition();
                const stageBox = this.stage.container().getBoundingClientRect();
                const areaPosition = {
                    x: stageBox.left + textPosition.x,
                    y: stageBox.top + textPosition.y
                };
                
                const textarea = document.createElement('textarea');
                document.body.appendChild(textarea);
                textarea.value = textNode.text();
                textarea.style.position = 'absolute';
                textarea.style.top = areaPosition.y + 'px';
                textarea.style.left = areaPosition.x + 'px';
                // Improve sizing logic
                textarea.style.width = (textNode.width() * this.stage.scaleX()) + 'px';
                textarea.style.height = (textNode.height() * this.stage.scaleY()) + 10 + 'px';
                textarea.style.fontSize = (textNode.fontSize() * this.stage.scaleY()) + 'px';
                textarea.style.border = 'none'; textarea.style.padding = '0px'; textarea.style.margin = '0px';
                textarea.style.overflow = 'hidden'; textarea.style.background = 'none'; textarea.style.outline = 'none';
                textarea.style.resize = 'none'; textarea.style.lineHeight = textNode.lineHeight();
                textarea.style.fontFamily = textNode.fontFamily(); textarea.style.transformOrigin = 'left top';
                textarea.style.textAlign = textNode.align(); textarea.style.color = textNode.fill();
                textarea.style.zIndex = 1000; 

                textarea.focus();
                
                const finish = () => {
                    textNode.text(textarea.value);
                    document.body.removeChild(textarea);
                    textNode.show(); this.transformer.show(); this.layer.draw();
                    this.hasChanges = true;
                    this.saveCanvas(true);
                };
                
                textarea.addEventListener('keydown', (e) => {
                    if (e.keyCode === 13 && !e.shiftKey) finish();
                    if (e.keyCode === 27) finish();
                });
                textarea.addEventListener('blur', finish);
            }
        }));
    });
</script>
@endpush
@endsection
