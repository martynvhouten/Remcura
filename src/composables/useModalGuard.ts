import { ref } from 'vue';

// Lightweight modal guard to prevent nested dialogs.
// Usage: const { canOpen, open, close, isOpen } = useModalGuard();
// Call canOpen() before showing a dialog. If false, switch to step mode or serialize.

const isModalOpen = ref(false);

export function useModalGuard() {
  const canOpen = () => !isModalOpen.value;
  const open = () => {
    isModalOpen.value = true;
  };
  const close = () => {
    isModalOpen.value = false;
  };

  return { isOpen: isModalOpen, canOpen, open, close };
}


