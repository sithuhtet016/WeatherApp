function GlassCard({ children, className = '', ...props }) {
  const baseClasses =
    'max-w-md w-full min-w-[358px] md:min-w-[448px] bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 rounded-[28px] p-[28px] mx-auto mt-[100px] xl:m-0';

  return (
    <article className={`${baseClasses} ${className}`.trim()} {...props}>
      {children}
    </article>
  );
}

export default GlassCard;
