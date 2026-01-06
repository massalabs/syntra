import { FiChevronDown } from 'react-icons/fi';

export function ArrowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="
        group
        p-3 rounded-full 
        bg-white/90 backdrop-blur-sm
        shadow-lg hover:shadow-xl
        border border-gray-100
        text-primary 
        transition-all duration-300 ease-out
        hover:bg-white hover:scale-110
        active:scale-95
        animate-bounce-subtle
      "
      onClick={onClick}
      aria-label="Scroll to schedules"
    >
      <FiChevronDown
        size={24}
        className="transition-transform duration-300 group-hover:translate-y-0.5"
      />
    </button>
  );
}
