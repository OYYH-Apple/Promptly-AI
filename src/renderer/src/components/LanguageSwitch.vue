<template>
    <div class="relative">
        <Tooltip :text="t('tooltip.language')" placement="bottom">
            <button @click="showDropdown = !showDropdown"
                class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors font-medium text-on-surface-variant"
                :class="currentLocale === 'zh-CN' ? 'text-sm' : 'text-sm'">
                <span class="text-sm">{{ currentLocale === 'zh-CN' ? 'CN' : 'US' }}</span>
                <span class="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
        </Tooltip>

        <!-- Dropdown -->
        <div v-if="showDropdown"
            class="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
            <button v-for="lang in languages" :key="lang.code" @click="selectLanguage(lang.code)"
                class="w-full px-4 py-2.5 text-left hover:bg-surface-container-low transition-colors flex items-center gap-3"
                :class="[
                    currentLocale === lang.code ? 'bg-primary/5 text-primary font-medium' : 'text-slate-600',
                    lang.code === 'zh-CN' ? 'text-base' : 'text-sm'
                ]">
                <span class="text-lg">{{ lang.flag }}</span>
                <span>{{ lang.name }}</span>
                <span v-if="currentLocale === lang.code"
                    class="material-symbols-outlined text-primary text-[18px] ml-auto">
                    check
                </span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, getLocale } from '@/plugins/i18n'
import type { Locale } from '@/locales'
import Tooltip from './Tooltip.vue'

const { t } = useI18n()
const showDropdown = ref(false)

const languages: { code: Locale; name: string; flag: string }[] = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' }
]

const currentLocale = computed(() => getLocale())

function selectLanguage(code: Locale) {
    setLocale(code)
    showDropdown.value = false
}

function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
        showDropdown.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>
