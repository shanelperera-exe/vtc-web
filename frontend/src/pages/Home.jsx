import Navbar from '../components/layout/Navbar';
import Carousel from '../components/home/Carousel';
import ShopByCategory from '../components/home/ShopByCategory';
import CustomersPurchased from '../components/home/CustomersPurchased';
import Catslideshow from '../components/home/CatSlideshow';

function Home() {
	return (
		<div>
			<Navbar/>
			<Carousel/>
			<ShopByCategory/>
			<CustomersPurchased/>
			<Catslideshow/>
		</div>
	);
}

export default Home;

