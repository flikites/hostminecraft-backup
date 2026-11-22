import React, { useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';
import { MultiStepSignupForm } from '../auth/MultiStepSignupForm';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledSubdomain?: string;
}

export function SignupModal({ isOpen, onClose, prefilledSubdomain }: SignupModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Disable scrolling and compensate for scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-md w-full max-h-[95vh] overflow-y-auto">
        <Card variant="minecraft" className="shadow-2xl">
          {/* Close Button - Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
              className="w-10 h-10 p-0 bg-white border-2 border-stone-300 hover:border-red-400 rounded-full shadow-minecraft hover:shadow-minecraft-hover transition-all duration-200"
            />
          </div>
          
          <CardContent className="p-8 pt-12">
            <MultiStepSignupForm onClose={onClose} prefilledSubdomain={prefilledSubdomain} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}