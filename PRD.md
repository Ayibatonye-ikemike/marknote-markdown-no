# Planning Guide

A simple, elegant note-taking application that allows users to create, edit, and organize markdown-formatted notes with powerful search capabilities.

**Experience Qualities**: 
1. **Focused** - Distraction-free writing environment that keeps users in flow state
2. **Intuitive** - Natural interactions that feel familiar to anyone who's used a text editor
3. **Responsive** - Fast search and smooth transitions that never interrupt the writing experience

**Complexity Level**: Light Application (multiple features with basic state)
This app handles multiple notes with search, markdown rendering, and persistent storage, but doesn't require complex user accounts or advanced state management.

## Essential Features

**Note Creation**
- Functionality: Create new blank notes with automatic titling
- Purpose: Allows users to quickly capture thoughts without friction
- Trigger: Click "New Note" button or keyboard shortcut
- Progression: Click new note → Auto-focus title field → Begin typing → Auto-save
- Success criteria: Note appears in sidebar list and is immediately editable

**Markdown Editing**
- Functionality: Live markdown editing with syntax highlighting and preview
- Purpose: Enables rich text formatting while maintaining plain text simplicity
- Trigger: Type in note editor area
- Progression: Type markdown → See live preview → Continue editing seamlessly
- Success criteria: Markdown renders correctly and updates in real-time

**Search Functionality**
- Functionality: Real-time search across all note titles and content
- Purpose: Quickly find specific notes or content within large collections
- Trigger: Type in search box
- Progression: Focus search → Type query → See filtered results → Click to open note
- Success criteria: Search results update instantly and highlight matching content

**Note Management**
- Functionality: Delete, rename, and organize notes
- Purpose: Maintain a clean, organized note collection
- Trigger: Right-click note or use action buttons
- Progression: Select note → Choose action → Confirm if needed → Update immediately
- Success criteria: Changes persist and interface updates smoothly

## Edge Case Handling

- **Empty Search Results**: Show helpful "No notes found" message with suggestion to create new note
- **Very Long Notes**: Implement virtual scrolling or pagination for performance
- **Rapid Typing**: Debounce auto-save to prevent excessive storage calls
- **Special Characters**: Handle markdown special characters and escape sequences properly
- **Deleted Notes**: Provide undo functionality for accidental deletions

## Design Direction

The design should feel like a premium writing tool - clean, focused, and sophisticated, similar to Bear or Notion but more minimal, with plenty of breathing room that encourages deep focus and creativity.

## Color Selection

Analogous (adjacent colors on color wheel) - Using warm grays and subtle blues to create a calming, focused writing environment that reduces eye strain during long writing sessions.

- **Primary Color**: Deep charcoal `oklch(0.25 0.02 240)` - Communicates sophistication and focus
- **Secondary Colors**: Warm gray `oklch(0.85 0.01 240)` for backgrounds and light blue `oklch(0.9 0.02 240)` for subtle accents
- **Accent Color**: Soft blue `oklch(0.65 0.15 240)` for interactive elements and highlights
- **Foreground/Background Pairings**: 
  - Background (Warm white `oklch(0.98 0.005 240)`): Charcoal text `oklch(0.25 0.02 240)` - Ratio 12.8:1 ✓
  - Card (Light gray `oklch(0.96 0.01 240)`): Charcoal text `oklch(0.25 0.02 240)` - Ratio 11.2:1 ✓
  - Primary (Deep charcoal `oklch(0.25 0.02 240)`): White text `oklch(0.98 0.005 240)` - Ratio 12.8:1 ✓
  - Accent (Soft blue `oklch(0.65 0.15 240)`): White text `oklch(0.98 0.005 240)` - Ratio 4.9:1 ✓

## Font Selection

Typography should feel literary and comfortable for extended reading and writing - using Inter for its excellent readability and modern feel.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/24px/tight letter spacing
  - H2 (Note Titles): Inter Medium/18px/normal spacing  
  - Body (Note Content): Inter Regular/16px/relaxed line height (1.6)
  - UI Text: Inter Medium/14px/normal spacing
  - Search: Inter Regular/14px/normal spacing

## Animations

Subtle and purposeful animations that enhance the writing experience without distraction - smooth transitions that feel natural and guide attention appropriately.

- **Purposeful Meaning**: Gentle fades and slides communicate state changes while maintaining focus on content
- **Hierarchy of Movement**: Note selection and search filtering deserve the most animation attention, while typing and editing should be instantaneous

## Component Selection

- **Components**: 
  - Sidebar with ScrollArea for note list
  - ResizablePanel for adjustable layout
  - Input for search with subtle focus states
  - Card components for note previews
  - Button for primary actions with gentle hover states
  - Dialog for delete confirmations
  
- **Customizations**: 
  - Custom markdown editor component with syntax highlighting
  - Custom note preview component with proper typography
  - Custom search highlighting component
  
- **States**: 
  - Buttons: Subtle background changes on hover, gentle press animations
  - Inputs: Soft focus rings, smooth border color transitions
  - Notes: Subtle elevation changes on hover, smooth selection states
  
- **Icon Selection**: 
  - Plus for new notes
  - MagnifyingGlass for search
  - Trash for delete
  - Pencil for edit mode
  
- **Spacing**: 
  - Container padding: p-6
  - Component gaps: gap-4
  - Internal spacing: p-3 for cards, p-2 for buttons
  
- **Mobile**: 
  - Stack sidebar above content on mobile
  - Hide sidebar when editing on small screens
  - Larger touch targets (min 44px)
  - Swipe gestures for note navigation