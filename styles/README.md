# 🎨 Design System Documentation

This directory contains the unified styling system for the Baby Bottle Tracker app.

## Architecture Overview

The styling system uses a **2-file architecture** for optimal maintainability:

- **`theme.ts`** - Design tokens (colors, spacing, typography, etc.)
- **`styles.ts`** - All application styles (unified)

## Design Tokens (`theme.ts`)

### Colors

#### Primary Colors
```typescript
colors.primary.main    // #297289 - Main brand color
colors.primary.light   // #818CF8 - Light variant
colors.primary.dark    // #4F46E5 - Dark variant
```

#### Secondary Colors
```typescript
colors.secondary.main  // #10B981 - Success/positive actions
colors.secondary.light  // #34D399 - Light success
colors.secondary.dark   // #059669 - Dark success
```

#### Status Colors
```typescript
colors.status.success  // #10B981 - Success states
colors.status.warning  // #F59E0B - Warning states
colors.status.error    // #EF4444 - Error states
colors.status.info     // #3B82F6 - Info states
```

#### Neutral Colors
```typescript
colors.neutral[50]     // #F9FAFB - Lightest
colors.neutral[100]    // #F3F4F6
colors.neutral[200]    // #E5E7EB
colors.neutral[300]    // #D1D5DB
colors.neutral[400]    // #9CA3AF
colors.neutral[500]    // #6B7280 - Default
colors.neutral[600]    // #4B5563
colors.neutral[700]    // #374151
colors.neutral[800]    // #1F2937
colors.neutral[900]    // #111827 - Darkest
```

#### Background Colors
```typescript
colors.background.primary   // #FFFFFF - Main background
colors.background.secondary // #F9FAFB - Card backgrounds
colors.background.tertiary  // #F3F4F6 - Input backgrounds
```

#### Text Colors
```typescript
colors.text.primary    // #111827 - Main text
colors.text.secondary  // #4B5563 - Secondary text
colors.text.tertiary   // #6B7280 - Tertiary text
colors.text.muted      // #9CA3AF - Muted text
colors.text.inverse    // #FFFFFF - Text on dark backgrounds
```

### Spacing Scale

```typescript
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px
spacing.lg    // 24px
spacing.xl    // 32px
spacing.xxl   // 48px
```

### Typography

#### Font Sizes
```typescript
fontSize.xs   // 12px
fontSize.sm   // 14px
fontSize.md   // 16px
fontSize.lg   // 18px
fontSize.xl   // 20px
fontSize.xxl  // 24px
fontSize.xxxl // 28px
```

#### Font Weights
```typescript
fontWeight.normal   // '400'
fontWeight.medium   // '500'
fontWeight.semibold // '600'
fontWeight.bold     // '700'
```

### Layout Values

```typescript
layout.screenPadding  // 16px - Screen horizontal padding
layout.cardPadding    // 16px - Card internal padding
layout.buttonHeight   // 48px - Standard button height
layout.inputHeight    // 48px - Standard input height
```

### Border Radius

```typescript
borderRadius.xs   // 4px
borderRadius.sm   // 6px
borderRadius.md   // 8px
borderRadius.lg   // 12px
borderRadius.xl   // 16px
borderRadius.full // 999px - Fully rounded
```

### Shadows

```typescript
shadows.sm  // Small shadow
shadows.md  // Medium shadow
shadows.lg  // Large shadow
```

## Usage Examples

### Basic Usage
```typescript
import { colors, spacing, styles } from '@/styles/styles';

// Using design tokens directly
<View style={{ 
  backgroundColor: colors.primary.main, 
  padding: spacing.md,
  borderRadius: borderRadius.lg 
}}>

// Using predefined styles
<View style={styles.container}>
<Text style={styles.title}>Hello World</Text>
<TouchableOpacity style={styles.primaryButton}>
```

### Component-Specific Styles
```typescript
// For login screen
<TextInput style={styles.loginFormInput} />
<View style={styles.loginPasswordContainer} />

// For dashboard
<View style={styles.dashboardContainer} />
<Text style={styles.dashboardStatValue} />
```

### Utility Styles
```typescript
// Layout utilities
<View style={styles.flexRow}>
<View style={styles.center}>
<View style={styles.spaceBetween}>

// Spacing utilities
<View style={styles.pMd}>      // padding: 16px
<View style={styles.mxLg}>    // marginHorizontal: 24px
<View style={styles.mtSm}>    // marginTop: 8px

// Text utilities
<Text style={styles.textBold}>
<Text style={styles.textSecondary}>
<Text style={styles.textSm}>
```

## Best Practices

### 1. Use Design Tokens
Always use design tokens instead of hardcoded values:
```typescript
// ✅ Good
backgroundColor: colors.primary.main
padding: spacing.md

// ❌ Avoid
backgroundColor: '#297289'
padding: 16
```

### 2. Use Predefined Styles
Prefer predefined styles over inline styles:
```typescript
// ✅ Good
<View style={styles.container}>

// ❌ Avoid
<View style={{ flex: 1, backgroundColor: colors.background.primary }}>
```

### 3. Combine Styles Appropriately
Use array syntax for combining styles:
```typescript
// ✅ Good
style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}

// ❌ Avoid
style={{ ...styles.button, ...styles.primaryButton, opacity: loading ? 0.6 : 1 }}
```

### 4. Naming Conventions
- **Global styles**: `container`, `button`, `title`
- **Component styles**: `loginFormInput`, `dashboardHeader`
- **Utility styles**: `flexRow`, `center`, `textBold`

## Adding New Styles

### 1. Add Design Tokens (if needed)
In `theme.ts`, add new tokens:
```typescript
export const colors = {
  // ... existing colors
  newColor: '#FF6B6B'
}
```

### 2. Add Styles
In `styles.ts`, add new styles:
```typescript
const componentStylesDefinition = {
  // ... existing styles
  newComponentStyle: {
    backgroundColor: theme.colors.newColor,
    padding: theme.spacing.md,
  } as ViewStyle,
}
```

### 3. Export and Use
The styles are automatically exported and available:
```typescript
import { styles } from '@/styles/styles';
<View style={styles.newComponentStyle} />
```

## Migration Notes

This styling system was created by refactoring from the previous architecture:
- **Before**: `globalStyles.ts` + `modalStyles.ts` + inline styles
- **After**: `theme.ts` + `styles.ts` (unified)

All 18 components have been migrated to use this new system, ensuring consistency and maintainability across the entire application.
