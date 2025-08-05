# Focus Mode for Textarea

## Overview

The Focus Mode for Textarea is a UI/UX enhancement designed to provide a distraction-free writing environment for lengthy text inputs. When activated, the textarea expands to fill the screen with a blurred backdrop, allowing the user to concentrate solely on the content they are writing.

## Implementation Details

The implementation leverages `framer-motion` for the layout animation and a React Portal to render the focused view. This approach ensures a seamless transition and isolates the focused view from the constraints of its parent containers.

### Core Components

-   **`AIFieldWrapper.tsx`**: This component manages the state of the focus mode (`isFocusMode`) and triggers the animation. It renders the `AutocompleteTextarea` in its standard view and the `FocusView` component when focus mode is active.

-   **`FocusView.tsx`**: This component is responsible for rendering the focused state of the textarea. It uses a React Portal (`createPortal`) to render itself at the top of the DOM tree, ensuring it is not constrained by any parent containers. It accepts the `layoutId` and the textarea props, and manages the local state of the textarea while in focus mode to prevent performance issues.

-   **`AutocompleteTextarea.tsx`**: This is the textarea component itself. It is wrapped in `React.memo` to prevent unnecessary re-renders and has conditional styling to handle the focus mode.

### Animation

The animation is achieved using `framer-motion`'s `layoutId` prop. Both the standard view and the focused view share the same `layoutId`. When the `isFocusMode` state changes, `framer-motion` automatically animates the transition between the two views.

To prevent the textarea from animating on resize in the standard view, the `motion.div` wrapping the standard `AutocompleteTextarea` does not have the `layout` prop enabled. The `layout` prop is only enabled on the `FocusView` component, ensuring the animation only occurs when entering and exiting focus mode.

### State Management

To prevent the application from freezing when editing text in focus mode, the `FocusView` component manages its own local state for the textarea's value. The main application state is only updated once, when the user exits focus mode. This is a critical optimization that prevents a cascade of re-renders across the application on every keystroke.

## UX Considerations

-   **Activation**: The focus mode is activated by clicking a "maximize" icon that appears on hover over the textarea.
-   **Deactivation**: The focus mode can be deactivated by clicking the blurred backdrop, pressing the "Escape" key, or clicking the "shrink" icon.
-   **Smoothness**: The animation is designed to be smooth and intuitive, providing a seamless transition between the standard and focused views.
-   **Performance**: The implementation is optimized to prevent performance issues, even with large amounts of text.
