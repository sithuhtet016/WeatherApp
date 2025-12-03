function MetricItem({ label, value, icon, alt }) {
  return (
    <div className="flex flex-col items-start gap-[4px]">
      <h5 className="flex text-[#64748B] text-[14px] font-[500] gap-[4px] items-center">
        {label}
        <img className="w-[24px] text-[#64748B]" src={icon} alt={alt} />
      </h5>
      <p className="text-[#0F172A] text-[16px] font-[500]">{value}</p>
    </div>
  );
}

export default MetricItem;
