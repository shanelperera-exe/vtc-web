import Navbar from '../components/layout/Navbar';
import Carousel from '../components/home/Carousel';
import ShopByCategory from '../components/home/ShopByCategory';
import CustomersPurchased from '../components/home/CustomersPurchased';
import Catslideshow from '../components/home/CatSlideshow';
import CustomerReviewsSection from '../components/home/customerReviewsSection';
import ValueProps from '../components/home/ValueProps';
import FeaturedProducts from '../components/home/FeaturedProducts';
import NewArrivals from '../components/home/NewArrivals';
import BrandsMarquee from '../components/home/BrandsMarquee';
import Newsletter from '../components/home/Newsletter';

function Home() {
	return (
		<div>
			<Navbar/>
			<Carousel/>
			<ShopByCategory/>
			<ValueProps/>
			<FeaturedProducts/>
			<BrandsMarquee/>
			<CustomersPurchased/>
			<CustomerReviewsSection/>
			<NewArrivals/>
			<Catslideshow/>
			<Newsletter/>
		</div>
	);
}

export default Home;

