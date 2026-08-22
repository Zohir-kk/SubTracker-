import * as LucideIcons from "lucide-react";

export function Icon({ name, className, size = 16, color = "currentColor" }) {
  const Comp = LucideIcons[name] || LucideIcons.CircleHelp;
  return <Comp className={className ? className + " notranslate" : "notranslate"} size={size} color={color} aria-hidden="true" translate="no" />;
}
