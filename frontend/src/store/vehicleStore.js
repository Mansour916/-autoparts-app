import { create } from 'zustand'

const useVehicleStore = create((set) => ({
  // État
  selectedVehicle: null,
  searchResult: null,
  isLoading: false,
  error: null,

  // Actions
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setSearchResult: (result) => set({ searchResult: result }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error: error }),
  clearVehicle: () => set({ selectedVehicle: null, searchResult: null, error: null })
}))

export default useVehicleStore