# ClearCut — Studio Background Remover

A single-page dark liquid glass photo-editing workspace engineered for instant background isolation, precision before/after comparison, and seamless commercial asset preparation.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product design choices have been confirmed through user preference and will guide the build:

- **Confirmed Decision 1 (Comparison Mode)**: Interactive draggable split-slider with touch-enabled hairline divider, alongside instant view-toggle modes (Split View, Side-by-Side, and Before/After hold toggle).
- **Confirmed Decision 2 (Preloaded Sample Library)**: Three curated instant-test scenarios ready out of the box: Studio Product (e-commerce sneaker), Portrait Headshot (executive portrait), and Fashion Cutout (editorial model).
- **Confirmed Decision 3 (Backdrop Simulation)**: Default transparent alpha checkerboard accompanied by single-click studio test backdrops (clean e-commerce white `#FFFFFF`, studio dark slate `#0B0F17`, warm travertine cream `#F4EFEA`, and neutral photo studio gray `#E2E8F0`).
- **Confirmed Architecture**: Pure frontend decoupled state with an isolated image processing service contract, allowing instant plug-and-play connection to any future background-removal engine without altering UI components.

---

### 1. Overview & Core Concept

- **What It Does**: ClearCut provides an immediate, distraction-free photo editing workspace where users can drag and drop images or select preloaded sample assets, inspect transparent cutouts with pixel-level zoom and pan, compare results with a smooth split slider, test clean commercial backdrops, and download crisp PNG outputs.
- **Target Audience / Persona**: E-commerce sellers, graphic designers, photographers, and professional profile managers who need rapid, high-quality subject isolation without navigating complex multi-page software.
- **Key Value**: Delivers the tactile, responsive feel of desktop creative software directly in the browser through a focused single-page layout, sub-200ms micro-interactions, and zero extraneous clutter.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Initial / Empty State*: Central Liquid Glass dropzone with subtle depth, soft border reflections, accepted file specifications (PNG, JPG, WEBP up to 25MB), file picker trigger, and a quick-load showcase bar featuring 3 sample assets (Product, Portrait, Fashion).
  2. *Processing Transition*: Elegant shimmer pulse and segmented status indicator ("Analyzing edges", "Isolating subject") with non-blocking cancel affordance.
  3. *Active Comparison Workspace*: The dropzone transforms smoothly into a full-bleed photo editing canvas featuring:
     - Draggable Before/After comparison divider with smooth drag handle and dual-position label chips.
     - Canvas tool strip: Zoom (50%, 100%, 200%, Fit), Pan mode, Fullscreen inspection, and Reset orientation.
     - Backdrop Switcher: Transparency checkerboard (default), Solid Studio White, Dark Slate, Travertine Sand, and Light Gray.
     - Action Header & Footer: Image dimensions, file size badge, "Upload Another" quick-swap, and primary "Download PNG" action.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Dark Liquid Glass + Glassmorphism + subtle Neumorphism. Deep slate canvas with multi-layered specular borders (`rgba(255, 255, 255, 0.08)` to `0.15`), soft ambient glows, and dark titanium frosted glass panels (`backdrop-blur-xl bg-slate-900/70`).
  - *Color Palette & Mood*:
    - Canvas Base: Deep Abyss Slate (`#080C14` to `#0E1420`)
    - Surface Glass: Frosted Charcoal (`rgba(17, 24, 39, 0.75)`)
    - Hairline Specular: High-precision edge light (`rgba(255, 255, 255, 0.12)`)
    - Primary Accent: Precision Cyan/Cobalt (`#38BDF8` / `#2563EB`) strictly reserved for primary actions, active slider indicators, and focus states.
    - Neutral Text: High-contrast white (`#F8FAFC`) headlines, subdued slate (`#94A3B8`) for metadata and secondary labels.
  - *Typography & Hierarchy*:
    - Display Face: `Plus Jakarta Sans` / `Cabinet Grotesk` with tight optical tracking (`-0.02em`) for the wordmark and section anchors.
    - Body Face: Clean geometric sans with 1.5 line height for tooltips and controls.
    - Telemetry & Metrics: Monospace tabular numbers (`tabular-nums font-mono`) for zoom percentages, image dimensions, and byte sizes.
