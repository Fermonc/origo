# Design System DNA

## 🎨 Palette (Colores)

### Brand Colors (Earthy & Premium)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#2C3E50` | Primary Brand Color (Deep Blue/Grey) |
| `--color-secondary` | `#E67E22` | Secondary/Accent (Accent Terra) |
| `--color-accent` | `#27AE60` | Success/Nature (Nature Green) |

### Neutral Colors
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-bg` | `#F9FAFB` | `#111827` | Page Background |
| `--color-surface` | `#FFFFFF` | `#1F2937` | Card/Modal Surface |
| `--color-text-main` | `#1F2937` | `#F9FAFB` | Primary Text |
| `--color-text-muted` | `#6B7280` | `#D1D5DB` | Secondary Text |
| `--color-border` | `#E5E7EB` | `#374151` | Borders/Dividers |

## 📐 Spacing & Layout

### Spacing Scale
- `--space-xs`: `0.5rem` (8px)
- `--space-sm`: `1rem` (16px)
- `--space-md`: `2rem` (32px)
- `--space-lg`: `4rem` (64px)
- `--space-xl`: `8rem` (128px)

### Layout
- `container`: Max-width `1200px` (Centered)
- `padding`: `0 var(--space-sm)`

## ✍️ Typography

### Font Families
- **Sans**: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- **Serif**: `Georgia, serif`

### Text Styles
- **Hero Title**: `4rem` (Mobile) / `6rem` (Desktop), Weight `800`
- **Headings**: Weight `800` (Logo), `600` (Buttons)
- **Body**: Standard sans-serif

## 🧩 Core Components

### 1. Navigation (Header)
- **Desktop**: Transparent to Glassmorphism on scroll (`rgba(255, 255, 255, 0.98)`).
- **Mobile (BottomNav)**: Floating Glassmorphism capsule (`blur(20px)`), Shadow `0 15px 35px rgba(0,0,0,0.1)`. Icons `28x28px`.

### 2. Buttons
- **Base Style**: Radius `8px`, Padding `0.75rem 1.5rem`, Weight `600`.
- **Primary**: Background `--color-primary`, Text `white`.
- **Ghost/Outline**: Border `2px solid`, used for "See More".

### 3. Cards (Category/Property)
- **Radius**: `16px`
- **Interaction**: Hover scale `1.02`
- **Overlay**: Text shadow for readability on images.

## 📱 Mobile Considerations
- **Touch Targets**: Min 44px (implied by `padding` and `gap`).
- **Safe Area**: `padding-bottom: 70px` on body to account for fixed BottomNav.
