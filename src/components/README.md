# Chad Empire Components

This directory contains all the React components used throughout the Chad Empire application. Each subdirectory contains components related to a specific feature or functionality, along with documentation explaining their purpose and usage.

## Component Directory Structure

| Directory | Description | Documentation |
|-----------|-------------|---------------|
| `boosters` | Components for booster functionality and fragment collection | [Boosters Documentation](./boosters/README.md) |
| `charts` | Data visualization components for tokenomics and statistics | [Charts Documentation](./charts/README.md) |
| `fair-launch` | Components related to token fair launch and distribution | [Fair Launch Documentation](./fair-launch/README.md) |
| `game` | Core gameplay components including spin wheel mechanics | [Game Documentation](./game/README.md) |
| `hero` | Hero section components for the landing page | [Hero Documentation](./hero/README.md) |
| `layout` | Structural components like navigation, header, and footer | [Layout Documentation](./layout/README.md) |
| `music` | Music player components for background audio | [Music Documentation](./music/README.md) |
| `spinning` | Specialized components for the spinning wheel game mechanic | [Spinning Documentation](./spinning/README.md) |
| `staking` | Components for token staking functionality | [Staking Documentation](./staking/README.md) |
| `wallet` | Wallet connection and blockchain interaction components | [Wallet Documentation](./wallet/README.md) |

## Component Design Principles

The Chad Empire components follow these design principles:

1. **Modularity**: Components are designed to be reusable and self-contained
2. **Separation of Concerns**: UI components are separated from business logic
3. **Responsive Design**: All components adapt to different screen sizes
4. **Accessibility**: Components follow accessibility best practices
5. **Performance**: Components are optimized for performance and minimal re-renders

## Component Architecture

Components in the Chad Empire application follow a layered architecture:

1. **Page Components**: Top-level components that represent entire pages
2. **Feature Components**: Components that implement specific features
3. **UI Components**: Reusable UI elements used across features
4. **Provider Components**: Components that provide context to child components

## Usage Guidelines

When using or creating components:

1. **Props Documentation**: Document all props with their types and purpose
2. **State Management**: Keep state as local as possible, lifting up only when necessary
3. **Component Size**: Keep components focused on a single responsibility
4. **Naming Conventions**: Use PascalCase for component names and camelCase for props
5. **File Structure**: Each component should have its own file named after the component

## Large Components for Refactoring

The following components have been identified as candidates for refactoring due to their size and complexity:

1. **SpinWheel.tsx** (293 lines) - Could be split into smaller sub-components
2. **FairLaunchSection.tsx** (265 lines) - Contains complex UI and logic
3. **MusicPlayer.tsx** (259 lines) - Could separate UI from audio control logic
4. **Navigation.tsx** (218 lines) - Could be split into mobile/desktop components

## Pages for Refactoring

The following pages have been identified as candidates for refactoring:

1. **Home page (page.tsx)** (414 lines) - Should be split into section components
2. **API routes** (multiple 300+ line files) - Should extract business logic into services

## Future Improvements

Planned improvements for the component architecture:

1. **Component Testing**: Add unit tests for all components
2. **Storybook Integration**: Create a component library with Storybook
3. **Theme Consistency**: Ensure consistent styling across all components
4. **Performance Monitoring**: Add performance monitoring for critical components
