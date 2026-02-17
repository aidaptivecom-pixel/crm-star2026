export const TasacionWeb = () => {
  return (
    <div className="fixed inset-0 left-[240px] max-lg:left-0 z-10 bg-white">
      <iframe
        src="/tasacion-embed.html"
        className="w-full h-full border-0"
        title="Tasación Web - Star Real Estate"
      />
    </div>
  )
}
