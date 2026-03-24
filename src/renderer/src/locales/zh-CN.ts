// ==================== 中文语言包 ====================

export default {
  // ==================== 通用 ====================
  common: {
    search: '搜索提示词...',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    copy: '复制',
    copied: '已复制到剪贴板',
    confirm: '确认',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '提示'
  },

  // ==================== 导航 ====================
  nav: {
    library: '提示词库',
    favorites: '收藏夹',
    collections: '集合',
    recent: '最近使用',
    settings: '设置'
  },

  // ==================== 顶部栏 ====================
  topbar: {
    searchPlaceholder: '搜索提示词...',
    notifications: '通知',
    help: '帮助',
    language: '语言'
  },

  // ==================== 提示词库 ====================
  library: {
    title: '提示词库',
    subtitle: '探索和管理你的 AI 提示词集合',
    imagePrompts: '图像提示词',
    videoPrompts: '视频提示词',
    newest: '最新',
    oldest: '最旧',
    viewAll: '查看全部',
    showLess: '收起',
    newTemplate: '新建模板'
  },

  // ==================== 收藏夹 ====================
  favorites: {
    title: '收藏夹',
    subtitle: '你收藏的精选提示词',
    noFavorites: '暂无收藏',
    noFavoritesHint: '点击提示词卡片上的星标添加收藏'
  },

  // ==================== 集合 ====================
  collections: {
    title: '集合',
    subtitle: '管理你的提示词工作区',
    newCollection: '新建集合',
    editCollection: '编辑集合',
    deleteCollection: '删除集合',
    collectionName: '集合名称',
    collectionDesc: '集合描述',
    prompts: '个提示词',
    noCollections: '暂无集合',
    noCollectionsHint: '创建集合来组织你的提示词'
  },

  // ==================== 提示词 ====================
  prompt: {
    createTitle: '创建新提示词',
    editTitle: '编辑提示词',
    createSubtitle: '精心设计你的下一个杰作',
    editSubtitle: '更新你的提示词详情',
    title: '标题',
    titlePlaceholder: '输入描述性标题...',
    contentZh: '中文提示词内容',
    contentZhPlaceholder: '输入中文提示词内容...',
    contentEn: '英文提示词内容',
    contentEnPlaceholder: '输入英文提示词内容...',
    category: '分类',
    tags: '标签',
    addTag: '添加标签...',
    collection: '添加到集合',
    noCollection: '无集合',
    favorite: '添加到收藏夹',
    private: '私密提示词',
    referenceMedia: '参考媒体',
    uploadImage: '上传图片',
    uploadLimit: '最多 {count} 个文件',
    savePrompt: '保存提示词',
    updatePrompt: '更新提示词',
    lastUpdated: '最后更新',
    referenceOutput: '参考输出',
    clickToView: '点击查看',
    metadata: '元数据',
    dateCreated: '创建日期',
    quickTip: '小贴士',
    quickTipContent: '复制此提示词并直接粘贴到 ChatGPT、Midjourney 或 Stable Diffusion 中以获得最佳效果。',
    noContent: '暂无内容',
    deleteConfirm: '删除提示词',
    deleteMessage: '确定要删除此提示词吗？此操作无法撤销。'
  },

  // ==================== 分类 ====================
  categories: {
    imageGeneration: '图像生成',
    videoPrompt: '视频提示词',
    coding: '编程',
    general: '通用',
    conceptArt: '概念艺术',
    layoutDesign: '布局设计'
  },

  // ==================== 设置 ====================
  settings: {
    title: '设置与数据',
    subtitle: '管理你的工作区偏好、本地环境和数据导出',
    storageConfig: '存储配置',
    localStoragePath: '本地存储路径',
    change: '更改',
    dataManagement: '数据管理',
    exportData: '导出工作区数据',
    exportDesc: '下载所有提示词和集合的 JSON 归档文件',
    importing: '导入数据',
    importDesc: '将现有归档合并到当前工作区',
    softwareUpdate: '软件更新',
    systemVersion: '系统版本',
    currentVersion: '当前版本',
    updateAvailable: '有可用更新',
    checkForUpdates: '检查更新',
    checking: '检查中...',
    automaticUpdates: '自动更新',
    automaticUpdatesDesc: '自动下载并安装未来的更新',
    systemHealth: '系统健康',
    systemHealthDesc: '本地环境和引擎连接的实时状态',
    localNode: '本地节点',
    operatingCapacity: '运行正常',
    searchIndex: '搜索索引',
    lastSynced: '最近同步',
    database: '数据库',
    databaseItems: '{count} 个项目',
    collections: '集合',
    collectionsWorkspaces: '{count} 个工作区',
    viewLogs: '查看详细日志',
    purgeData: '清除所有工作区数据',
    purgeDesc: '此操作不可逆。所有本地提示词和索引将被永久删除。',
    purgeAll: '清除全部',
    purgeConfirm: '清除所有数据',
    purgeMessage: '这将永久删除你的所有提示词、集合和设置。此操作无法撤销。',
    updateAvailableTitle: '有可用更新',
    updateAvailableDesc: '版本 {version} 已准备好安装',
    whatsNew: '更新内容：',
    downloadInstall: '下载并安装',
    later: '稍后',
    exporting: '导出中...',
    importSuccess: '已导入 {count} 个提示词',
    purgeSuccess: '所有数据已清除'
  },

  // ==================== 时间 ====================
  time: {
    justNow: '刚刚',
    hoursAgo: '{count} 小时前',
    daysAgo: '{count} 天前',
    today: '今天',
    yesterday: '昨天',
    never: '从未'
  },

  // ==================== Tooltip 提示 ====================
  tooltip: {
    // 顶部栏
    clearSearch: '清除搜索',
    notifications: '通知',
    help: '帮助',
    feedback: '反馈',
    // 侧边栏
    newPrompt: '新建提示词',
    storage: '存储 {size}',
    user: '用户',
    // 提示词卡片
    makePublic: '公开 - 点击设为私密',
    makePrivate: '私密 - 点击设为公开',
    addToFavorites: '添加到收藏夹',
    removeFromFavorites: '从收藏夹移除',
    copy: '复制',
    edit: '编辑',
    delete: '删除',
    // 视图切换
    gridView: '网格视图',
    listView: '列表视图',
    // 创建/编辑页
    cancelWithoutSaving: '取消保存',
    saveChanges: '保存更改',
    createPrompt: '创建提示词',
    uploadImages: '上传图片',
    maxImagesReached: '已达到最大图片数量',
    // 集合
    addPrompts: '添加提示词',
    deleteCollection: '删除集合',
    removeFromCollection: '从集合移除',
    // 设置
    changeStoragePath: '更改存储路径',
    exportData: '导出为 JSON 文件',
    importData: '从 JSON 文件导入',
    checkForUpdates: '检查新版本',
    viewLogs: '查看系统日志',
    reloadLogs: '重新加载日志',
    closeLogs: '关闭日志',
    remindLater: '稍后提醒',
    downloadInstall: '下载并安装',
    deletePermanently: '永久删除所有数据',
    // 提示词详情
    removeFromFavoritesDetail: '从收藏夹移除',
    addToFavoritesDetail: '添加到收藏夹',
    editPrompt: '编辑提示词',
    deletePrompt: '删除提示词',
    copyToClipboard: '复制到剪贴板',
    previousPage: '上一页',
    nextPage: '下一页'
  },

  // ==================== Toast 消息 ====================
  toast: {
    // 通用
    copied: '已复制到剪贴板',
    promptDeleted: '提示词已删除',
    promptNowPublic: '提示词已设为公开',
    promptNowPrivate: '提示词已设为私密',
    // 反馈
    enterFeedback: '请输入反馈内容',
    feedbackSent: '反馈发送成功',
    feedbackFailed: '反馈发送失败',
    // 更新
    latestVersion: '当前已是最新版本',
    checkUpdateFailed: '检查更新失败',
    updateDownloaded: '更新已下载，重启后安装',
    downloadUpdateFailed: '下载更新失败',
    updateDownloadedRestart: '更新已下载完成，重启应用即可安装',
    updateError: '更新出错',
    // 数据管理
    storageMoved: '存储位置已更改到 {path}',
    changeStorageFailed: '更改存储路径失败',
    dataExported: '数据导出成功',
    exportFailed: '导出失败',
    dataImported: '已导入 {count} 个提示词',
    importFailed: '导入失败',
    dataPurged: '所有数据已清除',
    purgeFailed: '清除数据失败',
    // 集合
    promptsAddedToCollection: '提示词已添加到集合',
    removedFromCollection: '已从集合移除',
    collectionUpdated: '集合已更新',
    // 创建/编辑
    maxImagesAllowed: '最多允许 {count} 张图片',
    duplicateImagesSkipped: '已跳过 {count} 张重复图片',
    // 表单验证
    titleRequired: '标题不能为空',
    contentRequired: '请至少填写一种语言的提示词内容'
  },

  // ==================== 对话框 ====================
  dialog: {
    // 按钮
    confirm: '确认',
    cancel: '取消',
    delete: '删除',
    save: '保存',
    create: '创建',
    close: '关闭',
    remove: '移除',
    later: '稍后',
    downloadInstall: '下载并安装',
    // 删除确认
    deletePromptTitle: '删除提示词',
    deletePromptMessage: '确定要删除此提示词吗？此操作无法撤销。',
    // 隐私确认
    makePublicTitle: '设为公开',
    makePublicMessage: '此提示词将对其他人可见（当分享功能启用时）。确定吗？',
    makePrivateTitle: '设为私密',
    makePrivateMessage: '此提示词将对其他人隐藏。确定吗？',
    // 清除数据
    purgeDataTitle: '清除所有数据',
    purgeDataMessage: '这将永久删除您的所有提示词、集合和设置。此操作无法撤销。',
    purgeConfirm: '清除全部',
    // 更新可用
    updateAvailableTitle: '有可用更新',
    updateAvailableMessage: '版本 {version} 已准备好安装',
    whatsNew: '更新内容：',
    // 集合
    deleteCollectionTitle: '删除集合',
    deleteCollectionMessage: '确定要删除「{name}」吗？集合中的提示词不会被删除。',
    removeFromCollectionTitle: '从集合移除',
    removeFromCollectionMessage: '将「{title}」从此集合移除？提示词不会被删除。',
    // 系统日志
    systemLogsTitle: '系统日志',
    noLogs: '暂无日志',
    logEntries: '{count} 条日志记录'
  },

  // ==================== 通知 ====================
  notifications: {
    title: '通知',
    markAllRead: '全部标记为已读',
    noNotifications: '暂无通知',
    // 默认通知
    dataExported: '数据已导出',
    dataExportedMessage: '您的提示词已成功导出',
    newFeatures: '新功能',
    newFeaturesMessage: '查看 v1.0.0 的最新更新',
    storageAlert: '存储提醒',
    storageAlertMessage: '您的库中已有 50+ 个提示词'
  },

  // ==================== 帮助中心 ====================
  help: {
    title: '帮助中心',
    subtitle: 'Help Center',
    // 章节
    intro: '软件介绍',
    introSubtitle: '了解 Promptly AI',
    library: '提示词库',
    librarySubtitle: '管理你的提示词',
    collections: '集合功能',
    collectionsSubtitle: '组织相关提示词',
    favorites: '收藏功能',
    favoritesSubtitle: '快速访问常用提示词',
    shortcuts: '快捷键',
    shortcutsSubtitle: '提高操作效率',
    data: '数据管理',
    dataSubtitle: '导入导出与备份',
    // 软件介绍内容
    appDescription: 'Promptly AI 是一款专为 AI 提示词创作者设计的本地化管理工具。它帮助你高效地组织、搜索和复用你的提示词库，让你的 AI 工作流更加顺畅。',
    coreFeatures: '核心特性',
    localStorage: '本地存储',
    localStorageDesc: '所有数据存储在本地，保护你的隐私和知识产权',
    smartCategory: '智能分类',
    smartCategoryDesc: '支持按类别、标签、集合多维度组织提示词',
    quickSearch: '快速搜索',
    quickSearchDesc: '全文搜索让你瞬间找到需要的提示词',
    oneClickCopy: '一键复制',
    oneClickCopyDesc: '快速复制提示词到剪贴板，直接粘贴使用',
    dataPortability: '数据导入导出',
    dataPortabilityDesc: '轻松备份和迁移你的提示词库',
    // 提示词库
    libraryDesc: '提示词库是你所有提示词的集中管理区域。在这里，你可以浏览、搜索、编辑和删除你的提示词。',
    searchPrompts: '搜索提示词',
    searchPromptsDesc: '使用顶部搜索栏，输入关键词即可在整个提示词库中搜索。搜索范围包括标题、内容和标签。',
    filterCategory: '筛选分类',
    filterCategoryDesc: '点击左侧边栏的分类标签，可以快速筛选特定类型的提示词（如 Image Generation、Video Prompt、Coding 等）。',
    viewToggle: '视图切换',
    viewToggleDesc: '支持网格视图和列表视图两种显示模式，根据你的偏好自由切换。',
    // 集合
    collectionsDesc: '集合功能允许你将相关的提示词组织在一起，创建项目或主题相关的工作空间。',
    createCollection: '创建集合',
    createCollectionDesc: '在 Collections 页面点击 "New Collection" 按钮，输入名称、描述、选择图标和颜色即可创建。',
    addToCollection: '添加提示词',
    addToCollectionDesc: '进入集合详情页，点击 "Add Prompts" 按钮，在弹出的窗口中选择要添加的提示词。',
    removeFromCollectionHelp: '移除提示词',
    removeFromCollectionHelpDesc: '在集合详情页，点击提示词卡片上的移除按钮，可以将提示词从集合中移除（不会删除提示词本身）。',
    // 收藏
    favoritesDesc: '收藏功能帮助你快速访问最常用的提示词，打造你的个人精选库。',
    addFavorite: '添加收藏',
    addFavoriteDesc: '在任意提示词卡片上点击星标图标，即可将其添加到收藏。',
    removeFavorite: '取消收藏',
    removeFavoriteDesc: '再次点击星标图标，即可取消收藏。提示词仍会保留在库中。',
    // 快捷键
    shortcutsDesc: '使用快捷键可以大大提高你的工作效率。以下是 Promptly AI 支持的快捷键：',
    shortcutNewPrompt: '新建提示词',
    shortcutSearch: '搜索',
    shortcutCopy: '复制提示词',
    shortcutSave: '保存编辑',
    // 数据管理
    dataDesc: '在设置页面，你可以管理数据的导入导出、存储路径和清除数据等操作。',
    exportData: '导出数据',
    exportDataDesc: '将所有提示词和集合导出为 JSON 文件，用于备份或迁移到其他设备。',
    importData: '导入数据',
    importDataDesc: '从 JSON 文件导入提示词和集合，支持与现有数据合并。',
    purgeData: '清除数据',
    purgeDataDesc: '永久删除所有提示词和集合。此操作不可撤销，请谨慎使用。'
  },

  // ==================== 反馈 ====================
  feedback: {
    title: '发送反馈',
    subtitle: '帮助我们改进 Promptly AI',
    type: '反馈类型',
    types: {
      bug: 'Bug 报告',
      feature: '功能建议',
      other: '其他'
    },
    content: '您的反馈',
    contentPlaceholder: '请描述您的问题或建议...',
    contact: '联系方式（可选）',
    contactPlaceholder: '邮箱或其他联系方式',
    sendViaEmail: '通过邮件发送',
    submitOnGitHub: '在 GitHub 提交',
    thankYou: '您的反馈帮助我们改进。谢谢！'
  },

  // ==================== 元数据 ====================
  metadata: {
    title: '元数据',
    category: '分类',
    tags: '标签',
    dateCreated: '创建日期',
    visibility: '可见性',
    private: '私密',
    public: '公开',
    referenceOutput: '参考输出',
    clickToView: '点击查看',
    quickTip: '小贴士',
    quickTipContent: '复制此提示词并直接粘贴到 ChatGPT、Midjourney 或 Stable Diffusion 中以获得最佳效果。',
    noContent: '暂无内容'
  },

  // ==================== 系统健康 ====================
  systemHealth: {
    title: '系统健康',
    subtitle: '本地环境和引擎连接的实时状态',
    localNode: '本地节点',
    operatingCapacity: '运行正常',
    searchIndex: '搜索索引',
    lastSynced: '最近同步',
    database: '数据库',
    items: '{count} 个项目',
    collections: '集合',
    workspaces: '{count} 个工作区'
  },

  // ==================== 集合创建/编辑 ====================
  collectionModal: {
    createTitle: '创建集合',
    editTitle: '编辑集合',
    name: '名称',
    namePlaceholder: '集合名称...',
    description: '描述',
    descriptionPlaceholder: '可选描述...',
    icon: '图标',
    color: '颜色'
  },

  // ==================== 添加提示词到集合 ====================
  addPromptModal: {
    title: '添加提示词到 "{name}"',
    searchPlaceholder: '按标题或内容搜索...',
    filter: '筛选',
    category: '分类',
    allCategories: '所有分类',
    tags: '标签',
    allTags: '所有标签',
    collectionStatus: '集合状态',
    all: '全部',
    notInCollection: '不在任何集合中',
    inOtherCollection: '在其他集合中',
    inCurrentCollection: '在当前集合中',
    specificCollection: '特定集合',
    allCollections: '所有集合',
    selectAll: '全选',
    deselectAll: '取消全选',
    selected: '已选择 {count} 个',
    addPrompts: '添加 {count} 个提示词',
    noPromptsAvailable: '没有可添加的提示词',
    inCollection: '已在集合中',
    inOther: '在其他集合'
  },

  // ==================== 分类 ====================
  categoryLabels: {
    all: '全部',
    image: '图像',
    video: '视频'
  },

  // ==================== 空状态 ====================
  empty: {
    noPrompts: '暂无提示词',
    createFirst: '创建您的第一个提示词！',
    createPrompt: '创建提示词',
    noFavorites: '暂无收藏',
    starPrompts: '给提示词添加星标收藏！',
    noCollections: '暂无集合',
    noCollectionsHint: '创建集合来组织您的提示词',
    noNotifications: '暂无通知',
    noRecentActivity: '暂无最近活动',
    noPromptsInCollection: '此集合中暂无提示词',
    addPrompts: '添加提示词'
  },

  // ==================== 列表/网格视图 ====================
  view: {
    showing: '显示 {filtered} 个，共 {total} 个提示词',
    showingFavorites: '显示 {count} 个收藏',
    grid: '网格',
    list: '列表',
    newest: '最新',
    oldest: '最旧',
    viewAll: '查看全部 ({count})',
    showLess: '收起',
    sortByNewest: '按最新排序',
    sortByOldest: '按最旧排序'
  },

  // ==================== 集合列表页 ====================
  collectionsList: {
    overview: '库概览',
    title: '提示词集合',
    subtitle: '将您的 AI 工作流组织成语义化工作区',
    newCollection: '新建集合',
    createWorkspace: '创建工作区',
    searchPlaceholder: '搜索集合...',
    prompts: '提示词',
    items: '{count} 个项目',
    updated: '更新于',
    collections: '集合',
    activePrompts: '活跃提示词',
    favorites: '收藏'
  },

  // ==================== 集合详情页 ====================
  collectionDetail: {
    promptsCount: '{count} 个提示词',
    noDescription: '暂无描述',
    addPrompts: '添加提示词',
    editCollection: '编辑集合'
  },

  // ==================== 最近使用 ====================
  recent: {
    activityLog: '活动日志',
    title: '最近提示词',
    showAll: '显示全部',
    showImage: '显示图像',
    showVideo: '显示视频',
    open: '打开'
  },

  // ==================== 表单标签 ====================
  form: {
    promptTitle: '提示词标题',
    required: '必填',
    chineseContent: '中文提示词内容',
    englishContent: '英文提示词内容',
    referenceMedia: '参考媒体',
    imagesCount: '{current}/{max} 张图片',
    upload: '上传',
    promptCategory: '提示词分类',
    addToCollection: '添加到集合',
    noCollection: '无集合',
    addToFavorites: '添加到收藏夹',
    privatePrompt: '私密提示词'
  }
}

