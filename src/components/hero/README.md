# Hero Components

This directory contains components related to the hero section displayed on the home page of the Chad Empire application.

## Components

### HeroText

A component that displays the main headline and subheadline text in the hero section.

**Props:**
- `headline` (string, optional): Main headline text
- `subheadline` (string, optional): Secondary subheadline text
- `animated` (boolean, optional): Whether to animate the text entrance
- `className` (string, optional): Additional CSS classes

**State:**
- `isVisible`: Controls animation visibility state
- `hasAnimated`: Tracks if animation has completed

**Key Functions:**
- `animateIn()`: Handles entrance animation
- `renderHeadline()`: Renders the headline with styling
- `renderSubheadline()`: Renders the subheadline with styling

**Notes:**
- Uses animation for engaging entrance effects
- Supports responsive text sizing
- Implements Chad Empire branding styles
- Optimized for various screen sizes

### HeroImage

A component that displays the main hero image or animation.

**Props:**
- `src` (string): Image source path
- `alt` (string, optional): Alt text for accessibility
- `animated` (boolean, optional): Whether to animate the image entrance
- `priority` (boolean, optional): Whether to prioritize image loading

**State:**
- `isLoaded`: Tracks if the image has loaded
- `isVisible`: Controls animation visibility state

**Key Functions:**
- `handleLoad()`: Handles image load completion
- `animateIn()`: Handles entrance animation

**Notes:**
- Uses Next.js Image component for optimization
- Implements responsive sizing for different devices
- Includes loading state handling
- Supports animation effects

### TypewriterQuotes

A component that displays rotating quotes with a typewriter effect.

**Props:**
- `quotes` (array): Array of quotes to display
- `typingSpeed` (number, optional): Speed of typing effect in ms
- `pauseDuration` (number, optional): Duration to pause between quotes in ms
- `className` (string, optional): Additional CSS classes

**State:**
- `currentQuoteIndex`: Index of the currently displayed quote
- `displayedText`: Currently displayed text
- `isTyping`: Whether the typing effect is active
- `isDeleting`: Whether the deleting effect is active

**Key Functions:**
- `typeEffect()`: Handles the typing animation
- `deleteEffect()`: Handles the deleting animation
- `rotateQuote()`: Rotates to the next quote

**Notes:**
- Creates engaging typewriter text effect
- Automatically rotates through multiple quotes
- Customizable typing speed and pause duration
- Adds dynamic element to hero section

## Usage

```jsx
// In a home page component
import { HeroText, HeroImage, TypewriterQuotes } from '@/components/hero';

// Then in your JSX
const HomePage = () => {
  const quotes = [
    "Welcome to the Chad Empire",
    "Play. Earn. Dominate.",
    "Join the ultimate gaming experience"
  ];
  
  return (
    <div className="hero-section">
      <HeroText 
        headline="Chad Empire" 
        subheadline="The Future of Play-to-Earn Gaming"
        animated={true}
      />
      
      <HeroImage 
        src="/images/hero-chad.png"
        alt="Chad character"
        animated={true}
        priority={true}
      />
      
      <TypewriterQuotes 
        quotes={quotes}
        typingSpeed={50}
        pauseDuration={2000}
      />
    </div>
  );
};
```

## Implementation Details

The hero components create an impactful first impression for visitors to the Chad Empire platform:
1. Bold, engaging headline captures attention
2. Dynamic typewriter effect adds visual interest
3. High-quality imagery establishes brand identity
4. Responsive design ensures optimal display on all devices

These components work together to create a compelling introduction to the platform that communicates its value proposition and establishes the brand's personality.
