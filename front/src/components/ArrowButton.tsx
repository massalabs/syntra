export function ArrowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="p-2 rounded-full bg-white hover:bg-gray-200 
                 text-primary hover:ring-1 ring-primary transition-all 
                 duration-100 ease-in-out active:translate-y-1"
      onClick={onClick}
    >
      ↓
    </button>
  );
}
