import Navbar from '../components/layout/Navbar';
import Carousel from '../components/home/Carousel';
import ShopByCategory from '../components/home/ShopByCategory';
import CustomersPurchased from '../components/home/CustomersPurchased';
import Catslideshow from '../components/home/CatSlideshow';
import CustomerReviewsSection from '../components/home/customerReviewsSection';

function Home() {
	return (
		<div>
			<Navbar/>
			<Carousel/>
			<ShopByCategory/>
			<CustomersPurchased/>
			<CustomerReviewsSection/>
			<Catslideshow/>
		</div>
	);
}

export default Home;

