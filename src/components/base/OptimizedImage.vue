<template>
  <div
    ref="imageContainer"
    class="optimized-image-container"
    :class="{
      loading: isLoading,
      error: hasError,
      loaded: isLoaded,
    }"
    :style="containerStyle"
  >
    <!-- Placeholder while loading -->
    <div
      v-if="isLoading || (!isVisible && !isLoaded)"
      class="image-placeholder"
      :style="placeholderStyle"
    >
      <q-skeleton
        v-if="showSkeleton && !hasError"
        type="rect"
        :width="width?.toString()"
        :height="height?.toString()"
        class="skeleton-placeholder"
      />
      <div v-else-if="!hasError" class="placeholder-icon">
        <q-icon :name="placeholderIcon" :size="iconSize" color="grey-4" />
      </div>
      <div v-if="hasError" class="error-placeholder">
        <q-icon name="broken_image" :size="iconSize" color="negative" />
        <div v-if="showErrorText" class="error-text">
          {{ $t('common.imageLoadError') }}
        </div>
      </div>
    </div>

    <!-- Optimized image -->
    <img
      v-show="isLoaded && !hasError"
      ref="imageElement"
      :src="optimizedSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="useNativeLazyLoading ? 'lazy' : 'eager'"
      class="optimized-img"
      @load="handleLoad"
      @error="handleError"
      @click="handleClick"
    />

    <!-- Loading overlay -->
    <div v-if="isLoading && showLoadingOverlay" class="loading-overlay">
      <q-spinner-dots size="24px" color="primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  interface Props {
    src: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    lazy?: boolean;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png' | 'auto';
    placeholder?: string;
    placeholderIcon?: string;
    showSkeleton?: boolean;
    showLoadingOverlay?: boolean;
    showErrorText?: boolean;
    useNativeLazyLoading?: boolean;
    rootMargin?: string;
    threshold?: number;
    aspectRatio?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
    borderRadius?: string;
    clickable?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    alt: '',
    lazy: true,
    quality: 85,
    format: 'auto',
    placeholder: '',
    placeholderIcon: 'image',
    showSkeleton: true,
    showLoadingOverlay: false,
    showErrorText: true,
    useNativeLazyLoading: true,
    rootMargin: '50px',
    threshold: 0.1,
    objectFit: 'cover',
    borderRadius: '4px',
    clickable: false,
  });

  interface Emits {
    (e: 'load'): void;
    (e: 'error'): void;
    (e: 'click'): void;
  }

  const emit = defineEmits<Emits>();
  const { t } = useI18n();

  // Refs
  const imageContainer = ref<HTMLElement>();
  const imageElement = ref<HTMLImageElement>();
  const isVisible = ref(false);
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const hasError = ref(false);
  const observer = ref<IntersectionObserver>();

  // Computed
  const optimizedSrc = computed(() => {
    if (!props.src) return '';

    // If it's a data URL or blob, return as-is
    if (props.src.startsWith('data:') || props.src.startsWith('blob:')) {
      return props.src;
    }

    // Create optimized URL with query parameters
    const url = new URL(props.src, window.location.origin);

    if (props.quality !== 85) {
      url.searchParams.set('quality', props.quality.toString());
    }

    if (props.format !== 'auto') {
      url.searchParams.set('format', props.format);
    }

    if (props.width) {
      url.searchParams.set('width', props.width.toString());
    }

    if (props.height) {
      url.searchParams.set('height', props.height.toString());
    }

    return url.toString();
  });

  const containerStyle = computed(() => ({
    width: props.width ? `${props.width}px` : '100%',
    height: props.height ? `${props.height}px` : 'auto',
    aspectRatio: props.aspectRatio || undefined,
    borderRadius: props.borderRadius,
    cursor: props.clickable ? 'pointer' : 'default',
  }));

  const placeholderStyle = computed(() => ({
    width: props.width ? `${props.width}px` : '100%',
    height: props.height ? `${props.height}px` : '200px',
    aspectRatio: props.aspectRatio || undefined,
    borderRadius: props.borderRadius,
  }));

  const iconSize = computed(() => {
    const size = Math.min(
      parseInt(props.width?.toString() || '200') / 4,
      parseInt(props.height?.toString() || '200') / 4,
      48
    );
    return `${Math.max(size, 24)}px`;
  });

  // Methods
  const startLoading = () => {
    if (!props.src || hasError.value) return;

    isLoading.value = true;

    // Preload the image
    const img = new Image();
    img.onload = () => {
      handleLoad();
    };
    img.onerror = () => {
      handleError();
    };
    img.src = optimizedSrc.value;
  };

  const handleLoad = () => {
    isLoading.value = false;
    isLoaded.value = true;
    hasError.value = false;
    emit('load');
  };

  const handleError = () => {
    isLoading.value = false;
    isLoaded.value = false;
    hasError.value = true;
    emit('error');
  };

  const handleClick = () => {
    if (props.clickable) {
      emit('click');
    }
  };

  const setupIntersectionObserver = () => {
    if (!props.lazy || !imageContainer.value) return;

    observer.value = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isVisible.value) {
            isVisible.value = true;
            startLoading();
            observer.value?.disconnect();
          }
        });
      },
      {
        rootMargin: props.rootMargin,
        threshold: props.threshold,
      }
    );

    observer.value.observe(imageContainer.value);
  };

  // Watchers
  watch(
    () => props.src,
    () => {
      isLoaded.value = false;
      hasError.value = false;

      if (props.lazy && !isVisible.value) {
        setupIntersectionObserver();
      } else {
        startLoading();
      }
    },
    { immediate: true }
  );

  // Lifecycle
  onMounted(() => {
    if (props.lazy) {
      setupIntersectionObserver();
    } else {
      isVisible.value = true;
      startLoading();
    }
  });

  onUnmounted(() => {
    observer.value?.disconnect();
  });
</script>

<style lang="scss" scoped>
  .optimized-image-container {
    position: relative;
    display: inline-block;
    overflow: hidden;
    background: var(--color-surface-secondary);
    transition: all 0.3s ease;

    &.loading {
      .optimized-img {
        opacity: 0;
      }
    }

    &.loaded {
      .optimized-img {
        opacity: 1;
      }
    }

    &.error {
      background: var(--color-surface-secondary);
    }
  }

  .image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: linear-gradient(
      135deg,
      var(--color-surface-secondary) 0%,
      var(--bg-tertiary) 100%
    );
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100px;

    .placeholder-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
    }

    .error-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 8px;

      .error-text {
        font-size: 12px;
        color: #666;
        text-align: center;
      }
    }
  }

  .skeleton-placeholder {
    width: 100%;
    height: 100%;
  }

  .optimized-img {
    width: 100%;
    height: 100%;
    object-fit: v-bind('props.objectFit');
    transition: opacity 0.3s ease;
    display: block;
  }

  .loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  // Dark mode support
  body.body--dark .optimized-image-container {
    background: #2a2a2a;

    .image-placeholder {
      background: linear-gradient(135deg, #2a2a2a 0%, #333333 100%);

      .placeholder-icon {
        opacity: 0.3;
      }

      .error-text {
        color: #ccc;
      }
    }

    &.error {
      background: #2a2a2a;
    }
  }

  // Hover effects for clickable images
  .optimized-image-container.clickable {
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  // Performance optimizations
  .optimized-img {
    will-change: opacity;
    transform: translateZ(0); // Force GPU acceleration
  }

  .image-placeholder {
    will-change: opacity;
    contain: layout style paint;
  }
</style>
