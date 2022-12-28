import { acceptHMRUpdate, defineStore } from 'pinia';
import { useStorage } from '@vueuse/core'

export const useDeviceStore = defineStore('device', () => {
  /**
   * Current name of the user.
   */
  const selectDevice = useStorage('selectDevice', '')

  function setDevice(name: string) {
    selectDevice.value = name
  }

  return {
    setDevice,
    selectDevice,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
