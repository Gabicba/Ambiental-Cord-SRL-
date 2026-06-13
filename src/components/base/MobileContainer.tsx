import type { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export default function MobileContainer({ children, className = "" }: MobileContainerProps) {
  return (
    <div className="w-full max-w-[430px] min-h-screen bg-background-50 mx-auto relative overflow-hidden">
      <div className={className}>
        {children}
      </div>
    </div>
  );
}