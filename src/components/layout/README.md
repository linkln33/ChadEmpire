# Layout Components

This directory contains components that define the overall layout structure of the Chad Empire application.

## Components

### Navigation

A comprehensive navigation component that handles both desktop and mobile navigation.

**Props:**
- `transparent` (boolean, optional): Whether the navigation background should be transparent
- `activeSection` (string, optional): The currently active section for highlighting

**State:**
- `isMenuOpen`: Tracks if mobile menu is open
- `scrollPosition`: Current scroll position for styling changes
- `isScrolled`: Boolean indicating if page has been scrolled

**Key Functions:**
- `toggleMenu()`: Opens/closes the mobile menu
- `handleScroll()`: Updates scroll position state
- `handleNavClick()`: Handles navigation item clicks
- `renderNavItems()`: Renders navigation menu items

**Notes:**
- Responsive design for both mobile and desktop
- Changes appearance on scroll
- Supports highlighting of active section
- Includes wallet connection integration

### Header

The top section of the application layout.

**Props:**
- `title` (string, optional): Page title
- `subtitle` (string, optional): Page subtitle
- `showBreadcrumbs` (boolean, optional): Whether to display breadcrumbs

**State:**
- `isSticky`: Whether header is in sticky position

**Notes:**
- Contains branding elements
- May include page-specific information
- Coordinates with Navigation component

### Footer

The bottom section of the application layout.

**Props:**
- `showSocialLinks` (boolean, optional): Whether to display social media links
- `showTokenInfo` (boolean, optional): Whether to display token information

**State:**
- None significant

**Key Sections:**
- Social media links
- Token contract information
- Copyright and legal information
- Quick links to important pages

**Notes:**
- Contains important links and legal information
- Displays token contract address for reference
- Includes social media connections

## Usage

```jsx
// In a layout component
import { Navigation, Header, Footer } from '@/components/layout';

// Then in your JSX
const Layout = ({ children }) => {
  return (
    <>
      <Navigation />
      <Header title="Chad Empire" />
      <main>{children}</main>
      <Footer showSocialLinks={true} />
    </>
  );
};
```

## Implementation Details

The layout components provide the consistent structure across all pages of the application:
1. Navigation provides user movement between sections
2. Header establishes context for the current page
3. Footer provides supplementary links and information

These components work together to create a cohesive user experience while maintaining consistent branding and navigation patterns.
