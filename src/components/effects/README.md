# Effects Components

This directory contains visual effect components used throughout the Chad Empire application.

## Components

### AnimatedBackground

A customizable animated background component that creates particle effects using the tsParticles library.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'space' \| 'clouds' \| 'nebula' | 'space' | The style of animation to display |

#### Usage

```tsx
import AnimatedBackground from '@/components/effects/AnimatedBackground';

// In your component:
<div className="relative">
  <AnimatedBackground variant="nebula" />
  <div className="relative z-10">Your content here</div>
</div>
```

#### Variants

1. **space** - A space-like particle effect with small dots and connecting lines in Chad Empire's brand colors
2. **clouds** - Larger, cloud-like particles that slowly drift across the screen
3. **nebula** - A more complex, nebula-like effect with multiple particle types and interactive elements

#### Implementation Details

- Uses react-tsParticles for rendering particle animations
- Dynamically imported with Next.js to prevent SSR issues
- Customized with Chad Empire's brand colors (pink and teal)
- Optimized for performance with reasonable particle counts and FPS limits
- Interactive elements respond to user hover and clicks

#### Future Improvements

- Add more variant options
- Implement performance optimizations for mobile devices
- Add configuration options for particle density and speed
- Consider adding themed variants for different sections of the site
