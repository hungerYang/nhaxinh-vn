'use client';

interface AdSlotProps {
  slotId: string;
  format?: 'banner' | 'sidebar' | 'in-article';
  minHeight?: number;
  className?: string;
}

export default function AdSlot({
  slotId,
  format = 'banner',
  minHeight = 250,
  className = '',
}: AdSlotProps) {
  // Ad slots are hidden by default - structure is reserved for future AdSense integration
  return (
    <div
      className={`ad-placeholder hidden ${className}`}
      data-slot={slotId}
      data-format={format}
      style={{ minHeight }}
      aria-hidden="true"
    >
      {/* Reserved structure for Google AdSense */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXX"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
