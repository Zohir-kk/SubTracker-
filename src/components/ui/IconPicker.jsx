import { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Icon } from "./Icon";
import { cn } from "../../lib/utils";

const allIcons = Object.keys(LucideIcons).filter(name => /^[A-Z]/.test(name));

const DEFAULT_ICONS = [
  "Wifi", "MonitorPlay", "Film", "Bus", "Car", "Plane", 
  "Briefcase", "Dumbbell", "ShoppingBag", "Coffee", "Gift", 
  "Lightbulb", "Book", "Music", "Gamepad2", "Tv", "Cloud", 
  "Server", "Database", "Smartphone", "Headphones", "Star", 
  "Heart", "Zap", "Globe", "Bot", "Brain", "Cpu", "Shield", 
  "Lock", "Key", "Code", "Terminal", "GraduationCap", 
  "BookOpen", "Wrench", "Home", "Building", "BriefcaseBusiness", 
  "ShoppingCart", "CreditCard", "Wallet", "PiggyBank"
];

export function IconPicker({ selected, onSelect }) {
  const [search, setSearch] = useState("");
  
  const displayedIcons = useMemo(() => {
    if (!search.trim()) return DEFAULT_ICONS;
    const lower = search.toLowerCase();
    return allIcons.filter(name => name.toLowerCase().includes(lower)).slice(0, 40);
  }, [search]);

  return (
    <div className="flex flex-col gap-2 mt-1.5 mb-2.5">
      <div className="relative">
         <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint">
           <Icon name="Search" size={14} />
         </div>
         <input 
           type="text" 
           value={search} 
           onChange={e => setSearch(e.target.value)}
           placeholder="Search icons..." 
           className="w-full bg-bg-3 border border-border-2 rounded-lg pl-8 pr-3 py-1.5 text-xs text-text focus:border-gold outline-none transition-colors"
         />
      </div>
      <div className="grid gap-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))" }}>
        {displayedIcons.map((icon) => (
          <button
            key={icon}
            onClick={(e) => { e.preventDefault(); onSelect(icon); }}
            className={cn(
              "w-9 h-9 rounded-lg cursor-pointer flex items-center justify-center p-0 transition-all duration-150 border",
              selected === icon
                ? "border-2 border-gold bg-gold-dim text-gold"
                : "border border-border-2 bg-bg-3 text-text-faint hover:text-text hover:border-border",
            )}
            title={icon}
          >
            <Icon name={icon} size={18} />
          </button>
        ))}
        {displayedIcons.length === 0 && (
          <div className="col-span-full text-center text-xs text-text-faint py-4">
            No icons found
          </div>
        )}
      </div>
    </div>
  );
}
