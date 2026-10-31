import { Search } from 'lucide-react';

interface AdminSearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export default function AdminSearchInput({ value, placeholder, onChange }: AdminSearchInputProps) {
  return (
    <div className="relative w-full md:max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pr-3 pl-9 text-sm text-white placeholder:text-gray-600 focus:border-red-500/40 focus:outline-none"
      />
    </div>
  );
}
