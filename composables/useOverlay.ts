export const useOverlay = () => {
  const overlaySection = useState<string | null>('overlaySection', () => null)

  const setOverlay = (section: string | null) => {
    overlaySection.value = section
  }

  return {
    overlaySection: readonly(overlaySection),
    setOverlay
  }
}
