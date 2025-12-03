import sunnyCondition from '@/assets/icons/sunny.svg';
import './WeatherCard.css';
import WeatherCardContent from './WeatherCardContent.jsx';
import WeatherCardPlaceholder from './WeatherCardPlaceholder.jsx';

export const defaultWeather = {
  temperature: '26°C',
  condition: 'Sunny',
  conditionIcon: sunnyCondition,
  conditionIconAlt: 'Sunny weather condition with clear skies',
  city: 'Abu Dhabi',
};

function WeatherCard({
  weather = defaultWeather,
  showPlaceholder = false,
  isLoading = false,
}) {
  return (
    <section className="xl:flex xl:row-span-2 xl:self-center xl:mt-[96px]">
      {showPlaceholder ? (
        <WeatherCardPlaceholder isLoading={isLoading} />
      ) : (
        <WeatherCardContent weather={weather} />
      )}
    </section>
  );
}

export default WeatherCard;
