# Music Player Components

This directory contains components related to the music player functionality in the Chad Empire application.

## Components

### MusicPlayer

The core component that handles audio playback, UI controls, and state management.

**Props:**
- `audioSrc` (string): Path to the audio file to be played
- `audioTitle` (string, optional): Title of the audio track (defaults to 'Chad Mix')
- `autoPlay` (boolean, optional): Whether to attempt autoplay when component mounts (defaults to false)

**State:**
- `isPlaying`: Tracks if audio is currently playing
- `volume`: Current volume level (0-1)
- `currentTime`: Current playback position in seconds
- `duration`: Total duration of the audio in seconds
- `isExpanded`: Whether the player UI is expanded or minimized

**Key Functions:**
- `togglePlay()`: Toggles play/pause state
- `handleVolumeChange()`: Updates volume based on user input
- `handleSeek()`: Updates playback position based on user input
- `formatTime()`: Formats seconds into MM:SS display format

**Notes:**
- Uses browser's native audio API via React refs
- Implements autoplay with muted fallback to comply with browser policies
- Stores user preferences in sessionStorage
- Starts minimized by default and expands on user interaction

### MusicPlayerContainer

A wrapper component that handles client-side rendering and provides the audio source.

**Props:** None

**State:**
- `isMounted`: Tracks if component has mounted on client-side
- `hasVisited`: Tracks if user has visited before in this session

**Notes:**
- Prevents hydration mismatch by only rendering on client-side
- Uses sessionStorage to remember user's visit status

### MusicPlayerWrapper

A dynamic import wrapper that ensures the music player only renders on the client side.

**Props:** None

**State:**
- `isMounted`: Tracks if component has mounted on client-side

**Notes:**
- Uses Next.js dynamic import with `ssr: false` to prevent server-side rendering
- Helps avoid hydration errors with audio elements

## Usage

```jsx
// In a page or layout component
import MusicPlayerWrapper from '@/components/music/MusicPlayerWrapper';

// Then in your JSX
<MusicPlayerWrapper />
```

## Implementation Details

The music player is implemented as a three-layer component structure:
1. `MusicPlayerWrapper` - Handles dynamic client-side loading
2. `MusicPlayerContainer` - Provides configuration and session management
3. `MusicPlayer` - Core player functionality and UI

This separation ensures proper client-side rendering while maintaining clean component responsibilities.