- **Interactive Feedback & Motion**:
  - Drag-over highlight with subtle scale and specular border glow.
  - Smooth spring transitions on slider repositioning.
  - Touch-friendly slider dragging with pointer event capture for mobile and tablet screens.
  - Keyboard shortcuts (`Space + Drag` to pan, `Cmd/Ctrl +` or `-` to zoom, `Escape` to reset zoom).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Draggable Split Slider as Primary Comparison View**
  - *Chosen Approach*: Draggable 50/50 split curtain with overlay handle, complemented by secondary tabs for Side-by-Side and Original view.
  - *Why*: The split slider is the gold standard in professional photo and VFX apps because it allows direct micro-level edge comparison at the exact same spatial pixel coordinates.
  - *Alternatives Considered*: Side-by-side view alone wastes 50% of screen real estate on mobile and makes direct edge comparison harder.
- **Decision 2: High-Fidelity Client-Side Realistic Cutout Demonstration**
  - *Chosen Approach*: Deliver realistic alpha-isolated sample pairs (original photo and precise transparent cutout) created with high quality, alongside a client-side canvas-based background isolation simulation for user-uploaded custom photos (using luminance/chroma edge detection on HTML5 Canvas to produce an actual transparent cutout on the fly without external servers).
  - *Why*: Allows users to upload their own custom pictures immediately and see real transparency rendering on the checkerboard grid without needing a backend server on Day 1.
  - *Alternatives Considered*: Showing a static canned placeholder for every user upload would feel broken and non-functional.
- **Decision 3: Zero AI Slop & Restrained Polish**
  - *Chosen Approach*: Clean dark glassomorphic physical dials, tight typography, zero rainbow gradients, zero floating sparkles or robot heads, and zero fake telemetry meters.
  - *Why*: Matches the professional aesthetic of tools like Lightroom, Figma, or Capture One rather than novelty AI toys.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│   Wordmark [ClearCut]       Navigation Links       Download / Actions  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Main Workspace Canvas                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  Dropzone Mode (Idle State)                                    │   │
│   │  - Drag & Drop Target with Specular Glass Surface              │   │
│   │  - File Picker Trigger (PNG, JPG, WEBP)                        │   │
│   │  - 3-Item Quick Sample Strip (Product, Portrait, Fashion)       │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │ Image Loaded                       │
│                                    ▼                                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  Comparison Workspace Mode (Active State)                      │   │
│   │  ┌──────────────────────────────────────────────────────────┐  │   │
│   │  │ Top Control Strip: Zoom, Pan, Fit, Reset, View Mode Tabs │  │   │
│   │  ├──────────────────────────────────────────────────────────┤  │   │
│   │  │ Interactive Split Canvas Viewport                        │  │   │
│   │  │  - Base Layer: Alpha Checkerboard / Solid Studio Color   │  │   │
│   │  │  - Left Region: Original Image Layer                     │  │   │
│   │  │  - Right Region: Isolated Subject Layer (Transparent)    │  │   │
│   │  │  - Draggable Center Divider Handle                       │  │   │
│   │  ├──────────────────────────────────────────────────────────┤  │   │
│   │  │ Bottom Bar: Backdrop Selector, Dimensions, New Upload   │  │   │
│   │  └──────────────────────────────────────────────────────────┘  │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Modular Processor Contract                       │
│   BackgroundProcessor Interface -> Mock / Canvas / Engine Adapter     │
│   (Ready for direct drop-in connection of production removal API)      │
└────────────────────────────────────────────────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - `WorkspaceState`: Holds current `originalUrl`, `processedUrl`, `fileInfo` (name, width, height, size), `sliderPosition` (0–100%), `zoomLevel` (0.5–3x), `panOffset` ({x, y}), `backdropMode` ('checkerboard' | 'white' | 'dark' | 'travertine' | 'lightGray'), and `viewMode` ('slider' | 'sideBySide' | 'cutoutOnly' | 'originalOnly').
  - `DragDropZone`: Handles native drag events (`dragover`, `dragleave`, `drop`) and file selection with format and size validation.
  - `ComparisonSlider`: Listens to PointerEvents with `setPointerCapture` for frictionless tracking across mobile touch, trackpad, and mouse.
  - `CanvasToolbar`: Manages zoom step adjustments, 100% 1:1 pixel inspection, and viewport framing.
  - `BackdropSelector`: Toggles live background layers beneath the cutout without touching the image itself.
  - `ExportEngine`: High-resolution canvas rendering to trigger immediate `.png` file download with transparent alpha preservation.
