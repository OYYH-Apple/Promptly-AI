// ==================== English Language Pack ====================

export default {
  // ==================== Common ====================
  common: {
    search: 'Search prompts...',
    searchPrompts: 'Search prompts...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied to clipboard',
    confirm: 'Confirm',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    chinese: 'Chinese',
    english: 'English',
    refresh: 'Refresh',
    close: 'Close',
    open: 'Open',
    create: 'Create',
    add: 'Add',
    remove: 'Remove',
    clear: 'Clear',
    searchCollections: 'Search collections...'
  },

  // ==================== Navigation ====================
  nav: {
    library: 'Library',
    favorites: 'Favorites',
    collections: 'Collections',
    recent: 'Recent',
    settings: 'Settings'
  },

  // ==================== TopBar ====================
  topbar: {
    searchPlaceholder: 'Search prompts...',
    notifications: 'Notifications',
    help: 'Help',
    language: 'Language'
  },

  // ==================== Library ====================
  library: {
    title: 'Prompt Library',
    subtitle: 'Explore and manage your AI prompt collection',
    imagePrompts: 'Image Prompts',
    videoPrompts: 'Video Prompts',
    newest: 'Newest',
    oldest: 'Oldest',
    viewAll: 'View all',
    showLess: 'Show less',
    newTemplate: 'New Template'
  },

  // ==================== Favorites ====================
  favorites: {
    title: 'Favorites',
    subtitle: 'Your curated collection of starred prompts',
    noFavorites: 'No favorites yet',
    noFavoritesHint: 'Click the star on any prompt card to add it to favorites'
  },

  // ==================== Collections ====================
  collections: {
    overview: 'Overview',
    title: 'Collections',
    subtitle: 'Manage your prompt workspaces',
    newCollection: 'New Collection',
    createWorkspace: 'Create Workspace',
    editCollection: 'Edit Collection',
    deleteCollection: 'Delete Collection',
    collectionName: 'Collection Name',
    collectionDesc: 'Collection Description',
    prompts: 'prompts',
    promptsLabel: 'Prompts',
    updatedLabel: 'Updated',
    collectionsLabel: 'Collections',
    favoritesLabel: 'Favorites',
    noCollections: 'No collections yet',
    noCollectionsHint: 'Create a collection to organize your prompts',
    noDescription: 'No description'
  },

  // ==================== Prompt ====================
  prompt: {
    createTitle: 'Create New Prompt',
    editTitle: 'Edit Prompt',
    createSubtitle: 'Design your next masterpiece with precision',
    editSubtitle: 'Update your prompt details',
    title: 'Title',
    titlePlaceholder: 'Enter a descriptive title...',
    contentZh: 'Chinese Prompt Content',
    contentZhPlaceholder: 'Enter Chinese prompt content...',
    contentEn: 'English Prompt Content',
    contentEnPlaceholder: 'Enter English prompt content...',
    category: 'Category',
    tags: 'Tags',
    addTag: 'Add tag...',
    collection: 'Add to Collection',
    noCollection: 'No collection',
    favorite: 'Add to Favorites',
    private: 'Private Prompt',
    referenceMedia: 'Reference Media',
    uploadImage: 'Upload',
    uploadLimit: 'Up to {count} files',
    savePrompt: 'Save Prompt',
    updatePrompt: 'Update Prompt',
    lastUpdated: 'Last updated',
    referenceOutput: 'Reference Output',
    clickToView: 'click to view',
    metadata: 'Metadata',
    dateCreated: 'Date Created',
    quickTip: 'Quick Tip',
    quickTipContent: 'Copy this prompt and paste it directly into ChatGPT, Midjourney, or Stable Diffusion for best results.',
    noContent: 'No content available',
    deleteConfirm: 'Delete Prompt',
    deleteMessage: 'Are you sure you want to delete this prompt? This action cannot be undone.'
  },

  // ==================== Categories ====================
  categories: {
    imageGeneration: 'Image Generation',
    videoPrompt: 'Video Prompt',
    coding: 'Coding',
    general: 'General',
    conceptArt: 'Concept Art',
    layoutDesign: 'Layout Design'
  },

  // ==================== Settings ====================
  settings: {
    title: 'Settings & Data',
    subtitle: 'Manage your workspace preferences, local environment, and data portability',
    storageConfig: 'Storage Configuration',
    localStoragePath: 'Local Storage Path',
    change: 'Change',
    dataManagement: 'Data Management',
    exportData: 'Export Workspace Data',
    exportDesc: 'Download a JSON archive of all your prompts and collections',
    importing: 'Import Data',
    importDesc: 'Merge existing archives into your current workspace',
    softwareUpdate: 'Software Update',
    systemVersion: 'System Version',
    currentVersion: 'Current version',
    updateAvailable: 'Update available',
    checkForUpdates: 'Check for Updates',
    checking: 'Checking...',
    automaticUpdates: 'Automatic Updates',
    automaticUpdatesDesc: 'Automatically download and install future updates',
    systemHealth: 'System Health',
    systemHealthDesc: 'Real-time status of your local environment and engine connections',
    localNode: 'Local Node',
    operatingCapacity: 'Operating at 100% capacity',
    searchIndex: 'Search Index',
    lastSynced: 'Last synced just now',
    database: 'Database',
    databaseItems: '{count} items',
    collections: 'Collections',
    collectionsWorkspaces: '{count} workspaces',
    viewLogs: 'View detailed logs',
    purgeData: 'Purge All Workspace Data',
    purgeDesc: 'This action is irreversible. All local prompts and indexes will be permanently deleted.',
    purgeAll: 'Purge Data',
    purgeConfirm: 'Purge All Data',
    purgeMessage: 'This will permanently delete all your prompts, collections, and settings. This action cannot be undone.',
    updateAvailableTitle: 'Update Available',
    updateAvailableDesc: 'Version {version} is ready to install',
    whatsNew: "What's new:",
    downloadInstall: 'Download & Install',
    later: 'Later',
    exporting: 'Exporting...',
    importSuccess: 'Imported {count} prompts',
    purgeSuccess: 'All data has been purged'
  },

  // ==================== Time ====================
  time: {
    justNow: 'Just now',
    hoursAgo: '{count} hours ago',
    daysAgo: '{count} days ago',
    today: 'Today',
    yesterday: 'Yesterday',
    never: 'Never'
  },

  // ==================== Tooltip Texts ====================
  tooltip: {
    // Top Bar
    clearSearch: 'Clear search',
    notifications: 'Notifications',
    help: 'Help',
    feedback: 'Feedback',
    language: 'Language',
    // Sidebar
    newPrompt: 'New Prompt',
    storage: 'Storage {size}',
    user: 'User',
    // PromptCard
    makePublic: 'Public - Click to make private',
    makePrivate: 'Private - Click to make public',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    copy: 'Copy',
    edit: 'Edit',
    delete: 'Delete',
    // View toggle
    gridView: 'Grid view',
    listView: 'List view',
    // Create/Edit page
    cancelWithoutSaving: 'Cancel without saving',
    saveChanges: 'Save changes',
    createPrompt: 'Create prompt',
    uploadImages: 'Upload images',
    maxImagesReached: 'Maximum images reached',
    // Collections
    addPrompts: 'Add prompts',
    deleteCollection: 'Delete collection',
    removeFromCollection: 'Remove from collection',
    // Settings
    changeStoragePath: 'Change storage path',
    exportData: 'Export as JSON file',
    importData: 'Import from JSON file',
    checkForUpdates: 'Check for new version',
    viewLogs: 'View system logs',
    reloadLogs: 'Reload logs',
    closeLogs: 'Close logs',
    remindLater: 'Remind me later',
    downloadInstall: 'Download & Install',
    deletePermanently: 'Permanently delete all data',
    // Prompt Detail
    removeFromFavoritesDetail: 'Remove from favorites',
    addToFavoritesDetail: 'Add to favorites',
    editPrompt: 'Edit prompt',
    deletePrompt: 'Delete prompt',
    copyToClipboard: 'Copy to clipboard',
    previousPage: 'Previous page',
    nextPage: 'Next page'
  },

  // ==================== Toast Messages ====================
  toast: {
    // Common
    copied: 'Copied to clipboard',
    promptDeleted: 'Prompt deleted',
    promptNowPublic: 'Prompt is now public',
    promptNowPrivate: 'Prompt is now private',
    // Feedback
    enterFeedback: 'Please enter feedback content',
    feedbackSent: 'Feedback sent successfully',
    feedbackFailed: 'Failed to send feedback',
    // Updates
    latestVersion: 'You are running the latest version',
    checkUpdateFailed: 'Failed to check for updates',
    updateDownloaded: 'Update downloaded, restart to install',
    downloadUpdateFailed: 'Failed to download update',
    updateDownloadedRestart: 'Update downloaded, restart app to install',
    updateError: 'Update error',
    // Data Management
    storageMoved: 'Storage moved to {path}',
    changeStorageFailed: 'Failed to change storage path',
    dataExported: 'Data exported successfully',
    exportFailed: 'Export failed',
    dataImported: 'Imported {count} prompts',
    importFailed: 'Import failed',
    dataPurged: 'All data has been purged',
    purgeFailed: 'Failed to purge data',
    // Collections
    promptsAddedToCollection: 'Prompts added to collection',
    removedFromCollection: 'Removed from collection',
    collectionUpdated: 'Collection updated',
    // Create/Edit
    maxImagesAllowed: 'Maximum {count} images allowed',
    duplicateImagesSkipped: '{count} duplicate image(s) skipped',
    // Form Validation
    titleRequired: 'Title is required',
    contentRequired: 'Please fill in at least one prompt content'
  },

  // ==================== Dialogs ====================
  dialog: {
    // Buttons
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save',
    create: 'Create',
    close: 'Close',
    remove: 'Remove',
    later: 'Later',
    downloadInstall: 'Download & Install',
    // Delete confirmation
    deletePromptTitle: 'Delete Prompt',
    deletePromptMessage: 'Are you sure you want to delete this prompt? This action cannot be undone.',
    // Privacy confirmation
    makePublicTitle: 'Make Public',
    makePublicMessage: 'This prompt will be visible to others when sharing features are enabled. Are you sure?',
    makePrivateTitle: 'Make Private',
    makePrivateMessage: 'This prompt will be hidden from others. Are you sure?',
    // Purge data
    purgeDataTitle: 'Purge All Data',
    purgeDataMessage: 'This will permanently delete all your prompts, collections, and settings. This action cannot be undone.',
    purgeConfirm: 'Purge All',
    // Update available
    updateAvailableTitle: 'Update Available',
    updateAvailableMessage: 'Version {version} is ready to install',
    whatsNew: "What's new:",
    // Collections
    deleteCollectionTitle: 'Delete Collection',
    deleteCollectionMessage: "Are you sure you want to delete '{name}'? Prompts in this collection will not be deleted.",
    removeFromCollectionTitle: 'Remove from Collection',
    removeFromCollectionMessage: "Remove '{title}' from this collection? The prompt will not be deleted.",
    // System Logs
    systemLogsTitle: 'System Logs',
    noLogs: 'No logs available',
    logEntries: '{count} log entries'
  },

  // ==================== Notifications ====================
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications',
    // Default notifications
    dataExported: 'Data Exported',
    dataExportedMessage: 'Your prompts have been exported successfully',
    newFeatures: 'New Features',
    newFeaturesMessage: 'Check out the latest updates in v1.0.0',
    storageAlert: 'Storage Alert',
    storageAlertMessage: 'You have 50+ prompts in your library'
  },

  // ==================== Help Center ====================
  help: {
    title: 'Help Center',
    subtitle: 'Help Center',
    // Navigation
    introNav: 'Introduction',
    libraryNav: 'Prompt Library',
    collectionsNav: 'Collections',
    favoritesNav: 'Favorites',
    shortcutsNav: 'Shortcuts',
    dataNav: 'Data Management',
    // Section titles and subtitles
    introTitle: 'Introduction',
    introSubtitle: 'Learn about Promptly AI',
    libraryTitle: 'Prompt Library',
    librarySubtitle: 'Manage your prompts',
    collectionsTitle: 'Collections',
    collectionsSubtitle: 'Organize related prompts',
    favoritesTitle: 'Favorites',
    favoritesSubtitle: 'Quick access to frequently used prompts',
    shortcutsTitle: 'Shortcuts',
    shortcutsSubtitle: 'Improve your workflow efficiency',
    dataTitle: 'Data Management',
    dataSubtitle: 'Import, export and backup',
    // Sections (backward compatibility)
    intro: 'Introduction',
    library: 'Prompt Library',
    collections: 'Collections',
    favorites: 'Favorites',
    shortcuts: 'Shortcuts',
    data: 'Data Management',
    // Introduction content
    appDescription: 'Promptly AI is a local management tool designed for AI prompt creators. It helps you efficiently organize, search, and reuse your prompt library, making your AI workflow smoother.',
    coreFeatures: 'Core Features',
    localStorage: 'Local Storage',
    localStorageDesc: 'All data is stored locally, protecting your privacy and intellectual property',
    smartCategory: 'Smart Categorization',
    smartCategoryDesc: 'Support organizing prompts by category, tags, and collections',
    quickSearch: 'Quick Search',
    quickSearchDesc: 'Full-text search helps you find the prompts you need instantly',
    oneClickCopy: 'One-Click Copy',
    oneClickCopyDesc: 'Quickly copy prompts to clipboard and paste directly for use',
    dataPortability: 'Data Import/Export',
    dataPortabilityDesc: 'Easily backup and migrate your prompt library',
    // Library
    libraryDesc: 'The Prompt Library is the central management area for all your prompts. Here you can browse, search, edit, and delete your prompts.',
    searchPrompts: 'Search Prompts',
    searchPromptsDesc: 'Use the top search bar to search across your entire prompt library. Search covers titles, content, and tags.',
    filterCategory: 'Filter by Category',
    filterCategoryDesc: 'Click category tags in the sidebar to quickly filter specific types of prompts (e.g., Image Generation, Video Prompt, Coding, etc.).',
    viewToggle: 'View Toggle',
    viewToggleDesc: 'Support both grid and list view modes, switch freely according to your preference.',
    // Collections
    collectionsDesc: 'The Collections feature allows you to organize related prompts together, creating project or theme-related workspaces.',
    createCollection: 'Create Collection',
    createCollectionDesc: 'On the Collections page, click the "New Collection" button, enter name, description, select icon and color to create.',
    addToCollection: 'Add Prompts',
    addToCollectionDesc: 'Enter the collection detail page, click the "Add Prompts" button, and select prompts to add in the popup window.',
    removeFromCollectionHelp: 'Remove Prompts',
    removeFromCollectionHelpDesc: 'On the collection detail page, click the remove button on the prompt card to remove it from the collection (the prompt itself will not be deleted).',
    // Favorites
    favoritesDesc: 'The Favorites feature helps you quickly access your most frequently used prompts, building your personal curated library.',
    addFavorite: 'Add to Favorites',
    addFavoriteDesc: 'Click the star icon on any prompt card to add it to favorites.',
    removeFavorite: 'Remove from Favorites',
    removeFavoriteDesc: 'Click the star icon again to remove from favorites. The prompt will remain in the library.',
    // Shortcuts
    shortcutsDesc: 'Using keyboard shortcuts can greatly improve your work efficiency. Here are the shortcuts supported by Promptly AI:',
    shortcutNewPrompt: 'New Prompt',
    shortcutSearch: 'Search',
    shortcutCopy: 'Copy Prompt',
    shortcutSave: 'Save Edit',
    // Data Management
    dataDesc: 'In the Settings page, you can manage data import/export, storage path, and data purge operations.',
    exportData: 'Export Data',
    exportDataDesc: 'Export all prompts and collections as a JSON file for backup or migration to other devices.',
    importData: 'Import Data',
    importDataDesc: 'Import prompts and collections from a JSON file, supporting merge with existing data.',
    purgeData: 'Purge Data',
    purgeDataDesc: 'Permanently delete all prompts and collections. This action is irreversible, please use with caution.'
  },

  // ==================== Feedback ====================
  feedback: {
    title: 'Send Feedback',
    subtitle: 'Help us improve Promptly AI',
    typeLabel: 'Feedback Type',
    bugReport: 'Bug Report',
    featureRequest: 'Feature Request',
    other: 'Other',
    contentLabel: 'Your Feedback',
    contentPlaceholder: 'Please describe your issue or suggestion...',
    contactLabel: 'Contact (Optional)',
    contactPlaceholder: 'Email or other contact info',
    sendViaEmail: 'Send via Email',
    submitOnGitHub: 'Submit on GitHub',
    thankYou: 'Your feedback helps us improve. Thank you!',
    pleaseEnterContent: 'Please enter feedback content',
    sentSuccess: 'Feedback sent successfully!',
    sendFailed: 'Failed to send feedback',
    // Backward compatibility
    type: 'Feedback Type',
    types: {
      bug: 'Bug Report',
      feature: 'Feature Request',
      other: 'Other'
    },
    content: 'Your Feedback',
    contact: 'Contact (Optional)'
  },

  // ==================== Metadata ====================
  metadata: {
    title: 'Metadata',
    category: 'Category',
    tags: 'Tags',
    dateCreated: 'Date Created',
    visibility: 'Visibility',
    private: 'Private',
    public: 'Public',
    referenceOutput: 'Reference Output',
    clickToView: 'click to view',
    quickTip: 'Quick Tip',
    quickTipContent: 'Copy this prompt and paste it directly into ChatGPT, Midjourney, or Stable Diffusion for best results.',
    noContent: 'No content available'
  },

  // ==================== System Health ====================
  systemHealth: {
    title: 'System Health',
    subtitle: 'Real-time status of your local environment and engine connections',
    localNode: 'Local Node',
    operatingCapacity: 'Operating at 100% capacity',
    searchIndex: 'Search Index',
    lastSynced: 'Last synced just now',
    database: 'Database',
    items: '{count} items',
    collections: 'Collections',
    workspaces: '{count} workspaces'
  },

  // ==================== Collection Modal ====================
  collectionModal: {
    title: 'Create Collection',
    createTitle: 'Create Collection',
    editTitle: 'Edit Collection',
    name: 'Name',
    namePlaceholder: 'Collection name...',
    description: 'Description',
    descriptionPlaceholder: 'Optional description...',
    icon: 'Icon',
    color: 'Color'
  },

  // ==================== Add Prompt to Collection ====================
  addPromptModal: {
    title: 'Add Prompts to "{name}"',
    searchPlaceholder: 'Search by title or content...',
    filter: 'Filter',
    category: 'Category',
    allCategories: 'All Categories',
    tags: 'Tags',
    allTags: 'All Tags',
    collectionStatus: 'Collection Status',
    all: 'All',
    notInCollection: 'Not in any collection',
    notInAnyCollection: 'Not in any collection',
    inOtherCollection: 'In other collection',
    inCurrentCollection: 'In current collection',
    specificCollection: 'Specific Collection',
    allCollections: 'All Collections',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selected: '{count} selected',
    addPrompts: 'Add {count} Prompts',
    noPromptsAvailable: 'No prompts available to add',
    inCollection: 'In collection',
    inOther: 'In other'
  },

  // ==================== Categories ====================
  categoryLabels: {
    all: 'All',
    image: 'Image',
    video: 'Video',
    ImageGeneration: 'Image Generation',
    VideoPrompt: 'Video Prompt'
  },

  // ==================== Empty States ====================
  empty: {
    noPrompts: 'No prompts yet',
    createFirst: 'Create your first one!',
    createPrompt: 'Create Prompt',
    noFavorites: 'No favorites yet',
    starPrompts: 'Star some prompts!',
    noCollections: 'No collections yet',
    noCollectionsHint: 'Create a collection to organize your prompts',
    noNotifications: 'No notifications',
    noRecentActivity: 'No recent activity',
    noPromptsInCollection: 'No prompts in this collection yet',
    addPrompts: 'Add Prompts'
  },

  // ==================== List/Grid View ====================
  view: {
    showing: 'Showing {filtered} of {total} prompts',
    showingFavorites: 'Showing {count} favorites',
    grid: 'Grid',
    list: 'List',
    newest: 'Newest',
    oldest: 'Oldest',
    viewAll: 'View all ({count})',
    showLess: 'Show less',
    sortByNewest: 'Sort by newest',
    sortByOldest: 'Sort by oldest'
  },

  // ==================== Collections List ====================
  collectionsList: {
    overview: 'Library Overview',
    title: 'Prompt Collections',
    subtitle: 'Organize your AI workflows into semantic workspaces',
    newCollection: 'New Collection',
    createWorkspace: 'Create a focused workspace',
    searchPlaceholder: 'Search collections...',
    prompts: 'Prompts',
    items: '{count} items',
    updated: 'Updated',
    collections: 'Collections',
    activePrompts: 'Active Prompts',
    favorites: 'Favorites'
  },

  // ==================== Collection Detail ====================
  collectionDetail: {
    promptsCount: '{count} PROMPTS',
    noDescription: 'No description available',
    addPrompts: 'Add Prompts',
    editCollection: 'Edit Collection'
  },

  // ==================== Recent ====================
  recent: {
    activityLog: 'Activity Log',
    title: 'Recent Prompts',
    showAll: 'Show all',
    showImage: 'Show image',
    showVideo: 'Show video',
    open: 'Open'
  },

  // ==================== Form Labels ====================
  form: {
    promptTitle: 'Prompt Title',
    required: 'Required',
    chineseContent: 'Chinese Prompt Content',
    englishContent: 'English Prompt Content',
    referenceMedia: 'Reference Media',
    imagesCount: '{current}/{max} images',
    upload: 'Upload',
    promptCategory: 'Prompt Category',
    addToCollection: 'Add to Collection',
    noCollection: 'No collection',
    addToFavorites: 'Add to Favorites',
    privatePrompt: 'Private Prompt'
  }
}

