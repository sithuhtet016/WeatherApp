import thermometerIcon from '@/assets/icons/thermometer.svg';
import humidityIcon from '@/assets/icons/humidity.svg';
import windIcon from '@/assets/icons/windy.svg';
import pressureIcon from '@/assets/icons/barometer.svg';
import hotIcon from '@/assets/icons/hot.svg';
import coldIcon from '@/assets/icons/snow.svg';
import sunriseIcon from '@/assets/icons/sunrise.svg';
import sunsetIcon from '@/assets/icons/sunset.svg';
import MetricSection from './MetricSection.jsx';

export const defaultMetrics = [
  {
    label: 'Feels like',
    value: '26°C',
    icon: thermometerIcon,
    alt: 'Thermometer icon',
  },
  { label: 'Humidity', value: '81%', icon: humidityIcon, alt: 'Humidity icon' },
  {
    label: 'Wind speed',
    value: '18 km/h SW',
    icon: windIcon,
    alt: 'Wind speed icon',
  },
  {
    label: 'Pressure',
    value: '1001 hPa',
    icon: pressureIcon,
    alt: 'Barometer icon',
  },
];

export const defaultRange = [
  { label: 'High', value: '26°C', icon: hotIcon, alt: 'High temperature icon' },
  { label: 'Low', value: '19°C', icon: coldIcon, alt: 'Low temperature icon' },
  {
    label: 'Sunrise',
    value: '6:50 AM',
    icon: sunriseIcon,
    alt: 'Sunrise icon',
  },
  { label: 'Sunset', value: '5:33 PM', icon: sunsetIcon, alt: 'Sunset icon' },
];

function KeyMetrics({ metrics = defaultMetrics, range = defaultRange }) {
  return (
    <section className="md:flex md:gap-[60px] xl:gap-[40px] xl:self-start xl:ml-auto">
      <MetricSection
        items={metrics}
        containerClassName="self-start ml-[20px] grid grid-cols-2 gap-x-[60px] gap-y-[12px] mt-[40px] xl:mt-0"
      />
      <MetricSection
        title="Today's range"
        items={range}
        containerClassName="flex flex-col self-start ml-[20px] my-[32px] xl:mt-0"
        gridClassName="grid grid-cols-2 gap-x-[36px] gap-y-[12px] mt-[8px]"
      />
    </section>
  );
}

export default KeyMetrics;
