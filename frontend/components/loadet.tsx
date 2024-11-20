import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "small" | "medium" | "large";
}

export default function Loader({ size = "medium" }: LoaderProps) {
  const sizeClasses = {
    small: "w-8 h-8 p-1",
    medium: "w-12 h-12 p-2",
    large: "w-16 h-16 p-3",
  };

  return (
    <div className="flex items-center mt-32 justify-center">
      <div
        className={`relative flex items-center justify-center ${sizeClasses[size]} p-2 bg-slate-700 rounded-full`}
      >
        <Loader2 className="w-full h-full dark:text-blue-500 animate-spin font-semibold" />
      </div> 
    </div>
  );
}
