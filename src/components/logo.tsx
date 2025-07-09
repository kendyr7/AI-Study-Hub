import { BrainCircuit } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold text-lg">
      <BrainCircuit className="h-6 w-6 text-primary" />
      <span className="font-headline">AI Study Hub</span>
    </div>
  );
}
