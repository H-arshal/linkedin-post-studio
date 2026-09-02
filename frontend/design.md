# UI Theme & Design System

This document outlines the design language, color palette, typography, and styling principles used to create the premium UI of this application. You can use these specifications to replicate the theme in your other applications.

## 1. Core Aesthetics
The design language is a blend of **Modern Brutalism** and **Premium Glassmorphism**.
*   **Sharp Edges**: We explicitly override standard border-radii (`var(--radius-sm)` through `var(--radius-2xl)`) to `0` to give the UI a sharp, structural, and professional feel.
*   **Glassmorphism Cards**: We use subtle linear gradients for card backgrounds (`linear-gradient(145deg, var(--color-surface), rgba(var(--color-surface-rgb), 0.5))`) combined with very light, semi-transparent primary colored borders.
*   **Micro-Animations**: Interactive elements scale, lift (`translateY(-2px)`), or slightly rotate on hover, combined with dynamic box-shadows.

## 2. Typography
We use modern, highly legible fonts to maintain a professional look.
*   **Base Font**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
*   **Monospace Font**: `'JetBrains Mono', 'Fira Code', 'Courier New', monospace` (Used for code and markdown input).

### Font Sizes
*   `--font-size-xs`: 0.75rem (12px)
*   `--font-size-sm`: 0.875rem (14px)
*   `--font-size-base`: 1rem (16px)
*   `--font-size-lg`: 1.125rem (18px)
*   `--font-size-xl`: 1.25rem (20px)
*   `--font-size-2xl`: 1.5rem (24px)
*   `--font-size-3xl`: 1.875rem (30px)

## 3. Color Palette

### Primary (Deep Purple/Indigo)
*   `--color-primary-500`: #8b5cf6
*   `--color-primary-600`: #7c3aed (Main Primary)
*   `--color-primary-700`: #6d28d9
*   `--color-primary-900`: #4c1d95

### Accent (Coral/Rose)
*   `--color-accent-400`: #fb7185
*   `--color-accent-500`: #f43f5e
*   `--color-accent-600`: #e11d48

### Neutral (Slate)
*   `--color-neutral-50`: #f8fafc (Light Background)
*   `--color-neutral-100`: #f1f5f9
*   `--color-neutral-800`: #1e293b
*   `--color-neutral-900`: #0f172a (Dark Background)

## 4. Light Theme Tokens (Default)
```css
--color-background: #f8fafc;
--color-surface: #ffffff;
--color-text: #0f172a;
--color-text-secondary: #64748b;
--color-primary: #7c3aed;
--color-primary-hover: #6d28d9;
--color-primary-light: rgba(124, 58, 237, 0.1);
--color-accent: #f43f5e;
--color-border: #e2e8f0;
--color-surface-rgb: 255, 255, 255;
--color-primary-rgb: 124, 58, 237;
```

## 5. Dark Theme Tokens
```css
--color-background: #0f172a;
--color-surface: #1e293b;
--color-text: #f1f5f9;
--color-text-secondary: #94a3b8;
--color-primary: #a78bfa;
--color-primary-hover: #c4b5fd;
--color-primary-light: rgba(167, 139, 250, 0.15);
--color-accent: #fb7185;
--color-border: #334155;
--color-surface-rgb: 30, 41, 59;
--color-primary-rgb: 167, 139, 250;
```

## 6. Layout & Spacing
Using a 4px grid system.
*   `--space-1`: 0.25rem (4px)
*   `--space-2`: 0.5rem (8px)
*   `--space-3`: 0.75rem (12px)
*   `--space-4`: 1rem (16px)
*   `--space-6`: 1.5rem (24px)
*   `--space-8`: 2rem (32px)
*   `--space-10`: 2.5rem (40px)

## 7. Shadows & Depth
We rely heavily on shadows rather than borders to distinguish elements.
*   `--shadow-sm`: `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`
*   `--shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
*   `--shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`

## 8. Reusable CSS Snippets

**Premium Glass Panel**
```css
.premium-panel {
    background: linear-gradient(145deg, var(--color-surface), rgba(var(--color-surface-rgb), 0.5));
    border: 1px solid rgba(var(--color-primary-rgb), 0.15);
    padding: var(--space-8);
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-base), box-shadow var(--transition-base);
}
.premium-panel:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: rgba(var(--color-primary-rgb), 0.3);
}
```

**Gradient Border (e.g. for Avatars/Tags)**
```css
.gradient-border-element {
    border: 3px solid transparent;
    background: linear-gradient(var(--color-background), var(--color-background)) padding-box,
                linear-gradient(135deg, var(--color-primary), var(--color-accent-500)) border-box;
}
```
