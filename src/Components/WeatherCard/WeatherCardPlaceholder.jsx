import tempLineGraphic from '@/assets/icons/temp-line.svg';
import weatherConditionLine from '@/assets/icons/weather-condition-line.svg';
import weatherConditionIcon from '@/assets/icons/weather-condition-icon.svg';
import cityLineGraphic from '@/assets/icons/city-line.svg';
import GlassCard from './GlassCard.jsx';

function WeatherCardPlaceholder({ isLoading }) {
  const animateLines = Boolean(isLoading);
  return (
    <GlassCard aria-live="polite">
      <div className="text-left">
        <h2 className="text-[#0F172A] text-[28px] font-[700]">
          <img
            src={tempLineGraphic}
            alt="Temperature trend"
            className={`line-graphic ${
              animateLines ? 'line-graphic--animate' : ''
            }`}
          />
        </h2>
        <h3 className="text-[#0F172A] text-[20px] font-[600] flex items-center gap-[4px] mt-[16px]">
          <img
            src={weatherConditionLine}
            alt="Weather condition"
            className={`line-graphic ${
              animateLines ? 'line-graphic--animate line-graphic--delay' : ''
            }`}
          />
          <span>
            <img
              className={`w-[32px] ml-[8px] ${
                animateLines ? 'icon-graphic icon-graphic--animate' : ''
              }`}
              src={weatherConditionIcon}
              alt="Weather condition icon"
            />
          </span>
        </h3>
        <h1 className="text-[#0F172A] text-[24px] font-[700] text-end mt-[32px] flex items-center justify-end gap-2">
          <img
            className={`mt-[20px] ${
              animateLines
                ? 'line-graphic line-graphic--animate line-graphic--slow'
                : ''
            }`}
            src={cityLineGraphic}
            alt="City skyline"
          />
        </h1>
      </div>
    </GlassCard>
  );
}

export default WeatherCardPlaceholder;
