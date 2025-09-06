# Music App PWA - Code Structure & Style Rules

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [File Organization](#file-organization)
3. [Component Structure](#component-structure)
4. [TypeScript Guidelines](#typescript-guidelines)
5. [React/Next.js Best Practices](#reactnextjs-best-practices)
6. [State Management](#state-management)
7. [Styling Guidelines](#styling-guidelines)
8. [Error Handling](#error-handling)
9. [Performance Rules](#performance-rules)
10. [Testing Standards](#testing-standards)
11. [Documentation Requirements](#documentation-requirements)
12. [Code Review Checklist](#code-review-checklist)

## Project Architecture

### 1.1 Monorepo Structure

```
music-app/
├── .github/workflows/          # GitHub Actions workflows
├── public/                     # Static assets
│   ├── audio/                 # Audio files and metadata
│   ├── icons/                 # PWA icons
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── src/
│   ├── app/                   # Next.js App Router
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and services
│   ├── stores/                # Zustand state stores
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper functions
├── scripts/                   # Node.js utility scripts
└── tests/                     # Test files
```

### 1.2 Layer Separation

- **Presentation Layer**: React components and UI logic
- **Business Logic Layer**: Custom hooks and services
- **Data Layer**: State management and API calls
- **Utility Layer**: Helper functions and constants

## File Organization

### 2.1 Naming Conventions

- **Files**: Use kebab-case for files and directories

  - `audio-player.tsx`
  - `playlist-manager.tsx`
  - `use-audio-player.ts`

- **Components**: Use PascalCase for component files

  - `AudioPlayer.tsx`
  - `PlaylistManager.tsx`

- **Hooks**: Prefix with `use-` in kebab-case

  - `use-audio-player.ts`
  - `use-playlist.ts`

- **Utilities**: Use kebab-case with descriptive names
  - `audio-utils.ts`
  - `db-manager.ts`

### 2.2 Directory Structure Rules

- Group related files in feature-based directories
- Keep components under 200 lines
- Split large components into smaller, focused components
- Use index files for clean imports

### 2.3 Import Organization

```typescript
// 1. React and Next.js imports
import React from "react";
import { NextPage } from "next";

// 2. Third-party libraries
import { motion } from "framer-motion";
import { useStore } from "zustand";

// 3. Internal imports (absolute paths)
import { AudioPlayer } from "@/components/AudioPlayer";
import { useAudioPlayer } from "@/hooks/use-audio-player";

// 4. Relative imports
import "./AudioPlayer.css";
```

## Component Structure

### 3.1 Component Template

```typescript
import React from "react";

interface ComponentProps {
  className?: string;
  // Other props interface
}

export const Component: React.FC<ComponentProps> = ({
  className = "",
  // Other destructured props
}) => {
  // 1. Hooks
  // 2. State
  // 3. Event handlers
  // 4. Effects
  // 5. Render helpers
  // 6. JSX return

  return (
    <div className={`base-classes ${className}`.trim()}>
      {/* Component content */}
    </div>
  );
};
```

### 3.2 Component Rules

- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Always define TypeScript interfaces for props
- **Default Props**: Use default parameters instead of defaultProps
- **Memoization**: Use React.memo for expensive components
- **Forward Refs**: Use forwardRef for components that need ref access

### 3.3 Component Composition

- Prefer composition over inheritance
- Use render props or children patterns for flexibility
- Create compound components for related functionality
- Extract custom hooks for shared logic

## TypeScript Guidelines

### 4.1 Type Definitions

```typescript
// Use interfaces for object shapes
interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  metadata: TrackMetadata;
}

// Use types for unions and computed types
type AudioFormat = "mp3" | "m4a" | "wav";
type PlaybackState = "playing" | "paused" | "stopped";

// Use enums for constants
enum PlaybackMode {
  NORMAL = "normal",
  REPEAT_ONE = "repeat-one",
  REPEAT_ALL = "repeat-all",
  SHUFFLE = "shuffle",
}
```

### 4.2 Type Safety Rules

- **Strict Mode**: Enable strict TypeScript configuration
- **No Any**: Avoid `any` type, use `unknown` if necessary
- **Generic Types**: Use generics for reusable components
- **Type Guards**: Implement type guards for runtime type checking
- **Utility Types**: Use built-in utility types (Partial, Pick, Omit)

### 4.3 API Types

```typescript
// API response types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Error types
interface ApiError {
  message: string;
  code: string;
  status: number;
}
```

## React/Next.js Best Practices

### 5.1 Hooks Rules

- **Custom Hooks**: Extract reusable logic into custom hooks
- **Hook Dependencies**: Always include all dependencies in useEffect
- **Hook Order**: Keep hooks at the top of components
- **Conditional Hooks**: Never use hooks conditionally

### 5.2 Next.js App Router

```typescript
// Page components
export default function Page() {
  return <div>Page content</div>;
}

// Layout components
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// Server components (when possible)
export default async function ServerPage() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### 5.3 Performance Optimization

- Use `React.lazy` for code splitting
- Implement `Suspense` boundaries
- Use `useMemo` and `useCallback` judiciously
- Optimize images with Next.js Image component

## State Management

### 6.1 Zustand Store Structure

```typescript
interface AudioStore {
  // State
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  volume: number;

  // Actions
  setCurrentTrack: (track: AudioTrack) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;

  // Computed values
  isCurrentTrack: (trackId: string) => boolean;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Implementation
}));
```

### 6.2 State Management Rules

- **Single Source of Truth**: Keep state in appropriate stores
- **Immutable Updates**: Always return new state objects
- **Action Naming**: Use descriptive action names
- **State Normalization**: Normalize nested data structures
- **Selective Subscriptions**: Subscribe only to needed state slices

## Styling Guidelines

### 7.1 Tailwind CSS Rules

```typescript
// Use template literals for conditional classes
const getClassName = (
  baseClasses: string,
  conditionalClasses: Record<string, boolean>,
  additionalClasses?: string
) => {
  const conditional = Object.entries(conditionalClasses)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(" ");

  return `${baseClasses} ${conditional} ${additionalClasses || ""}`.trim();
};

// Usage example
const className = getClassName(
  "base-classes",
  {
    "conditional-class": condition,
    "another-class": anotherCondition,
  },
  additionalClasses
);

// Alternative: Direct template literal approach
const className = `base-classes ${condition ? "conditional-class" : ""} ${
  anotherCondition ? "another-class" : ""
} ${additionalClasses || ""}`.trim();

// Component-specific styles
const audioPlayerClasses = {
  container: "flex flex-col space-y-4 p-4",
  controls: "flex items-center space-x-2",
  progress: "w-full h-2 bg-gray-200 rounded-full",
} as const;
```

### 7.2 CSS Organization

- Use Tailwind utility classes first
- Create custom CSS only when necessary
- Use CSS modules for component-specific styles
- Follow mobile-first responsive design
- Avoid utility libraries like `cn` or `clsx` - use native template literals
- Use helper functions for complex conditional styling

### 7.3 Design System

- Use consistent spacing scale (4, 8, 12, 16, 24, 32)
- Implement consistent color palette
- Use semantic color names
- Follow accessibility guidelines (WCAG 2.1)

## Error Handling

### 8.1 Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  // Implementation
}
```

### 8.2 Error Handling Rules

- **Error Boundaries**: Implement error boundaries for component trees
- **Try-Catch**: Use try-catch for async operations
- **Error Types**: Define specific error types
- **User Feedback**: Provide meaningful error messages
- **Logging**: Log errors for debugging

### 8.3 API Error Handling

```typescript
const handleApiCall = async () => {
  try {
    const response = await apiCall();
    return { data: response, error: null };
  } catch (error) {
    console.error("API call failed:", error);
    return { data: null, error: error as ApiError };
  }
};
```

## Performance Rules

### 9.1 Bundle Optimization

- Use dynamic imports for large components
- Implement code splitting at route level
- Optimize images and assets
- Use webpack bundle analyzer

### 9.2 Runtime Performance

- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Optimize audio loading and caching

### 9.3 PWA Performance

- Implement proper caching strategies
- Use service worker for offline functionality
- Optimize for mobile performance
- Monitor Core Web Vitals

## Testing Standards

### 10.1 Testing Structure

```
tests/
├── __mocks__/                 # Mock files
├── components/                # Component tests
├── hooks/                     # Hook tests
├── utils/                     # Utility tests
└── e2e/                       # End-to-end tests
```

### 10.2 Testing Rules

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test critical user flows
- **Mock External Dependencies**: Mock API calls and external services
- **Test Coverage**: Maintain >80% code coverage

### 10.3 Test Naming

```typescript
describe("AudioPlayer", () => {
  describe("when playing audio", () => {
    it("should update play button state", () => {
      // Test implementation
    });
  });
});
```

## Documentation Requirements

### 11.1 Code Documentation

````typescript
/**
 * Custom hook for managing audio playback state and controls
 *
 * @param initialTrack - The initial track to load
 * @returns Audio player state and control functions
 *
 * @example
 * ```tsx
 * const { currentTrack, isPlaying, play, pause } = useAudioPlayer(track);
 * ```
 */
export const useAudioPlayer = (initialTrack?: AudioTrack) => {
  // Implementation
};
````

### 11.2 README Requirements

- Project overview and setup instructions
- API documentation
- Component usage examples
- Development workflow
- Deployment instructions

### 11.3 Code Comments

- Explain complex business logic
- Document non-obvious code decisions
- Include TODO comments for future improvements
- Remove commented-out code before committing

## Code Review Checklist

### 12.1 Pre-commit Checklist

- [ ] Code follows TypeScript strict mode
- [ ] All components have proper prop types
- [ ] Error handling is implemented
- [ ] Performance optimizations are applied
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Accessibility guidelines are followed

### 12.2 Code Quality Metrics

- **Cyclomatic Complexity**: Keep functions under 10
- **Function Length**: Keep functions under 50 lines
- **Component Length**: Keep components under 200 lines
- **File Length**: Keep files under 300 lines
- **Import Count**: Limit imports to 10 per file

### 12.3 Security Checklist

- [ ] No sensitive data in client-side code
- [ ] Input validation for user data
- [ ] XSS prevention measures
- [ ] CSRF protection where applicable
- [ ] Secure API communication

## Extension Guidelines

### 13.1 Adding New Features

1. **Plan**: Define feature requirements and architecture
2. **Design**: Create component hierarchy and data flow
3. **Implement**: Follow established patterns and conventions
4. **Test**: Write comprehensive tests
5. **Document**: Update documentation and examples

### 13.2 Refactoring Rules

- **Small Steps**: Make incremental changes
- **Test Coverage**: Ensure tests pass before and after
- **Backward Compatibility**: Maintain API compatibility
- **Performance**: Monitor performance impact

### 13.3 Code Reusability

- Extract common patterns into utilities
- Create reusable components
- Use composition over inheritance
- Implement proper abstraction layers

## Maintenance Guidelines

### 14.1 Regular Maintenance

- **Dependency Updates**: Keep dependencies up to date
- **Code Cleanup**: Remove unused code and dependencies
- **Performance Monitoring**: Regular performance audits
- **Security Updates**: Apply security patches promptly

### 14.2 Code Evolution

- **Refactoring**: Regular refactoring to improve code quality
- **Pattern Updates**: Update patterns as best practices evolve
- **Architecture Reviews**: Regular architecture reviews
- **Technical Debt**: Address technical debt proactively

---

## Quick Reference

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utilities: `kebab-case.ts`
- Types: `kebab-case.ts`

### Import Order

1. React/Next.js
2. Third-party libraries
3. Internal absolute imports
4. Relative imports

### Component Structure

1. Imports
2. Types/Interfaces
3. Component definition
4. Hooks
5. State
6. Event handlers
7. Effects
8. Render helpers
9. JSX return

### Class Name Handling

- Use template literals for conditional classes
- Create helper functions for complex conditional styling
- Avoid utility libraries like `cn` or `clsx`
- Use `.trim()` to clean up extra spaces

### Error Handling

- Use Error Boundaries for components
- Try-catch for async operations
- Meaningful error messages
- Proper error logging

### Performance

- React.memo for expensive components
- useMemo/useCallback judiciously
- Code splitting with React.lazy
- Optimize images and assets

This document serves as the definitive guide for maintaining code quality, consistency, and maintainability in the Music App PWA project.
