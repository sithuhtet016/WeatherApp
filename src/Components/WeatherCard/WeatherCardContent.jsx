import { MapPinIcon } from '@heroicons/react/24/solid';
import GlassCard from './GlassCard.jsx';

function WeatherCardContent({ weather }) {
  const { temperature, condition, conditionIcon, conditionIconAlt, city } =
    weather;

  return (
    <GlassCard>
      <div className="text-left">
        <h2 className="text-[#0F172A] text-[28px] md:text-[32px] font-[700]">
          {temperature}
        </h2>
        <h3 className="text-[#0F172A] text-[20px] md:text-[24px] font-[600] flex items-center gap-[4px]">
          {condition}
          <span>
            <img
              className="w-[32px] md:w-[48px]"
              src={conditionIcon}
              alt={conditionIconAlt}
            />
          </span>
        </h3>
        <h1 className="text-[#0F172A] text-[24px] md:text-[36px] font-[700] text-end mt-[32px] flex items-center justify-end gap-2">
          <span>
            <MapPinIcon className="w-[16px] md:w-[24px]" />
          </span>
          {city}
        </h1>
      </div>
    </GlassCard>
  );
}

export default WeatherCardContent;
