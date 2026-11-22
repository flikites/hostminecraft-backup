import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-minecraft">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-grass-500 focus:ring-inset"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-minecraft font-bold text-lg text-minecraft-800 pr-4">
            {question}
          </h3>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-stone-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-500 flex-shrink-0" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-stone-600 font-minecraft leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  items: Array<{ question: string; answer: string }>;
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      if (allowMultiple) {
        return prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index];
      } else {
        return prev.includes(index) ? [] : [index];
      }
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openItems.includes(index)}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  );
}