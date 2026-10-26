/** Phone-sized stage shared by the mobile prototypes */
export function PhoneStage({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="relative h-[600px] w-full max-w-[340px] overflow-hidden rounded-[34px] border-[6px] border-[#16181d] bg-surface shadow-[var(--shadow-float)]"
    >
      {children}
    </div>
  );
}
