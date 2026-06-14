import Hero from '../components/home/Hero';
import ServicesSection from '../components/home/ServicesSection';
import StatsSection from '../components/home/StatsSection';
import WhyChooseUs from '../components/home/WhyChooseUs';

const Home = () => {
  return (
    <div className="pt-16">
      <Hero />
      <ServicesSection />
      <StatsSection />
      <WhyChooseUs />
    </div>
  );
};

export default Home;
