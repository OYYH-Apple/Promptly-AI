# Promptly AI

A modern AI prompt management tool built with Vue 3, Electron, and TypeScript.

## Features

- **Prompt Library** - Organize and manage your AI prompts with grid/list view toggle
- **Favorites** - Quick access to your most-used and starred prompts
- **Collections** - Group prompts into semantic workspaces for better organization
- **Recent** - Track your recently accessed prompts
- **Multi-language Support** - Store prompts in both Chinese and English

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Tailwind CSS
- **Desktop**: Electron
- **State Management**: Pinia
- **Routing**: Vue Router
- **Database**: SQLite (sql.js)
- **Icons**: Material Symbols Outlined

## Screenshots

### Prompt Library
![Library](src\renderer\src\assets\images\Library.png)

### Favorites
![Favorites](src\renderer\src\assets\images\Favorites.png)

### Collection
![Collection](src\renderer\src\assets\images\Collection.png)

### ImageView
![ImageView](src\renderer\src\assets\images\ImageView.png)

## Getting Started

### Prerequisites

- Node.js >= 16
- npm >= 8

### Installation

```bash
# Clone the repository
git clone https://github.com/OYYH-Apple/Promptly-AI.git
cd Promptly-AI

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── main/                 # Electron main process
├── preload/              # Electron preload scripts
└── renderer/
    └── src/
        ├── components/   # Reusable Vue components
        │   ├── ConfirmDialog.vue
        ├── ImageViewer.vue
        │   ├── Sidebar.vue
        │   ├── Toast.vue
        │   └── TopBar.vue
        ├── views/        # Page components
        │   ├── Library.vue
        │   ├── Favorites.vue
        │   ├── Collections.vue
        │   ├── CollectionDetail.vue
        │   ├── Recent.vue
        │   ├── Settings.vue
        │   ├── PromptDetail.vue
        │   └── CreatePrompt.vue
        ├── stores/       # Pinia state management
        ├── router/       # Vue Router configuration
        └── styles/       # Global styles
```

## Features Detail

### Global Components

- **ConfirmDialog** - Modal confirmation dialog with multiple types (warning, danger, info, success)
- **Toast** - Notification messages for user feedback
- **ImageViewer** - Full-screen image viewer with zoom and navigation

### Library View

- Grid and list view toggle
- Thumbnail previews with zoom cursor
- Click thumbnail to open image viewer
- Copy prompt to clipboard with toast notification
- Toggle favorite status

### Collections

- Create and manage collections with custom icons and colors
- Add prompts to collections via modal dialog
- View collection details with all prompts
- Remove prompts from collections

## Development

```bash
# Run in development mode
npm run dev

# Type check
vue-tsc --noEmit

# Build electron app
npm run electron:build
```

## License

Apache-2.0

## Author

codename19
