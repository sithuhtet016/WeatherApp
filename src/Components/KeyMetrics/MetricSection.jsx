import MetricItem from './MetricItem.jsx';

function MetricSection({
  title,
  items = [],
  containerClassName = '',
  titleClassName = 'text-left text-[#64748B] text-[14px] font-[500]',
  gridClassName,
}) {
  const content = items.map((metric) => (
    <MetricItem key={metric.label} {...metric} />
  ));

  return (
    <div className={containerClassName}>
      {title && <h4 className={titleClassName}>{title}</h4>}
      {gridClassName ? <div className={gridClassName}>{content}</div> : content}
    </div>
  );
}

export default MetricSection;
